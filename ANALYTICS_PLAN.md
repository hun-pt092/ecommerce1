# 📊 Hệ Thống Thống Kê Doanh Số & Khách Hàng (Sales & Customer Analytics)

## 🎯 Mục Tiêu

Xây dựng hệ thống phân tích **đơn giản, dễ sử dụng** để:
- ✅ Biết hiệu quả kinh doanh (doanh thu thực tế sau giảm giá)
- ✅ Xác định khách hàng VIP và tiềm năng
- ✅ Phát hiện sản phẩm bán chạy
- ✅ Theo dõi xu hướng theo thời gian

**Lưu ý**: Tính doanh thu phải **trừ discount_amount** (voucher giảm giá) để có doanh thu thực tế!

---

## 📈 I. THỐNG KÊ DOANH THU (Revenue Analytics)

### 1. **Dashboard Tổng Quan (Đơn Giản)**

#### Backend API:
```python
# shop/views.py - Thêm các view mới

class RevenueAnalyticsView(APIView):
    """
    API Thống kê doanh thu tổng quan (ĐƠNGIẢN)
    GET /api/shop/admin/analytics/revenue/
    Query params:
        - period: 'today', 'week', 'month', 'year' (default: 'month')
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count, Avg, Q
        from django.utils import timezone
        from datetime import timedelta
        
        period = request.query_params.get('period', 'month')
        now = timezone.now()
        
        # Xác định khoảng thời gian
        if period == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:  # month
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Lấy đơn hàng đã THANH TOÁN (paid)
        completed_orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lte=now,
            payment_status='paid'
        )
        
        # Tính doanh thu THỰC TẾ (đã trừ voucher)
        # total_price trong Order đã là giá sau khi áp dụng voucher rồi!
        total_revenue = completed_orders.aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        # Tổng giảm giá từ voucher
        total_discount = completed_orders.aggregate(
            total=Sum('discount_amount')
        )['total'] or 0
        
        # Doanh thu trước giảm giá
        revenue_before_discount = total_revenue + total_discount
        
        # Số đơn hàng
        total_orders = completed_orders.count()
        
        # Giá trị đơn hàng trung bình (AOV)
        aov = total_revenue / total_orders if total_orders > 0 else 0
        
        # Tổng sản phẩm đã bán
        total_products_sold = OrderItem.objects.filter(
            order__in=completed_orders
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # So sánh với kỳ trước
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
                'total_revenue': float(total_revenue),  # Doanh thu thực tế (sau giảm giá)
                'revenue_before_discount': float(revenue_before_discount),  # Doanh thu trước giảm giá
                'total_discount': float(total_discount),  # Tổng giảm giá
                'total_orders': total_orders,
                'total_products_sold': total_products_sold,
                'average_order_value': round(float(aov), 2),
                'revenue_growth_percent': round(revenue_growth, 2),
                'previous_period_revenue': float(previous_revenue),
            }
        })
```

#### Metrics Hiển Thị:
- 💰 **Doanh thu thực tế**: Sau khi trừ voucher
- 🎟️ **Tổng giảm giá**: Tiền voucher đã sử dụng
- 📦 **Đơn hàng**: Tổng số đơn đã thanh toán
- 📊 **AOV**: Giá trị đơn hàng trung bình
- 📈 **Tăng trưởng**: So với kỳ trước

---

### 2. **Doanh Thu Theo Thời Gian (Revenue Timeline) - CHO BIỂU ĐỒ**

```python
class RevenueTimelineView(APIView):
    """
    API Doanh thu theo thời gian (ĐƠN GIẢN cho biểu đồ)
    GET /api/shop/admin/analytics/revenue/timeline/
    Query params:
        - days: số ngày lấy về (default: 30)
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncDate
        from datetime import timedelta
        
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
            revenue=Sum('total_price'),  # Doanh thu sau voucher
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
        
        return Response({
            'days': days,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': now.strftime('%Y-%m-%d'),
            'timeline': chart_data
        })
```

**Biểu đồ khuyên dùng**: Line Chart (Đường) - Dễ nhìn xu hướng

---

## 👥 II. THỐNG KÊ KHÁCH HÀNG (Customer Analytics) - ĐƠN GIẢN

### 1. **Khách Hàng VIP (Top Customers)**

