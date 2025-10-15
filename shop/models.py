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
    size = models.CharField(max_length=10)
    color = models.CharField(max_length=30)
    stock_quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - Size: {self.size} - Color: {self.color}"

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

    def __str__(self):
        return f"{self.product_variant} (x{self.quantity})"

