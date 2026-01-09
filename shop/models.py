from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
import uuid
import os





# Custom User model để dễ mở rộng (thêm is_admin,...)
class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True, verbose_name='Ngày sinh')
    phone_number = models.CharField(max_length=20, blank=True, verbose_name='Số điện thoại')
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
    
    def get_price(self):
        """Lấy giá từ variant đầu tiên"""
        first_variant = self.variants.first()
        return first_variant.price if first_variant else 0
    
    def get_display_image(self):
        """Lấy ảnh từ variant đầu tiên"""
        first_variant = self.variants.first()
        if first_variant and first_variant.image:
            return first_variant.image.url
        return None
    
    def get_price_range(self):
        """Lấy khoảng giá của tất cả variants dạng string"""
        prices = self.variants.values_list('price', flat=True)
        if prices:
            min_price = min(prices)
            max_price = max(prices)
            if min_price == max_price:
                return f"{int(min_price):,}₫"
            return f"{int(min_price):,}₫ - {int(max_price):,}₫"
        return "0₫"

    class Meta:
        ordering = ['-created_at']



def variant_image_path(instance, filename):
    """Tạo đường dẫn upload ảnh variant (theo màu)"""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4().hex}.{ext}'
    return os.path.join('products', str(instance.product.id), 'variants', filename)


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=50, blank=True, null=True, db_index=True)  # SKU riêng cho variant
    
    # Thuộc tính cơ bản
    size = models.CharField(max_length=10)
    color = models.CharField(max_length=30)
    
    # Ảnh và giá cho từng variant
    image = models.ImageField(upload_to=variant_image_path, blank=True, null=True, verbose_name='Ảnh variant')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá bán')
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Giá khuyến mãi')
    
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
    
    def get_final_price(self):
        """Lấy giá cuối cùng (ưu tiên discount_price)"""
        return self.discount_price if self.discount_price else self.price
    
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
    
    # Coupon information
    used_coupon = models.ForeignKey('UserCoupon', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders_used')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
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


class Coupon(models.Model):
    """Mã giảm giá"""
    COUPON_TYPES = [
        ('percentage', 'Phần trăm'),
        ('fixed', 'Số tiền cố định'),
        ('free_shipping', 'Miễn phí vận chuyển'),
    ]
    
    OCCASION_TYPES = [
        ('birthday', 'Sinh nhật'),
        ('promotion', 'Khuyến mãi'),
        ('seasonal', 'Theo mùa'),
        ('first_order', 'Đơn hàng đầu'),
        ('loyalty', 'Khách hàng thân thiết'),
    ]
    
    code = models.CharField(max_length=50, unique=True, verbose_name='Mã giảm giá')
    name = models.CharField(max_length=200, verbose_name='Tên chương trình')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Loại mã
    coupon_type = models.CharField(max_length=20, choices=COUPON_TYPES, default='percentage')
    occasion_type = models.CharField(max_length=20, choices=OCCASION_TYPES, default='promotion')
    
    # Giá trị giảm
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá trị giảm')
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, 
                                              verbose_name='Giảm tối đa (cho phần trăm)')
    
    # Điều kiện áp dụng
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                                              verbose_name='Giá trị đơn hàng tối thiểu')
    
    # Số lần sử dụng
    max_uses = models.PositiveIntegerField(null=True, blank=True, verbose_name='Số lần sử dụng tối đa')
    max_uses_per_user = models.PositiveIntegerField(default=1, verbose_name='Số lần/khách')
    current_uses = models.PositiveIntegerField(default=0, verbose_name='Đã sử dụng')
    
    # Thời gian
    valid_from = models.DateTimeField(null=True, blank=True, verbose_name='Có hiệu lực từ')
    valid_to = models.DateTimeField(null=True, blank=True, verbose_name='Có hiệu lực đến')
    
    # Trạng thái
    is_active = models.BooleanField(default=True, verbose_name='Kích hoạt')
    is_public = models.BooleanField(default=False, verbose_name='Công khai')  # False = chỉ gửi cho user cụ thể
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def is_valid(self, user=None):
        """Kiểm tra mã còn hiệu lực không"""
        now = timezone.now()
        
        # Kiểm tra active
        if not self.is_active:
            return False, "Mã giảm giá không còn hoạt động"
        
        # Kiểm tra thời gian
        if self.valid_from and now < self.valid_from:
            return False, "Mã giảm giá chưa có hiệu lực"
        if self.valid_to and now > self.valid_to:
            return False, "Mã giảm giá đã hết hạn"
        
        # Kiểm tra số lần sử dụng
        if self.max_uses and self.current_uses >= self.max_uses:
            return False, "Mã giảm giá đã hết lượt sử dụng"
        
        # Kiểm tra số lần sử dụng per user
        if user and self.max_uses_per_user:
            user_uses = UserCoupon.objects.filter(
                user=user, 
                coupon=self,
                is_used=True
            ).count()
            if user_uses >= self.max_uses_per_user:
                return False, "Bạn đã sử dụng hết lượt cho mã này"
        
        return True, "Mã hợp lệ"
    
    def calculate_discount(self, order_amount):
        """Tính số tiền giảm"""
        if self.coupon_type == 'percentage':
            discount = order_amount * (self.discount_value / 100)
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
            return discount
        elif self.coupon_type == 'fixed':
            return min(self.discount_value, order_amount)
        elif self.coupon_type == 'free_shipping':
            return 0  # Xử lý riêng ở logic shipping
        return 0
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mã giảm giá'
        verbose_name_plural = 'Mã giảm giá'