```python
class TopCustomersView(APIView):
    """
    API Top khách hàng (ĐƠN GIẢN)
    GET /api/shop/admin/analytics/customers/top/
    Query params:
        - limit: số lượng (default: 10)
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count
        
        limit = int(request.query_params.get('limit', 10))
        
        # Lấy top khách hàng theo doanh thu
        top_customers = User.objects.filter(
            orders__payment_status='paid'
        ).annotate(
            total_spent=Sum('orders__total_price'),
            total_orders=Count('orders', filter=Q(orders__payment_status='paid'))
        ).filter(
            total_orders__gt=0
        ).order_by('-total_spent')[:limit]
        
        customers_data = []
        for customer in top_customers:
            customers_data.append({
                'id': customer.id,
                'username': customer.username,
                'email': customer.email,
                'total_spent': float(customer.total_spent or 0),
                'total_orders': customer.total_orders,
                'average_order_value': float(customer.total_spent / customer.total_orders) if customer.total_orders > 0 else 0
            })
        
        return Response({
            'top_customers': customers_data,
            'total': len(customers_data)
        })
```

---

### 2. **Thống Kê Khách Hàng Mới**

```python
class NewCustomersStatsView(APIView):
    """
    API Phân tích RFM khách hàng
    GET /api/shop/admin/analytics/customers/rfm/
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count, Max
        from datetime import datetime, timedelta
        
        # Get all customers with orders
        now = timezone.now()
        
        customers_data = User.objects.filter(
            orders__isnull=False
        ).annotate(
            last_order_date=Max('orders__created_at'),
            order_count=Count('orders', filter=Q(orders__payment_status='paid')),
            total_spent=Sum('orders__total_price', filter=Q(orders__payment_status='paid'))
        ).filter(
            order_count__gt=0
        ).values(
            'id', 'username', 'email', 
            'last_order_date', 'order_count', 'total_spent'
        )
        
        # Calculate RFM scores
        rfm_list = []
        for customer in customers_data:
            # Recency: days since last order
            recency = (now - customer['last_order_date']).days
            frequency = customer['order_count']
            monetary = float(customer['total_spent'] or 0)
            
            # Score calculation (1-5, 5 is best)
            # Recency: lower is better (more recent)
            if recency <= 30:
                r_score = 5
            elif recency <= 60:
                r_score = 4
            elif recency <= 90:
                r_score = 3
            elif recency <= 180:
                r_score = 2
            else:
                r_score = 1
            
            # Frequency: higher is better
            if frequency >= 10:
                f_score = 5
            elif frequency >= 7:
                f_score = 4
            elif frequency >= 5:
                f_score = 3
            elif frequency >= 3:
                f_score = 2
            else:
                f_score = 1
            
            # Monetary: higher is better
            if monetary >= 10000000:  # 10 triệu
                m_score = 5
            elif monetary >= 5000000:  # 5 triệu
                m_score = 4
            elif monetary >= 2000000:  # 2 triệu
                m_score = 3
            elif monetary >= 1000000:  # 1 triệu
                m_score = 2
            else:
                m_score = 1
            
            # RFM Segment
            rfm_score = f"{r_score}{f_score}{m_score}"
            
            # Segment classification
            if r_score >= 4 and f_score >= 4 and m_score >= 4:
                segment = "Champions"
            elif r_score >= 3 and f_score >= 3 and m_score >= 3:
                segment = "Loyal Customers"
            elif r_score >= 4 and f_score <= 2:
                segment = "New Customers"
            elif r_score <= 2 and f_score >= 3:
                segment = "At Risk"
            elif r_score <= 2 and f_score <= 2:
                segment = "Lost Customers"
            else:
                segment = "Potential Loyalists"
            
            rfm_list.append({
                'customer_id': customer['id'],
                'username': customer['username'],
                'email': customer['email'],
                'recency': recency,
                'frequency': frequency,
                'monetary': monetary,
                'r_score': r_score,
                'f_score': f_score,
                'm_score': m_score,
                'rfm_score': rfm_score,
                'segment': segment
            })
        
        # Count segments
        segment_counts = {}
        for item in rfm_list:
            segment = item['segment']
            segment_counts[segment] = segment_counts.get(segment, 0) + 1
        
        return Response({
            'customers': rfm_list,
            'segment_summary': segment_counts,
            'total_customers': len(rfm_list)
        })
```

#### Phân Khúc Khách Hàng:
- **Champions** (555, 554, 544): Khách VIP, mua nhiều và gần đây
- **Loyal Customers** (443, 444): Khách trung thành
- **New Customers** (510, 520): Khách mới, tiềm năng cao
- **At Risk** (233, 234): Nguy cơ rời bỏ
- **Lost Customers** (111, 112): Đã mất

---

### 2. **Customer Lifetime Value (CLV)**

