# 📦 KẾ HOẠCH CẢI TIẾN HỆ THỐNG QUẢN LÝ KHO HÀNG

## 🎯 MỤC TIÊU
Xây dựng hệ thống quản lý kho hàng **CHUYÊN NGHIỆP** cho shop quần áo với:
- ✅ Theo dõi lịch sử nhập/xuất kho
- ✅ Cảnh báo tồn kho thấp
- ✅ Báo cáo tồn kho chi tiết
- ✅ Xử lý race condition (nhiều người mua cùng lúc)
- ✅ Reserved stock trong quá trình checkout
- ✅ Phân quyền quản lý kho

---

## 📋 PHẦN 1: CẢI TIẾN DATABASE MODELS

### 1.1. Model ProductVariant (Cải tiến)
```python
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=50, unique=True, blank=True)  # SKU riêng cho variant
    size = models.CharField(max_length=10)
    color = models.CharField(max_length=30)
    
    # --- STOCK MANAGEMENT ---
    stock_quantity = models.PositiveIntegerField(default=0)  # Tồn kho thực tế
    reserved_quantity = models.PositiveIntegerField(default=0)  # Số lượng đang giữ (trong giỏ hàng/checkout)
    minimum_stock = models.PositiveIntegerField(default=5)  # Ngưỡng cảnh báo tồn kho
    reorder_point = models.PositiveIntegerField(default=10)  # Điểm đặt hàng lại
    
    # Cost tracking
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Giá vốn
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.size}/{self.color}"
    
    def save(self, *args, **kwargs):
        # Auto-generate SKU
        if not self.sku:
            self.sku = f"{self.product.sku}-{self.size}-{self.color}".upper()
        super().save(*args, **kwargs)
    
    @property
    def available_quantity(self):
        """Số lượng có thể bán (không bao gồm reserved)"""
        return max(0, self.stock_quantity - self.reserved_quantity)
    
    @property
    def is_low_stock(self):
        """Kiểm tra tồn kho thấp"""
        return self.available_quantity <= self.minimum_stock
    
    @property
    def need_reorder(self):
        """Cần đặt hàng thêm"""
        return self.available_quantity <= self.reorder_point
    
    class Meta:
        unique_together = ['product', 'size', 'color']
```

### 1.2. Model StockHistory (MỚI) - Lịch sử nhập/xuất kho
```python
class StockHistory(models.Model):
    TRANSACTION_TYPES = [
        ('import', 'Nhập kho'),
        ('export', 'Xuất kho (bán)'),
        ('return', 'Hoàn trả'),
        ('adjustment', 'Điều chỉnh'),
        ('damaged', 'Hàng hỏng'),
        ('reserved', 'Giữ hàng'),
        ('unreserved', 'Hủy giữ hàng'),
    ]
    
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stock_history')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()  # Có thể âm (xuất) hoặc dương (nhập)
    
    # Trạng thái trước/sau transaction
    quantity_before = models.PositiveIntegerField()
    quantity_after = models.PositiveIntegerField()
    
    # Reference
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    reference_number = models.CharField(max_length=50, blank=True)  # Mã phiếu nhập/xuất
    
    # Details
    cost_per_item = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='stock_transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        sign = "+" if self.quantity > 0 else ""
        return f"{self.product_variant} - {self.get_transaction_type_display()}: {sign}{self.quantity}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Stock Histories"
```

### 1.3. Model StockAlert (MỚI) - Cảnh báo tồn kho
```python
class StockAlert(models.Model):
    ALERT_TYPES = [
        ('low_stock', 'Tồn kho thấp'),
        ('out_of_stock', 'Hết hàng'),
        ('reorder_needed', 'Cần đặt hàng'),
    ]
    
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stock_alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    current_quantity = models.PositiveIntegerField()
    threshold = models.PositiveIntegerField()
    
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        status = "✓ Resolved" if self.is_resolved else "⚠ Active"
        return f"{status} - {self.product_variant} - {self.get_alert_type_display()}"
    
    class Meta:
        ordering = ['is_resolved', '-created_at']
```

