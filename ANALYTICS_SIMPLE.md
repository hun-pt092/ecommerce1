# 📊 Hệ Thống Thống Kê Đơn Giản & Hiệu Quả

## 🎯 Mục Tiêu

Xây dựng hệ thống analytics **đơn giản, dễ hiểu** cho ecommerce:
- ✅ Theo dõi doanh thu thực tế (đã trừ voucher)
- ✅ Biết khách hàng VIP
- ✅ Tìm sản phẩm bán chạy
- ✅ Xem xu hướng qua biểu đồ

**LƯU Ý QUAN TRỌNG**: 
- ⚠️ Doanh thu = `total_price` trong Order (đã trừ voucher rồi)
- ⚠️ Chỉ tính đơn hàng có `payment_status = 'paid'`
- ⚠️ `discount_amount` là tiền đã giảm từ voucher

---

## 📈 I. THỐNG KÊ DOANH THU

### 1. Dashboard Tổng Quan

**File**: `shop/views.py`

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Order, OrderItem, User
from .views import IsAdminUser

class RevenueAnalyticsView(APIView):
    """
    Thống kê doanh thu tổng quan
    GET /api/shop/admin/analytics/revenue/?period=month
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        period = request.query_params.get('period', 'month')
        now = timezone.now()
        
        # Xác định khoảng thời gian
        if period == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0)
        else:  # month (default)
            start_date = now.replace(day=1, hour=0, minute=0, second=0)
        
        # Lấy đơn hàng đã thanh toán
        completed_orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lte=now,
            payment_status='paid'
        )
        
        # TÍNH TOÁN METRICS
        # 1. Doanh thu thực tế (đã trừ voucher)
        total_revenue = completed_orders.aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        # 2. Tổng giảm giá (voucher)
        total_discount = completed_orders.aggregate(
            total=Sum('discount_amount')
        )['total'] or 0
        
        # 3. Doanh thu trước giảm giá
        revenue_before_discount = total_revenue + total_discount
        
        # 4. Số đơn hàng
        total_orders = completed_orders.count()
        
        # 5. Giá trị đơn hàng trung bình (AOV)
        aov = total_revenue / total_orders if total_orders > 0 else 0
        
        # 6. Tổng sản phẩm đã bán
        total_products_sold = OrderItem.objects.filter(
            order__in=completed_orders
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # 7. So sánh với kỳ trước
        period_days = (now - start_date).days
        previous_start = start_date - timedelta(days=period_days)
        previous_end = start_date
        
        previous_revenue = Order.objects.filter(
            created_at__gte=previous_start,
            created_at__lt=previous_end,
            payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        revenue_growth = 0
        if previous_revenue > 0:
            revenue_growth = ((total_revenue - previous_revenue) / previous_revenue * 100)
        
        return Response({
            'period': period,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': now.strftime('%Y-%m-%d'),
            'summary': {
                'total_revenue': float(total_revenue),  # Doanh thu sau giảm giá
                'revenue_before_discount': float(revenue_before_discount),  # Trước giảm giá
                'total_discount': float(total_discount),  # Tổng voucher
                'total_orders': total_orders,
                'total_products_sold': total_products_sold,
                'average_order_value': round(float(aov), 2),
                'revenue_growth_percent': round(revenue_growth, 2),
                'previous_period_revenue': float(previous_revenue),
            }
        })
```

---

### 2. Doanh Thu Theo Thời Gian (Cho Biểu Đồ)

```python
class RevenueTimelineView(APIView):
    """
    Doanh thu theo ngày (cho biểu đồ Line Chart)
    GET /api/shop/admin/analytics/revenue/timeline/?days=30
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models.functions import TruncDate
        
        # Số ngày muốn xem
        days = int(request.query_params.get('days', 30))
        now = timezone.now()
        start_date = now - timedelta(days=days)
        
        # Lấy doanh thu theo ngày
        daily_revenue = Order.objects.filter(
            created_at__gte=start_date,
            payment_status='paid'
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('total_price'),
            orders=Count('id'),
            discount=Sum('discount_amount')
        ).order_by('date')
        
        # Format cho chart
        chart_data = []
        for item in daily_revenue:
            chart_data.append({
                'date': item['date'].strftime('%Y-%m-%d'),
                'revenue': float(item['revenue'] or 0),
                'orders': item['orders'],
                'discount': float(item['discount'] or 0)
            })
        
        # Tổng kết
        total_revenue = sum(item['revenue'] for item in chart_data)
        total_orders = sum(item['orders'] for item in chart_data)
        
        return Response({
            'days': days,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': now.strftime('%Y-%m-%d'),
            'timeline': chart_data,
            'summary': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'average_daily_revenue': total_revenue / len(chart_data) if chart_data else 0
            }
        })