```python
class CustomerLifetimeValueView(APIView):
    """
    API Tính giá trị lifetime của khách hàng
    GET /api/shop/admin/analytics/customers/clv/
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count, Avg, F
        from datetime import timedelta
        
        # Calculate CLV for each customer
        customers = User.objects.filter(
            orders__payment_status='paid'
        ).annotate(
            total_spent=Sum('orders__total_price'),
            order_count=Count('orders', filter=Q(orders__payment_status='paid')),
            first_order=Min('orders__created_at'),
            last_order=Max('orders__created_at'),
            avg_order_value=Avg('orders__total_price', filter=Q(orders__payment_status='paid'))
        ).filter(
            order_count__gt=0
        )
        
        clv_list = []
        for customer in customers:
            # Customer lifespan in days
            lifespan_days = (customer.last_order - customer.first_order).days + 1
            
            # Purchase frequency (orders per month)
            purchase_frequency = customer.order_count / (lifespan_days / 30) if lifespan_days > 0 else 0
            
            # Customer value (monthly)
            customer_value = float(customer.avg_order_value or 0) * purchase_frequency
            
            # Customer lifetime (giả định 3 năm = 36 tháng)
            assumed_lifetime_months = 36
            
            # CLV = Customer Value × Customer Lifetime
            clv = customer_value * assumed_lifetime_months
            
            clv_list.append({
                'customer_id': customer.id,
                'username': customer.username,
                'email': customer.email,
                'total_spent': float(customer.total_spent or 0),
                'order_count': customer.order_count,
                'avg_order_value': float(customer.avg_order_value or 0),
                'purchase_frequency': round(purchase_frequency, 2),
                'customer_lifetime_value': round(clv, 2),
                'lifespan_days': lifespan_days
            })
        
        # Sort by CLV descending
        clv_list.sort(key=lambda x: x['customer_lifetime_value'], reverse=True)
        
        # Calculate total CLV
        total_clv = sum(item['customer_lifetime_value'] for item in clv_list)
        
        return Response({
            'customers': clv_list[:50],  # Top 50
            'summary': {
                'total_clv': round(total_clv, 2),
                'average_clv': round(total_clv / len(clv_list), 2) if clv_list else 0,
                'top_10_clv': sum(item['customer_lifetime_value'] for item in clv_list[:10])
            }
        })
```

---

### 3. **Thống Kê Khách Hàng Mới**

```python
class NewCustomersAnalyticsView(APIView):
    """
    API Thống kê khách hàng mới
    GET /api/shop/admin/analytics/customers/new/
    Query params:
        - period: 'week', 'month', 'quarter', 'year'
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models.functions import TruncMonth, TruncWeek
        from datetime import timedelta
        
        period = request.query_params.get('period', 'month')
        
        # Get date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=90)  # Last 3 months
            trunc_func = TruncWeek
        elif period == 'quarter':
            start_date = now - timedelta(days=365)  # Last year
            trunc_func = TruncMonth
        elif period == 'year':
            start_date = now - timedelta(days=730)  # Last 2 years
            trunc_func = TruncMonth
        else:  # month
            start_date = now - timedelta(days=180)  # Last 6 months
            trunc_func = TruncMonth
        
        # New customers timeline
        new_customers = User.objects.filter(
            date_joined__gte=start_date
        ).annotate(
            period=trunc_func('date_joined')
        ).values('period').annotate(
            count=Count('id')
        ).order_by('period')
        
        # Customer retention
        customers_with_orders = User.objects.filter(
            date_joined__gte=start_date,
            orders__isnull=False
        ).distinct().count()
        
        total_new_customers = User.objects.filter(
            date_joined__gte=start_date
        ).count()
        
        activation_rate = (customers_with_orders / total_new_customers * 100) if total_new_customers > 0 else 0
        
        return Response({
            'timeline': [
                {
                    'period': item['period'].strftime('%Y-%m-%d'),
                    'new_customers': item['count']
                }
                for item in new_customers
            ],
            'summary': {
                'total_new_customers': total_new_customers,
                'customers_with_orders': customers_with_orders,
                'activation_rate': round(activation_rate, 2)
            }
        })
```

---

## 📦 III. THỐNG KÊ SẢN PHẨM (Product Analytics)

### 1. **Sản Phẩm Bán Chạy (Best Sellers)**