### 1.4. Model CartItem (Cải tiến) - Thêm reserved stock
```python
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    # Reserved stock tracking
    is_reserved = models.BooleanField(default=False)
    reserved_at = models.DateTimeField(null=True, blank=True)
    reservation_expires_at = models.DateTimeField(null=True, blank=True)  # Hết hạn sau 30 phút
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.product_variant} (x{self.quantity})"
    
    def reserve_stock(self):
        """Giữ hàng khi bắt đầu checkout"""
        from django.utils import timezone
        from datetime import timedelta
        
        if not self.is_reserved:
            # Check availability
            if self.product_variant.available_quantity >= self.quantity:
                self.product_variant.reserved_quantity += self.quantity
                self.product_variant.save()
                
                self.is_reserved = True
                self.reserved_at = timezone.now()
                self.reservation_expires_at = timezone.now() + timedelta(minutes=30)
                self.save()
                return True
        return False
    
    def release_reservation(self):
        """Hủy giữ hàng"""
        if self.is_reserved:
            self.product_variant.reserved_quantity -= self.quantity
            self.product_variant.save()
            
            self.is_reserved = False
            self.reserved_at = None
            self.reservation_expires_at = None
            self.save()
```

---

## 📋 PHẦN 2: UTILS & SERVICES

### 2.1. Stock Management Service
```python
# shop/services/stock_service.py

from django.db import transaction
from django.utils import timezone
from ..models import ProductVariant, StockHistory, StockAlert

class StockService:
    """Service xử lý các tác vụ liên quan đến kho hàng"""
    
    @staticmethod
    @transaction.atomic
    def import_stock(product_variant, quantity, cost_per_item=None, reference_number='', notes='', user=None):
        """Nhập kho"""
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        # Update stock
        old_quantity = product_variant.stock_quantity
        product_variant.stock_quantity += quantity
        
        # Update cost price if provided
        if cost_per_item:
            product_variant.cost_price = cost_per_item
        
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='import',
            quantity=quantity,
            quantity_before=old_quantity,
            quantity_after=product_variant.stock_quantity,
            reference_number=reference_number,
            cost_per_item=cost_per_item,
            notes=notes,
            created_by=user
        )
        
        # Resolve alerts if stock is back to normal
        if product_variant.stock_quantity > product_variant.minimum_stock:
            StockAlert.objects.filter(
                product_variant=product_variant,
                is_resolved=False
            ).update(
                is_resolved=True,
                resolved_at=timezone.now(),
                resolved_by=user
            )
        
        return product_variant
    
    @staticmethod
    @transaction.atomic
    def export_stock(product_variant, quantity, order=None, notes='', user=None):
        """Xuất kho (khi bán hàng)"""
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        if product_variant.available_quantity < quantity:
            raise ValueError(f"Not enough stock. Available: {product_variant.available_quantity}")
        
        # Update stock
        old_quantity = product_variant.stock_quantity
        product_variant.stock_quantity -= quantity
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='export',
            quantity=-quantity,  # Negative for export
            quantity_before=old_quantity,
            quantity_after=product_variant.stock_quantity,
            order=order,
            notes=notes,
            created_by=user
        )
        
        # Check and create alerts
        StockService.check_and_create_alerts(product_variant)
        
        return product_variant
    
    @staticmethod
    @transaction.atomic
    def adjust_stock(product_variant, new_quantity, reason='', user=None):
        """Điều chỉnh tồn kho (kiểm kê, hàng hỏng...)"""
        old_quantity = product_variant.stock_quantity
        difference = new_quantity - old_quantity
        
        product_variant.stock_quantity = new_quantity
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='adjustment',
            quantity=difference,
            quantity_before=old_quantity,
            quantity_after=new_quantity,
            notes=reason,
            created_by=user
        )
        
        # Check and create alerts
        StockService.check_and_create_alerts(product_variant)
        
        return product_variant
    
    @staticmethod
    def check_and_create_alerts(product_variant):
        """Kiểm tra và tạo cảnh báo tồn kho"""
        available = product_variant.available_quantity
        
        # Out of stock alert
        if available == 0:
            StockAlert.objects.get_or_create(
                product_variant=product_variant,
                alert_type='out_of_stock',
                is_resolved=False,
                defaults={
                    'current_quantity': available,
                    'threshold': 0
                }
            )
        
        # Low stock alert
        elif available <= product_variant.minimum_stock:
            StockAlert.objects.get_or_create(
                product_variant=product_variant,
                alert_type='low_stock',
                is_resolved=False,
                defaults={
                    'current_quantity': available,
                    'threshold': product_variant.minimum_stock
                }
            )
        
        # Reorder needed alert
        elif available <= product_variant.reorder_point:
            StockAlert.objects.get_or_create(
                product_variant=product_variant,
                alert_type='reorder_needed',
                is_resolved=False,
                defaults={
                    'current_quantity': available,
                    'threshold': product_variant.reorder_point
                }
            )
    
    @staticmethod
    def get_inventory_report():
        """Tạo báo cáo tồn kho"""
        from django.db.models import Sum, Count, F
        
        variants = ProductVariant.objects.annotate(
            available=F('stock_quantity') - F('reserved_quantity'),
            total_value=F('stock_quantity') * F('cost_price')
        )
        
        report = {
            'total_variants': variants.count(),
            'total_stock_value': variants.aggregate(total=Sum('total_value'))['total'] or 0,
            'low_stock_items': variants.filter(stock_quantity__lte=F('minimum_stock')).count(),
            'out_of_stock_items': variants.filter(stock_quantity=0).count(),
            'need_reorder_items': variants.filter(stock_quantity__lte=F('reorder_point')).count(),
            'variants': variants
        }
        
        return report
```

