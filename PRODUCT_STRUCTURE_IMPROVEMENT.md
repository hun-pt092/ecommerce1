# Hướng dẫn cải thiện cấu trúc Product Models

## Cấu trúc mới đề xuất:

```
Product (Áo thun)
 └── ProductVariant (Màu: Đỏ)
      ├── price, discount_price
      ├── ProductVariantImage (nhiều ảnh)
      │    ├── Image 1
      │    ├── Image 2
      │    └── Image 3
      └── ProductSKU (theo size)
           ├── Size S (stock: 10)
           ├── Size M (stock: 20)
           └── Size L (stock: 15)
```

## Models cần thay đổi:

### 1. Product (giữ nguyên - không có price, image)
```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(Category)
    brand = models.ForeignKey(Brand)
    description = models.TextField()
    material = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
```

### 2. ProductVariant (theo màu sắc)
```python
class ProductVariant(models.Model):
    """Variant theo màu sắc"""
    product = models.ForeignKey(Product, related_name='variants')
    color = models.CharField(max_length=50)  # Màu sắc
    color_code = models.CharField(max_length=7)  # Mã màu hex (optional)
    
    # Giá cho màu này
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Ảnh đại diện (optional - có thể dùng first image)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 3. ProductVariantImage (nhiều ảnh cho mỗi màu)
```python
class ProductVariantImage(models.Model):
    """Nhiều ảnh cho mỗi màu"""
    variant = models.ForeignKey(ProductVariant, related_name='images')
    image = models.ImageField(upload_to='variants/%Y/%m/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)  # Ảnh chính
    order = models.PositiveIntegerField(default=0)  # Thứ tự hiển thị
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-is_primary']
```

### 4. ProductSKU (size + stock cho mỗi màu)
```python
class ProductSKU(models.Model):
    """SKU theo size cho mỗi màu"""
    variant = models.ForeignKey(ProductVariant, related_name='skus')
    size = models.CharField(max_length=20)  # S, M, L, XL, XXL
    sku = models.CharField(max_length=100, unique=True)  # Auto-generated
    
    # Stock management
    stock_quantity = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=5)
    
    # Cost
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['variant', 'size']
        
    @property
    def available_quantity(self):
        return max(0, self.stock_quantity - self.reserved_quantity)
```

## Frontend Form sẽ trở thành:

```
Thêm sản phẩm: Áo thun
├── Thông tin cơ bản (tên, mô tả, danh mục, thương hiệu)
└── Variants (Màu sắc)
     ├── Màu Đỏ
     │    ├── Giá: 200,000₫
     │    ├── Giá KM: 180,000₫
     │    ├── Upload nhiều ảnh: [img1, img2, img3]
     │    └── Sizes:
     │         ├── S: Stock 10
     │         ├── M: Stock 20
     │         └── L: Stock 15
     ├── Màu Xanh
     │    ├── Giá: 220,000₫
     │    ├── Upload nhiều ảnh: [img1, img2, img3]
     │    └── Sizes:
     │         ├── S: Stock 8
     │         ├── M: Stock 12
     │         └── L: Stock 10
```

## Ưu điểm:

1. ✅ Rõ ràng: Màu sắc là variant chính
2. ✅ Linh hoạt: Mỗi màu có nhiều ảnh
3. ✅ Quản lý tốt: Stock theo size + màu
4. ✅ Dễ mở rộng: Có thể thêm thuộc tính khác
5. ✅ UX tốt hơn: User chọn màu → xem ảnh → chọn size

## Migration cần làm:

1. Tạo model ProductVariantImage
2. Tạo model ProductSKU
3. Migrate data từ ProductVariant cũ sang cấu trúc mới
4. Cập nhật Cart, Order để dùng ProductSKU thay vì ProductVariant

Bạn có muốn tôi implement cấu trúc mới này không?