class UserCoupon(models.Model):
    """Ví voucher của khách hàng"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coupons')
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='user_coupons')
    
    # Thời gian có hiệu lực riêng cho user này
    valid_from = models.DateTimeField(verbose_name='Có hiệu lực từ')
    valid_to = models.DateTimeField(verbose_name='Có hiệu lực đến')
    
    # Trạng thái sử dụng
    is_used = models.BooleanField(default=False, verbose_name='Đã sử dụng')
    used_at = models.DateTimeField(null=True, blank=True, verbose_name='Thời gian sử dụng')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='used_coupons')
    
    # Tracking
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày nhận')
    notified = models.BooleanField(default=False, verbose_name='Đã thông báo')
    notified_at = models.DateTimeField(null=True, blank=True, verbose_name='Thời gian thông báo')
    
    def __str__(self):
        status = "Đã dùng" if self.is_used else "Chưa dùng"
        return f"{self.user.username} - {self.coupon.code} - {status}"
    
    def is_valid(self):
        """Kiểm tra voucher còn dùng được không"""
        now = timezone.now()
        if self.is_used:
            return False, "Mã đã được sử dụng"
        if now < self.valid_from:
            return False, "Mã chưa có hiệu lực"
        if now > self.valid_to:
            return False, "Mã đã hết hạn"
        return True, "Mã hợp lệ"
    
    def use_coupon(self, order):
        """Đánh dấu mã đã sử dụng"""
        self.is_used = True
        self.used_at = timezone.now()
        self.order = order
        self.save()
        
        # Tăng số lần sử dụng của coupon
        self.coupon.current_uses += 1
        self.coupon.save()
    
    class Meta:
        unique_together = ['user', 'coupon', 'valid_from']  # Mỗi năm sinh nhật có 1 mã
        ordering = ['-assigned_at']
        verbose_name = 'Voucher của khách'
        verbose_name_plural = 'Voucher của khách'


class ProductVoucher(models.Model):
    """Voucher riêng cho sản phẩm"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='vouchers')
    code = models.CharField(max_length=50, unique=True, verbose_name='Mã voucher')
    name = models.CharField(max_length=200, verbose_name='Tên voucher')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Loại giảm giá
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Phần trăm'),
        ('fixed', 'Số tiền cố định'),
    ]
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá trị giảm')
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, 
                                              verbose_name='Giảm tối đa (cho phần trăm)')
    
    # Số lượng
    max_uses = models.PositiveIntegerField(null=True, blank=True, verbose_name='Số lần sử dụng tối đa')
    current_uses = models.PositiveIntegerField(default=0, verbose_name='Đã sử dụng')
    
    # Thời gian
    valid_from = models.DateTimeField(verbose_name='Có hiệu lực từ')
    valid_to = models.DateTimeField(verbose_name='Có hiệu lực đến')
    
    # Trạng thái
    is_active = models.BooleanField(default=True, verbose_name='Kích hoạt')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.code}"
    
    def is_valid(self):
        """Kiểm tra voucher còn hiệu lực không"""
        now = timezone.now()
        
        if not self.is_active:
            return False, "Voucher không còn hoạt động"
        
        if now < self.valid_from:
            return False, "Voucher chưa có hiệu lực"
        
        if now > self.valid_to:
            return False, "Voucher đã hết hạn"
        
        if self.max_uses and self.current_uses >= self.max_uses:
            return False, "Voucher đã hết lượt sử dụng"
        
        return True, "Voucher hợp lệ"
    
    def calculate_discount(self, price):
        """Tính số tiền giảm cho sản phẩm"""
        if self.discount_type == 'percentage':
            discount = price * (self.discount_value / 100)
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
            return discount
        elif self.discount_type == 'fixed':
            return min(self.discount_value, price)
        return 0
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Voucher sản phẩm'
        verbose_name_plural = 'Voucher sản phẩm'