---

## 📋 PHẦN 3: API ENDPOINTS

### 3.1. Stock Management APIs (Admin)
```python
# shop/views.py (thêm vào)

from .services.stock_service import StockService

# Import Stock
class AdminStockImportView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """Nhập kho"""
        variant_id = request.data.get('variant_id')
        quantity = request.data.get('quantity')
        cost_per_item = request.data.get('cost_per_item')
        reference_number = request.data.get('reference_number', '')
        notes = request.data.get('notes', '')
        
        try:
            variant = ProductVariant.objects.get(id=variant_id)
            updated_variant = StockService.import_stock(
                product_variant=variant,
                quantity=int(quantity),
                cost_per_item=cost_per_item,
                reference_number=reference_number,
                notes=notes,
                user=request.user
            )
            
            return Response({
                'message': f'Successfully imported {quantity} items',
                'variant': {
                    'id': updated_variant.id,
                    'stock_quantity': updated_variant.stock_quantity,
                    'available_quantity': updated_variant.available_quantity
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

# Adjust Stock
class AdminStockAdjustView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """Điều chỉnh tồn kho"""
        variant_id = request.data.get('variant_id')
        new_quantity = request.data.get('new_quantity')
        reason = request.data.get('reason', '')
        
        try:
            variant = ProductVariant.objects.get(id=variant_id)
            updated_variant = StockService.adjust_stock(
                product_variant=variant,
                new_quantity=int(new_quantity),
                reason=reason,
                user=request.user
            )
            
            return Response({
                'message': 'Stock adjusted successfully',
                'variant': {
                    'id': updated_variant.id,
                    'stock_quantity': updated_variant.stock_quantity,
                    'available_quantity': updated_variant.available_quantity
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

# Stock History
class AdminStockHistoryView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = StockHistorySerializer
    pagination_class = AdminPagination
    
    def get_queryset(self):
        variant_id = self.request.query_params.get('variant_id')
        if variant_id:
            return StockHistory.objects.filter(product_variant_id=variant_id)
        return StockHistory.objects.all()

# Stock Alerts
class AdminStockAlertsView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = StockAlertSerializer
    
    def get_queryset(self):
        return StockAlert.objects.filter(is_resolved=False)

# Inventory Report
class AdminInventoryReportView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        report = StockService.get_inventory_report()
        
        # Serialize variants
        variants_data = []
        for variant in report['variants']:
            variants_data.append({
                'id': variant.id,
                'product': variant.product.name,
                'size': variant.size,
                'color': variant.color,
                'sku': variant.sku,
                'stock_quantity': variant.stock_quantity,
                'reserved_quantity': variant.reserved_quantity,
                'available_quantity': variant.available,
                'cost_price': variant.cost_price,
                'total_value': variant.total_value,
                'is_low_stock': variant.is_low_stock,
                'need_reorder': variant.need_reorder
            })
        
        return Response({
            'summary': {
                'total_variants': report['total_variants'],
                'total_stock_value': report['total_stock_value'],
                'low_stock_items': report['low_stock_items'],
                'out_of_stock_items': report['out_of_stock_items'],
                'need_reorder_items': report['need_reorder_items']
            },
            'variants': variants_data
        })
```

### 3.2. URLs
```python
# shop/urls.py (thêm vào)

# Stock Management (Admin)
path('admin/stock/import/', AdminStockImportView.as_view(), name='admin-stock-import'),
path('admin/stock/adjust/', AdminStockAdjustView.as_view(), name='admin-stock-adjust'),
path('admin/stock/history/', AdminStockHistoryView.as_view(), name='admin-stock-history'),
path('admin/stock/alerts/', AdminStockAlertsView.as_view(), name='admin-stock-alerts'),
path('admin/inventory/report/', AdminInventoryReportView.as_view(), name='admin-inventory-report'),
```

