from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
import os


def product_image_path(instance, filename):
    """Tạo đường dẫn upload ảnh sản phẩm"""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4().hex}.{ext}'
    return os.path.join('products', str(instance.product.id), filename)


# Custom User model để dễ mở rộng (thêm is_admin,...)
class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    # email, username, password đã có sẵn từ AbstractUser

class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True, blank=True)  # Mã SKU
    description = models.TextField(blank=True)
    short_description = models.TextField(max_length=500, blank=True)  # Mô tả ngắn
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    material = models.CharField(max_length=100, blank=True)  # Chất liệu
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Trạng thái sản phẩm
    is_active = models.BooleanField(default=True)  # Hiển thị hay không
    is_featured = models.BooleanField(default=False)  # Sản phẩm nổi bật
    is_new = models.BooleanField(default=False)  # Sản phẩm mới
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Tự động tạo SKU nếu chưa có
        if not self.sku:
            self.sku = f"PRD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def get_main_image(self):
        """Lấy ảnh chính của sản phẩm"""
        main_image = self.images.filter(is_main=True).first()
        return main_image.image.url if main_image else None
    
    def get_all_images(self):
        """Lấy tất cả ảnh của sản phẩm theo thứ tự"""
        return self.images.all().order_by('order', 'id')

    class Meta:
        ordering = ['-created_at']

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=product_image_path)
    alt_text = models.CharField(max_length=200, blank=True)  # Mô tả ảnh cho SEO
    is_main = models.BooleanField(default=False)  # Ảnh chính
    order = models.PositiveIntegerField(default=0)  # Thứ tự hiển thị
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        status = "Main" if self.is_main else "Additional"
        return f"{self.product.name} - {status} Image #{self.order}"
    
    def save(self, *args, **kwargs):
        # Nếu đây là ảnh chính, bỏ đánh dấu ảnh chính cũ
        if self.is_main:
            ProductImage.objects.filter(
                product=self.product, 
                is_main=True
            ).exclude(id=self.id).update(is_main=False)
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['order', 'id']

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=50, blank=True, null=True, db_index=True)  # SKU riêng cho variant (không unique để tránh lỗi migration)
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
        return f"{self.product.name} - Size: {self.size} - Color: {self.color}"
    
    def save(self, *args, **kwargs):
        # Auto-generate SKU nếu chưa có
        if not self.sku:
            product_sku = self.product.sku if self.product.sku else f"PRD-{self.product.id}"
            self.sku = f"{product_sku}-{self.size}-{self.color}".upper().replace(' ', '-')
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

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Shipping information
    shipping_name = models.CharField(max_length=200, blank=True, default='')
    shipping_address = models.TextField(blank=True, default='')
    shipping_city = models.CharField(max_length=100, blank=True, default='')
    shipping_postal_code = models.CharField(max_length=20, blank=True, default='')
    shipping_country = models.CharField(max_length=100, default='Vietnam')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    
    # Order notes
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"
    
    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    class Meta:
        ordering = ['-created_at']

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"Order #{self.order.id} - {self.product_variant} (x{self.quantity})"
    
    def get_total_price(self):
        return self.price_per_item * self.quantity

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)  # Liên kết với đơn hàng để kiểm tra đã mua chưa
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.user.username} for {self.product.name} - {self.rating} stars"
    
    class Meta:
        # Một user chỉ có thể review một sản phẩm một lần
        unique_together = ('product', 'user')
        ordering = ['-created_at']

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
    
    class Meta:
        # Một user chỉ có thể thêm một sản phẩm vào wishlist một lần
        unique_together = ('user', 'product')
        ordering = ['-created_at']

class Cart(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart #{self.id} - User: {self.user}"

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
            self.product_variant.reserved_quantity = max(0, self.product_variant.reserved_quantity - self.quantity)
            self.product_variant.save()
            
            self.is_reserved = False
            self.reserved_at = None
            self.reservation_expires_at = None
            self.save()


class StockHistory(models.Model):
    """Lịch sử nhập/xuất kho"""
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
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_transactions')
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


class StockAlert(models.Model):
    """Cảnh báo tồn kho"""
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
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        status = "✓ Resolved" if self.is_resolved else "⚠ Active"
        return f"{status} - {self.product_variant} - {self.get_alert_type_display()}"
    
    class Meta:
        ordering = ['is_resolved', '-created_at']