```

---

## 👥 II. THỐNG KÊ KHÁCH HÀNG

### 1. Top Khách Hàng VIP (Có Phân Hạng)

```python
class TopCustomersView(APIView):
    """
    Top khách hàng VIP với phân hạng
    GET /api/shop/admin/analytics/customers/top/?limit=20&sort=spent
    
    Query params:
        - limit: Số lượng khách hàng (default: 20)
        - sort: Sắp xếp theo 'spent' (chi tiêu) hoặc 'orders' (số đơn)
    
    Phân hạng VIP:
        - Diamond (💎): Chi tiêu >= 50 triệu
        - Platinum (🏆): Chi tiêu >= 20 triệu
        - Gold (🥇): Chi tiêu >= 10 triệu
        - Silver (🥈): Chi tiêu >= 5 triệu
        - Bronze (🥉): Chi tiêu >= 2 triệu
        - Regular: Dưới 2 triệu
    """
    permission_classes = [IsAdminUser]
    
    def get_vip_tier(self, total_spent):
        """Xác định hạng VIP dựa vào tổng chi tiêu"""
        if total_spent >= 50000000:  # 50 triệu
            return {'tier': 'Diamond', 'icon': '💎', 'color': '#b9f2ff'}
        elif total_spent >= 20000000:  # 20 triệu
            return {'tier': 'Platinum', 'icon': '🏆', 'color': '#e5e4e2'}
        elif total_spent >= 10000000:  # 10 triệu
            return {'tier': 'Gold', 'icon': '🥇', 'color': '#ffd700'}
        elif total_spent >= 5000000:  # 5 triệu
            return {'tier': 'Silver', 'icon': '🥈', 'color': '#c0c0c0'}
        elif total_spent >= 2000000:  # 2 triệu
            return {'tier': 'Bronze', 'icon': '🥉', 'color': '#cd7f32'}
        else:
            return {'tier': 'Regular', 'icon': '👤', 'color': '#808080'}
    
    def get(self, request):
        limit = int(request.query_params.get('limit', 20))
        sort_by = request.query_params.get('sort', 'spent')
        
        # Lấy tất cả khách hàng có đơn hàng
        customers = User.objects.filter(
            orders__payment_status='paid'
        ).annotate(
            total_spent=Sum('orders__total_price'),
            total_orders=Count('orders', filter=Q(orders__payment_status='paid'))
        ).filter(
            total_orders__gt=0
        )
        
        # Sắp xếp
        if sort_by == 'orders':
            customers = customers.order_by('-total_orders', '-total_spent')
            sort_label = "số đơn hàng"
        else:  # spent (default)
            customers = customers.order_by('-total_spent', '-total_orders')
            sort_label = "chi tiêu"
        
        customers = customers[:limit]
        
        # Format data với phân hạng VIP
        customers_data = []
        vip_count = {
            'Diamond': 0, 'Platinum': 0, 'Gold': 0, 
            'Silver': 0, 'Bronze': 0, 'Regular': 0
        }
        
        for customer in customers:
            total_spent = float(customer.total_spent or 0)
            avg_order = total_spent / customer.total_orders if customer.total_orders > 0 else 0
            
            # Xác định hạng VIP
            vip_info = self.get_vip_tier(total_spent)
            vip_count[vip_info['tier']] += 1
            
            customers_data.append({
                'id': customer.id,
                'username': customer.username,
                'email': customer.email,
                'phone_number': customer.phone_number,
                'total_spent': total_spent,
                'total_orders': customer.total_orders,
                'average_order_value': round(float(avg_order), 2),
                # Thông tin VIP
                'vip_tier': vip_info['tier'],
                'vip_icon': vip_info['icon'],
                'vip_color': vip_info['color'],
            })
        
        return Response({
            'sort_by': sort_by,
            'sort_label': f"Top khách hàng theo {sort_label}",
            'top_customers': customers_data,
            'total': len(customers_data),
            # Thống kê phân hạng
            'vip_tiers_count': vip_count,
            'vip_tiers_info': {
                'Diamond': {'min_spent': 50000000, 'icon': '💎'},
                'Platinum': {'min_spent': 20000000, 'icon': '🏆'},
                'Gold': {'min_spent': 10000000, 'icon': '🥇'},
                'Silver': {'min_spent': 5000000, 'icon': '🥈'},
                'Bronze': {'min_spent': 2000000, 'icon': '🥉'},
                'Regular': {'min_spent': 0, 'icon': '👤'},
            }
        })