```python
class BestSellingProductsView(APIView):
    """
    API Sản phẩm bán chạy
    GET /api/shop/admin/analytics/products/best-sellers/
    Query params:
        - period: 'week', 'month', 'quarter', 'year', 'all'
        - limit: Số lượng sản phẩm trả về (default: 20)
        - category: Filter theo category
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count, F, Q
        from datetime import timedelta
        
        # Get parameters
        period = request.query_params.get('period', 'month')
        limit = int(request.query_params.get('limit', 20))
        category_id = request.query_params.get('category')
        
        # Date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'quarter':
            start_date = now - timedelta(days=90)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        elif period == 'all':
            start_date = None
        else:  # month
            start_date = now - timedelta(days=30)
        
        # Build query
        order_items = OrderItem.objects.filter(
            order__payment_status='paid'
        )
        
        if start_date:
            order_items = order_items.filter(order__created_at__gte=start_date)
        
        # Group by product
        products_stats = order_items.values(
            'product_variant__product__id',
            'product_variant__product__name',
            'product_variant__product__category__name',
            'product_variant__product__brand__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price_per_item')),
            order_count=Count('order', distinct=True)
        ).order_by('-total_quantity')
        
        # Filter by category if provided
        if category_id:
            products_stats = products_stats.filter(
                product_variant__product__category_id=category_id
            )
        
        # Limit results
        products_stats = products_stats[:limit]
        
        # Format response
        best_sellers = []
        for item in products_stats:
            best_sellers.append({
                'product_id': item['product_variant__product__id'],
                'product_name': item['product_variant__product__name'],
                'category': item['product_variant__product__category__name'],
                'brand': item['product_variant__product__brand__name'],
                'total_quantity_sold': item['total_quantity'],
                'total_revenue': float(item['total_revenue'] or 0),
                'order_count': item['order_count'],
                'average_quantity_per_order': round(item['total_quantity'] / item['order_count'], 2)
            })
        
        return Response({
            'period': period,
            'best_sellers': best_sellers,
            'total_items': len(best_sellers)
        })
```

---

### 2. **Phân Tích Theo Danh Mục**

```python
class CategoryAnalyticsView(APIView):
    """
    API Thống kê theo danh mục
    GET /api/shop/admin/analytics/categories/
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count, F
        
        # Get all categories with sales data
        categories = Category.objects.annotate(
            total_products=Count('products'),
            total_sold=Sum(
                'products__variants__orderitem__quantity',
                filter=Q(products__variants__orderitem__order__payment_status='paid')
            ),
            total_revenue=Sum(
                F('products__variants__orderitem__quantity') * F('products__variants__orderitem__price_per_item'),
                filter=Q(products__variants__orderitem__order__payment_status='paid')
            )
        ).order_by('-total_revenue')
        
        category_stats = []
        for category in categories:
            if category.total_sold:
                category_stats.append({
                    'category_id': category.id,
                    'category_name': category.name,
                    'total_products': category.total_products,
                    'total_sold': category.total_sold or 0,
                    'total_revenue': float(category.total_revenue or 0)
                })
        
        return Response({
            'categories': category_stats
        })
```

---

## 📊 IV. BIỂU ĐỒ (Charts & Visualization)

### 1. **Frontend Chart Components (React)**

Sử dụng thư viện **Chart.js** hoặc **Recharts** cho React:

```bash
npm install chart.js react-chartjs-2
# hoặc
npm install recharts
```

#### Example: Revenue Timeline Chart

```jsx
// src/components/admin/charts/RevenueChart.js
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { fetchRevenueTimeline } from '../../../api/analytics';

const RevenueChart = ({ period = 'month', groupBy = 'day' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period, groupBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRevenueTimeline(period, groupBy);
      setChartData(data.timeline);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="revenue-chart">
      <h3>Doanh Thu Theo Thời Gian</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#8884d8" 
            name="Doanh thu"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="orders" 
            stroke="#82ca9d" 
            name="Số đơn hàng"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
```

---

### 2. **Dashboard Layout**