---

## 📋 PHẦN 4: FRONTEND COMPONENTS

### 4.1. Admin - Stock Management Page
```jsx
// ecommerce-frontend/src/pages/admin/StockManagement.js

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Tag, Space } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import authAxios from '../../api/AuthAxios';

export default function StockManagement() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: 'Size/Màu',
      key: 'variant',
      render: (_, record) => `${record.size} / ${record.color}`,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock_quantity',
      key: 'stock',
      render: (stock, record) => (
        <Space>
          {stock}
          {record.is_low_stock && <WarningOutlined style={{ color: 'red' }} />}
        </Space>
      ),
    },
    {
      title: 'Đang giữ',
      dataIndex: 'reserved_quantity',
      key: 'reserved',
    },
    {
      title: 'Có thể bán',
      dataIndex: 'available_quantity',
      key: 'available',
      render: (available) => (
        <Tag color={available > 0 ? 'green' : 'red'}>
          {available}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.available_quantity === 0) {
          return <Tag color="red">Hết hàng</Tag>;
        } else if (record.is_low_stock) {
          return <Tag color="orange">Sắp hết</Tag>;
        } else if (record.need_reorder) {
          return <Tag color="yellow">Cần đặt hàng</Tag>;
        }
        return <Tag color="green">Còn hàng</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => openImportModal(record)}>
            Nhập kho
          </Button>
          <Button onClick={() => openAdjustModal(record)}>
            Điều chỉnh
          </Button>
        </Space>
      ),
    },
  ];
  
  const openImportModal = (variant) => {
    setSelectedVariant(variant);
    setImportModalVisible(true);
  };
  
  const handleImportStock = async (values) => {
    try {
      await authAxios.post('/api/shop/admin/stock/import/', {
        variant_id: selectedVariant.id,
        ...values,
      });
      message.success('Nhập kho thành công');
      setImportModalVisible(false);
      fetchInventoryReport();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };
  
  return (
    <div>
      <h1>Quản lý kho hàng</h1>
      <Table 
        columns={columns} 
        dataSource={variants} 
        loading={loading}
        rowKey="id"
      />
      
      {/* Import Modal */}
      <Modal
        title="Nhập kho"
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleImportStock}>
          <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Giá vốn" name="cost_per_item">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Mã phiếu nhập" name="reference_number">
            <Input />
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea />
          </Form.Item>
          <Button type="primary" htmlType="submit">Xác nhận</Button>
        </Form>
      </Modal>
    </div>
  );
}
```

---

## 📋 PHẦN 5: MIGRATION STEPS

### Bước 1: Tạo migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Bước 2: Chạy script cập nhật dữ liệu cũ
```python
# shop/management/commands/update_stock_system.py

from django.core.management.base import BaseCommand
from shop.models import ProductVariant, StockHistory

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Tạo initial stock history cho tất cả variants
        for variant in ProductVariant.objects.all():
            if variant.stock_quantity > 0:
                StockHistory.objects.create(
                    product_variant=variant,
                    transaction_type='adjustment',
                    quantity=variant.stock_quantity,
                    quantity_before=0,
                    quantity_after=variant.stock_quantity,
                    notes='Initial stock from migration'
                )
        self.stdout.write(self.style.SUCCESS('Successfully updated stock system'))
```

---

## 🎯 KẾT LUẬN

### Lợi ích của hệ thống mới:
1. ✅ **Theo dõi chính xác**: Biết rõ hàng nhập/xuất khi nào, bao nhiêu
2. ✅ **Tránh overselling**: Reserved stock khi checkout
3. ✅ **Báo cáo chi tiết**: Biết giá trị tồn kho, cần nhập hàng gì
4. ✅ **Cảnh báo tự động**: Không bao giờ để hết hàng mà không biết
5. ✅ **Phân quyền rõ ràng**: Chỉ admin mới quản lý kho
6. ✅ **Tích hợp dễ dàng**: Không làm hỏng code hiện tại

### Thời gian triển khai:
- Backend: 4-6 giờ
- Frontend: 4-6 giờ
- Testing: 2-3 giờ
- **Tổng**: 10-15 giờ

Bạn có muốn tôi bắt đầu implement không? 🚀