```

**Bảng Phân Hạng VIP:**

| Hạng | Icon | Ngưỡng Chi Tiêu | Ưu Đãi Gợi Ý |
|------|------|-----------------|---------------|
| 💎 **Diamond** | 💎 | ≥ 50 triệu | Giảm 20%, Freeship, Quà cao cấp |
| 🏆 **Platinum** | 🏆 | ≥ 20 triệu | Giảm 15%, Freeship, Ưu tiên |
| 🥇 **Gold** | 🥇 | ≥ 10 triệu | Giảm 10%, Freeship |
| 🥈 **Silver** | 🥈 | ≥ 5 triệu | Giảm 7%, Freeship đơn >500k |
| 🥉 **Bronze** | 🥉 | ≥ 2 triệu | Giảm 5% |
| 👤 **Regular** | 👤 | < 2 triệu | Khách hàng thường |

*Lưu ý: Bạn có thể điều chỉnh ngưỡng trong hàm `get_vip_tier()`*

---

### 2. Thống Kê Khách Hàng Mới

```python
class NewCustomersStatsView(APIView):
    """
    Thống kê khách hàng mới
    GET /api/shop/admin/analytics/customers/new/?days=30
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models.functions import TruncDate
        
        days = int(request.query_params.get('days', 30))
        now = timezone.now()
        start_date = now - timedelta(days=days)
        
        # Khách hàng mới theo ngày
        new_customers = User.objects.filter(
            date_joined__gte=start_date
        ).annotate(
            date=TruncDate('date_joined')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        chart_data = []
        for item in new_customers:
            chart_data.append({
                'date': item['date'].strftime('%Y-%m-%d'),
                'new_customers': item['count']
            })
        
        # Khách hàng đã mua hàng (conversion rate)
        total_new = User.objects.filter(date_joined__gte=start_date).count()
        customers_with_orders = User.objects.filter(
            date_joined__gte=start_date,
            orders__payment_status='paid'
        ).distinct().count()
        
        conversion_rate = (customers_with_orders / total_new * 100) if total_new > 0 else 0
        
        return Response({
            'timeline': chart_data,
            'summary': {
                'total_new_customers': total_new,
                'customers_with_orders': customers_with_orders,
                'conversion_rate': round(conversion_rate, 2)
            }
        })
```

---

## 📦 III. THỐNG KÊ SẢN PHẨM

### 1. Sản Phẩm Bán Chạy

```python
class BestSellingProductsView(APIView):
    """
    Top sản phẩm bán chạy
    GET /api/shop/admin/analytics/products/best-sellers/?limit=20
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import F
        
        limit = int(request.query_params.get('limit', 20))
        
        # Lấy sản phẩm bán chạy
        best_sellers = OrderItem.objects.filter(
            order__payment_status='paid'
        ).values(
            'product_variant__product__id',
            'product_variant__product__name',
            'product_variant__product__category__name',
            'product_variant__product__brand__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price_per_item')),
            order_count=Count('order', distinct=True)
        ).order_by('-total_quantity')[:limit]
        
        products_data = []
        for item in best_sellers:
            products_data.append({
                'product_id': item['product_variant__product__id'],
                'product_name': item['product_variant__product__name'],
                'category': item['product_variant__product__category__name'],
                'brand': item['product_variant__product__brand__name'],
                'total_sold': item['total_quantity'],
                'total_revenue': float(item['total_revenue'] or 0),
                'order_count': item['order_count']
            })
        
        return Response({
            'best_sellers': products_data,
            'total': len(products_data)
        })