```jsx
// src/pages/admin/AnalyticsDashboard.js
import React from 'react';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import CategoryPieChart from '../../components/admin/charts/CategoryPieChart';
import CustomerSegmentChart from '../../components/admin/charts/CustomerSegmentChart';

const AnalyticsDashboard = () => {
  return (
    <div className="analytics-dashboard">
      <h1>📊 Thống Kê & Phân Tích</h1>
      
      {/* KPI Cards */}
      <div className="kpi-cards">
        <KPICard title="Doanh thu tháng này" value="50,000,000đ" change="+12%" />
        <KPICard title="Đơn hàng" value="324" change="+8%" />
        <KPICard title="Khách hàng mới" value="87" change="+15%" />
        <KPICard title="AOV" value="154,000đ" change="+5%" />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <RevenueChart period="month" groupBy="day" />
        </div>
        
        <div className="chart-card">
          <CategoryPieChart />
        </div>
        
        <div className="chart-card">
          <CustomerSegmentChart />
        </div>
        
        <div className="chart-card">
          <BestSellersTable />
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 V. CÁC LOẠI BIỂU ĐỒ KHUYÊN DÙNG

### 1. **Biểu đồ đường (Line Chart)**
- Doanh thu theo thời gian
- Số đơn hàng theo ngày/tuần/tháng
- Khách hàng mới theo thời gian

### 2. **Biểu đồ cột (Bar Chart)**
- So sánh doanh thu các tháng
- Top sản phẩm bán chạy
- Doanh thu theo nhân viên (nếu có)

### 3. **Biểu đồ tròn (Pie/Donut Chart)**
- Phân bố doanh thu theo danh mục
- Phân khúc khách hàng (RFM)
- Tỷ lệ trạng thái đơn hàng

### 4. **Biểu đồ vùng (Area Chart)**
- Doanh thu tích lũy
- Tăng trưởng khách hàng tích lũy

### 5. **Heat Map**
- Hoạt động mua hàng theo giờ/ngày trong tuần
- Sản phẩm hot theo thời gian

### 6. **Scatter Plot**
- RFM Analysis visualization
- CLV vs. Frequency

---

## 📋 VI. DANH SÁCH API CẦN THÊM

Thêm vào `shop/urls.py`:

```python
# Analytics URLs
path('admin/analytics/revenue/', RevenueAnalyticsView.as_view(), name='analytics_revenue'),
path('admin/analytics/revenue/timeline/', RevenueTimelineView.as_view(), name='analytics_revenue_timeline'),
path('admin/analytics/customers/rfm/', CustomerRFMAnalysisView.as_view(), name='analytics_customer_rfm'),
path('admin/analytics/customers/clv/', CustomerLifetimeValueView.as_view(), name='analytics_customer_clv'),
path('admin/analytics/customers/new/', NewCustomersAnalyticsView.as_view(), name='analytics_new_customers'),
path('admin/analytics/products/best-sellers/', BestSellingProductsView.as_view(), name='analytics_best_sellers'),
path('admin/analytics/categories/', CategoryAnalyticsView.as_view(), name='analytics_categories'),
path('admin/analytics/products/low-stock/', LowStockProductsView.as_view(), name='analytics_low_stock'),
path('admin/analytics/conversion/', ConversionAnalyticsView.as_view(), name='analytics_conversion'),
```

---

## 🚀 VII. ROADMAP TRIỂN KHAI

### Phase 1: Cơ Bản (1-2 tuần)
- [x] Revenue Analytics API
- [x] Revenue Timeline API
- [ ] Basic Dashboard với KPI cards
- [ ] Revenue Line Chart

### Phase 2: Khách Hàng (1 tuần)
- [ ] RFM Analysis API
- [ ] Customer Lifetime Value API
- [ ] Customer Segmentation Charts
- [ ] New Customers Analytics

### Phase 3: Sản Phẩm (1 tuần)
- [ ] Best Sellers API
- [ ] Category Analytics API
- [ ] Product Performance Dashboard
- [ ] Inventory Analytics

### Phase 4: Nâng Cao (1-2 tuần)
- [ ] Advanced filtering & date range picker
- [ ] Export reports (PDF, Excel)
- [ ] Email reports scheduling
- [ ] Predictive analytics (ML)
- [ ] Real-time dashboard updates

---

## 💡 GỢI Ý THÊM

### 1. **Thêm Index cho Database**
```python
# shop/models.py
class Order(models.Model):
    # ... existing fields ...
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at', 'payment_status']),
            models.Index(fields=['user', '-created_at']),
        ]
```

### 2. **Caching cho Analytics**
```python
from django.core.cache import cache

def get_revenue_stats(period):
    cache_key = f'revenue_stats_{period}'
    stats = cache.get(cache_key)
    
    if not stats:
        # Calculate stats
        stats = calculate_revenue_stats(period)
        # Cache for 1 hour
        cache.set(cache_key, stats, 3600)
    
    return stats
```

### 3. **Background Jobs cho Heavy Queries**
Sử dụng Celery cho các tác vụ nặng:
```python
# tasks.py
from celery import shared_task

@shared_task
def generate_monthly_report():
    # Generate and cache monthly report
    pass
```

---

## 📊 KẾT LUẬN

Hệ thống Analytics này sẽ giúp bạn:
- ✅ Theo dõi doanh thu và lợi nhuận real-time
- ✅ Xác định khách hàng VIP và tiềm năng
- ✅ Phát hiện sản phẩm bán chạy
- ✅ Ra quyết định kinh doanh dựa trên dữ liệu
- ✅ Tối ưu hóa chiến lược marketing
- ✅ Dự đoán xu hướng và nhu cầu

**Next Steps**: Bắt đầu implement từ Phase 1 với Revenue Analytics!