```

---

### 2. Phân Tích Theo Danh Mục

```python
class CategoryRevenueView(APIView):
    """
    Doanh thu theo danh mục (cho Pie Chart)
    GET /api/shop/admin/analytics/categories/revenue/
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import F
        from .models import Category
        
        # Doanh thu theo category
        category_revenue = OrderItem.objects.filter(
            order__payment_status='paid'
        ).values(
            'product_variant__product__category__id',
            'product_variant__product__category__name'
        ).annotate(
            revenue=Sum(F('quantity') * F('price_per_item')),
            quantity_sold=Sum('quantity'),
            order_count=Count('order', distinct=True)
        ).order_by('-revenue')
        
        categories_data = []
        total_revenue = 0
        
        for item in category_revenue:
            if item['product_variant__product__category__name']:
                revenue = float(item['revenue'] or 0)
                total_revenue += revenue
                
                categories_data.append({
                    'category_id': item['product_variant__product__category__id'],
                    'category_name': item['product_variant__product__category__name'],
                    'revenue': revenue,
                    'quantity_sold': item['quantity_sold'],
                    'order_count': item['order_count']
                })
        
        # Tính phần trăm
        for cat in categories_data:
            cat['percentage'] = round((cat['revenue'] / total_revenue * 100), 2) if total_revenue > 0 else 0
        
        return Response({
            'categories': categories_data,
            'total_revenue': total_revenue
        })
```

---

## 🔗 IV. THÊM VÀO URLs

**File**: `shop/urls.py`

```python
from .views import (
    # ... existing imports ...
    RevenueAnalyticsView, RevenueTimelineView,
    TopCustomersView, NewCustomersStatsView,
    BestSellingProductsView, CategoryRevenueView,
)

urlpatterns = [
    # ... existing urls ...
    
    # Analytics APIs
    path('admin/analytics/revenue/', RevenueAnalyticsView.as_view(), name='analytics_revenue'),
    path('admin/analytics/revenue/timeline/', RevenueTimelineView.as_view(), name='analytics_timeline'),
    path('admin/analytics/customers/top/', TopCustomersView.as_view(), name='analytics_top_customers'),
    path('admin/analytics/customers/new/', NewCustomersStatsView.as_view(), name='analytics_new_customers'),
    path('admin/analytics/products/best-sellers/', BestSellingProductsView.as_view(), name='analytics_best_sellers'),
    path('admin/analytics/categories/revenue/', CategoryRevenueView.as_view(), name='analytics_category_revenue'),
]
```

---

## 📊 V. FRONTEND - BIỂU ĐỒ

### 1. Cài Đặt Thư Viện

```bash
cd ecommerce-frontend
npm install recharts
```

### 2. Revenue Chart Component

**File**: `src/components/admin/charts/RevenueChart.js`

```jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { apiClient } from '../../../api/apiClient';

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/shop/admin/analytics/revenue/timeline/?days=${days}`
      );
      setData(response.data.timeline);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="revenue-chart-container">
      <div className="chart-header">
        <h3>📈 Doanh Thu Theo Ngày</h3>
        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value={7}>7 ngày</option>
          <option value={30}>30 ngày</option>
          <option value={90}>90 ngày</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value) => value.toLocaleString('vi-VN') + 'đ'}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#8884d8" 
            name="Doanh thu"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
```

---

### 3. Category Pie Chart

**File**: `src/components/admin/charts/CategoryChart.js`

```jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { apiClient } from '../../../api/apiClient';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CategoryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shop/admin/analytics/categories/revenue/');
      const formattedData = response.data.categories.map(cat => ({
        name: cat.category_name,
        value: cat.revenue
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="category-chart-container">
      <h3>📊 Doanh Thu Theo Danh Mục</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.percentage}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + 'đ'} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
```

---

### 4. Analytics Dashboard Page

**File**: `src/pages/admin/AnalyticsDashboard.js`

```jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import CategoryChart from '../../components/admin/charts/CategoryChart';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/shop/admin/analytics/revenue/?period=${period}`
      );
      setStats(response.data.summary);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="analytics-dashboard">
      <h1>📊 Thống Kê & Phân Tích</h1>

      {/* Period Selector */}
      <div className="period-selector">
        <button onClick={() => setPeriod('today')} className={period === 'today' ? 'active' : ''}>
          Hôm nay
        </button>
        <button onClick={() => setPeriod('week')} className={period === 'week' ? 'active' : ''}>
          7 ngày
        </button>
        <button onClick={() => setPeriod('month')} className={period === 'month' ? 'active' : ''}>
          Tháng này
        </button>
        <button onClick={() => setPeriod('year')} className={period === 'year' ? 'active' : ''}>
          Năm này
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>💰 Doanh Thu</h3>
          <p className="kpi-value">
            {stats.total_revenue.toLocaleString('vi-VN')}đ
          </p>
          <span className={`kpi-change ${stats.revenue_growth_percent >= 0 ? 'positive' : 'negative'}`}>
            {stats.revenue_growth_percent >= 0 ? '↑' : '↓'} {Math.abs(stats.revenue_growth_percent)}%
          </span>
        </div>

        <div className="kpi-card">
          <h3>🎟️ Giảm Giá</h3>
          <p className="kpi-value">
            {stats.total_discount.toLocaleString('vi-VN')}đ
          </p>
        </div>

        <div className="kpi-card">
          <h3>📦 Đơn Hàng</h3>
          <p className="kpi-value">{stats.total_orders}</p>
        </div>

        <div className="kpi-card">
          <h3>📊 AOV</h3>
          <p className="kpi-value">
            {stats.average_order_value.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <RevenueChart />
        </div>

        <div className="chart-card">
          <CategoryChart />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
```

---

### 5. CSS Styling

**File**: `src/pages/admin/AnalyticsDashboard.css`

```css
.analytics-dashboard {
  padding: 20px;
}

.period-selector {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.period-selector button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 5px;
}

.period-selector button.active {
  background: #007bff;
  color: white;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.kpi-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.kpi-card h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.kpi-value {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
}

.kpi-change {
  font-size: 14px;
  font-weight: bold;
}

.kpi-change.positive {
  color: #28a745;
}

.kpi-change.negative {
  color: #dc3545;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
```

---

## 🚀 VI. CÁCH SỬ DỤNG

### 1. Thêm Views vào Backend
- Copy các view classes vào `shop/views.py`
- Thêm imports cần thiết

### 2. Cập nhật URLs
- Thêm các URL patterns vào `shop/urls.py`

### 3. Test APIs
```bash
# Trong PowerShell
cd D:\eommerce_check\ecommerce_project
python manage.py runserver

# Test với curl hoặc browser:
# http://127.0.0.1:8000/api/shop/admin/analytics/revenue/?period=month
```

### 4. Frontend Setup
```bash
cd ecommerce-frontend
npm install recharts
# Tạo các components như trên
npm start
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Phase 1: Backend (1 ngày)
- [  ] Thêm 6 Analytics Views vào `views.py`
- [  ] Cập nhật `urls.py`
- [  ] Test các API endpoints
- [  ] Kiểm tra tính toán doanh thu đúng (có trừ voucher)

### Phase 2: Frontend Charts (1 ngày)
- [  ] Install recharts
- [  ] Tạo RevenueChart component
- [  ] Tạo CategoryChart component
- [  ] Tạo AnalyticsDashboard page
- [  ] Styling với CSS

### Phase 3: Integration (0.5 ngày)
- [  ] Connect frontend với backend APIs
- [  ] Test toàn bộ flow
- [  ] Fix bugs (nếu có)

---

## 💡 LƯU Ý QUAN TRỌNG

### 1. Về Doanh Thu
```python
# ĐÚNG: Doanh thu sau giảm giá (đã lưu trong DB)
total_revenue = Order.objects.filter(
    payment_status='paid'
).aggregate(total=Sum('total_price'))['total']

# SAI: Tính lại từ OrderItem (không tính voucher)
# Không dùng cách này!
```

### 2. Về Payment Status
- Chỉ tính đơn hàng `payment_status='paid'`
- Không tính đơn `pending`, `failed`, `refunded`

### 3. Về Discount Amount
- `discount_amount` đã được lưu khi tạo Order
- Không cần tính lại

### 4. Performance
- Nếu data nhiều, thêm index:
```python
# shop/models.py
class Order(models.Model):
    # ...
    class Meta:
        indexes = [
            models.Index(fields=['-created_at', 'payment_status']),
        ]
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành, bạn sẽ có:
- ✅ Dashboard hiển thị doanh thu thực tế
- ✅ Biểu đồ Line Chart theo dõi xu hướng
- ✅ Biểu đồ Pie Chart phân tích danh mục
- ✅ Danh sách Top khách hàng VIP
- ✅ Thống kê sản phẩm bán chạy
- ✅ Responsive, đẹp, dễ sử dụng

**Đơn giản nhưng đầy đủ chức năng cần thiết!** 🎉
