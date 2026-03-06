"""
Script tạo 100 sản phẩm thời trang realistic với đầy đủ cấu trúc:
- Product (với slug, tags, sold_count, view_count, avg_rating)
- ProductVariant (nhiều màu)
- ProductVariantImage
- ProductSKU (nhiều size)
"""
import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Product, ProductVariant, ProductVariantImage, ProductSKU, Category, Brand
from django.core.files.base import ContentFile
import requests
from io import BytesIO

# ==================== DATA TEMPLATES ====================

CATEGORIES_DATA = [
    {'name': 'Áo Nam', 'parent': None},
    {'name': 'Áo Thun Nam', 'parent': 'Áo Nam'},
    {'name': 'Áo Polo Nam', 'parent': 'Áo Nam'},
    {'name': 'Áo Sơ Mi Nam', 'parent': 'Áo Nam'},
    {'name': 'Áo Khoác Nam', 'parent': 'Áo Nam'},
    
    {'name': 'Quần Nam', 'parent': None},
    {'name': 'Quần Jean Nam', 'parent': 'Quần Nam'},
    {'name': 'Quần Kaki Nam', 'parent': 'Quần Nam'},
    {'name': 'Quần Short Nam', 'parent': 'Quần Nam'},
    
    {'name': 'Áo Nữ', 'parent': None},
    {'name': 'Áo Thun Nữ', 'parent': 'Áo Nữ'},
    {'name': 'Áo Kiểu Nữ', 'parent': 'Áo Nữ'},
    {'name': 'Áo Khoác Nữ', 'parent': 'Áo Nữ'},
    
    {'name': 'Quần Nữ', 'parent': None},
    {'name': 'Quần Jean Nữ', 'parent': 'Quần Nữ'},
    {'name': 'Váy Nữ', 'parent': 'Quần Nữ'},
    
    {'name': 'Giày Dép', 'parent': None},
    {'name': 'Giày Sneaker', 'parent': 'Giày Dép'},
    {'name': 'Giày Tây', 'parent': 'Giày Dép'},
    {'name': 'Dép Sandal', 'parent': 'Giày Dép'},
    
    {'name': 'Phụ Kiện', 'parent': None},
    {'name': 'Túi Xách', 'parent': 'Phụ Kiện'},
    {'name': 'Ví', 'parent': 'Phụ Kiện'},
    {'name': 'Thắt Lưng', 'parent': 'Phụ Kiện'},
    {'name': 'Mũ Nón', 'parent': 'Phụ Kiện'},
]

BRANDS_DATA = [
    {'name': 'Nike', 'description': 'Thương hiệu thể thao hàng đầu thế giới'},
    {'name': 'Adidas', 'description': 'Thương hiệu thời trang thể thao Đức'},
    {'name': 'Uniqlo', 'description': 'Thời trang basic Nhật Bản'},
    {'name': 'Zara', 'description': 'Thời trang fast fashion Tây Ban Nha'},
    {'name': 'H&M', 'description': 'Thời trang bình dân Thụy Điển'},
    {'name': 'Louis Vuitton', 'description': 'Thương hiệu xa xỉ Pháp'},
    {'name': 'Gucci', 'description': 'Thương hiệu xa xỉ Ý'},
    {'name': 'Puma', 'description': 'Thương hiệu thể thao Đức'},
    {'name': 'The North Face', 'description': 'Thời trang outdoor Mỹ'},
    {'name': 'Calvin Klein', 'description': 'Thời trang cao cấp Mỹ'},
]

# Templates cho từng loại sản phẩm
PRODUCT_TEMPLATES = {
    'Áo Thun Nam': {
        'products': [
            'Áo Thun Basic Cotton', 'Áo Thun Oversize', 'Áo Thun Polo', 
            'Áo Thun Form Rộng', 'Áo Thun Graphic', 'Áo Thun Premium',
            'Áo Thun Dài Tay', 'Áo Thun Thể Thao', 'Áo Thun Cổ Tròn',
            'Áo Thun V-Neck'
        ],
        'materials': ['Cotton', 'Cotton Blend', 'Polyester', 'Modal', 'Bamboo'],
        'tags': ['nam', 'áo thun', 'casual', 'basic', 'thời trang', 'thoải mái'],
        'price_range': (150000, 500000),
        'colors': ['Đen', 'Trắng', 'Xám', 'Xanh Navy', 'Xanh Dương', 'Be', 'Nâu'],
        'sizes': ['S', 'M', 'L', 'XL', 'XXL']
    },
    'Áo Sơ Mi Nam': {
        'products': [
            'Áo Sơ Mi Dài Tay', 'Áo Sơ Mi Ngắn Tay', 'Áo Sơ Mi Công Sở',
            'Áo Sơ Mi Oxford', 'Áo Sơ Mi Kẻ Sọc', 'Áo Sơ Mi Trắng',
            'Áo Sơ Mi Linen', 'Áo Sơ Mi Slim Fit'
        ],
        'materials': ['Cotton', 'Linen', 'Cotton Blend', 'Polyester'],
        'tags': ['nam', 'áo sơ mi', 'công sở', 'lịch sự', 'formal'],
        'price_range': (250000, 800000),
        'colors': ['Trắng', 'Xanh Navy', 'Đen', 'Xanh Dương', 'Kẻ Sọc', 'Be'],
        'sizes': ['S', 'M', 'L', 'XL', 'XXL']
    },
    'Quần Jean Nam': {
        'products': [
            'Quần Jean Slim Fit', 'Quần Jean Straight', 'Quần Jean Rách',
            'Quần Jean Skinny', 'Quần Jean Ống Rộng', 'Quần Jean Regular',
            'Quần Jean Đen', 'Quần Jean Xanh Nhạt'
        ],
        'materials': ['Denim', 'Denim Stretch', 'Cotton Denim'],
        'tags': ['nam', 'quần jean', 'casual', 'bền đẹp', 'thời trang'],
        'price_range': (300000, 900000),
        'colors': ['Xanh Đậm', 'Xanh Nhạt', 'Đen', 'Xám', 'Rách'],
        'sizes': ['28', '29', '30', '31', '32', '33', '34']
    },
    'Áo Khoác Nam': {
        'products': [
            'Áo Khoác Bomber', 'Áo Khoác Hoodie', 'Áo Khoác Gió',
            'Áo Khoác Denim', 'Áo Khoác Da', 'Áo Khoác Blazer',
            'Áo Khoác Thể Thao', 'Áo Khoác Dù'
        ],
        'materials': ['Polyester', 'Nylon', 'Cotton', 'Denim', 'Da PU'],
        'tags': ['nam', 'áo khoác', 'mùa đông', 'ấm áp', 'thời trang'],
        'price_range': (400000, 1500000),
        'colors': ['Đen', 'Xanh Navy', 'Xám', 'Nâu', 'Be', 'Rêu'],
        'sizes': ['M', 'L', 'XL', 'XXL']
    },
    'Áo Thun Nữ': {
        'products': [
            'Áo Thun Nữ Basic', 'Áo Thun Croptop', 'Áo Thun Form Rộng Nữ',
            'Áo Thun Ba Lỗ', 'Áo Thun Tay Dài Nữ', 'Áo Thun Cotton Nữ'
        ],
        'materials': ['Cotton', 'Spandex', 'Modal', 'Bamboo'],
        'tags': ['nữ', 'áo thun', 'trẻ trung', 'năng động', 'thời trang'],
        'price_range': (150000, 450000),
        'colors': ['Trắng', 'Đen', 'Hồng', 'Be', 'Xanh Pastel', 'Tím'],
        'sizes': ['S', 'M', 'L', 'XL']
    },
    'Quần Jean Nữ': {
        'products': [
            'Quần Jean Skinny Nữ', 'Quần Jean Baggy Nữ', 'Quần Jean Ống Rộng Nữ',
            'Quần Jean Rách Nữ', 'Quần Jean Lưng Cao', 'Quần Jean Boyfriend'
        ],
        'materials': ['Denim', 'Denim Stretch', 'Cotton Denim'],
        'tags': ['nữ', 'quần jean', 'thời trang', 'cá tính', 'trendy'],
        'price_range': (300000, 850000),
        'colors': ['Xanh Đậm', 'Xanh Nhạt', 'Đen', 'Trắng'],
        'sizes': ['25', '26', '27', '28', '29', '30']
    },
    'Giày Sneaker': {
        'products': [
            'Giày Sneaker Nam', 'Giày Sneaker Nữ', 'Giày Thể Thao',
            'Giày Sneaker Trắng', 'Giày Running', 'Giày Basketball',
            'Giày Sneaker Canvas', 'Giày Sneaker Cao Cổ'
        ],
        'materials': ['Canvas', 'Da PU', 'Mesh', 'Synthetic'],
        'tags': ['giày', 'sneaker', 'thể thao', 'năng động', 'phong cách'],
        'price_range': (400000, 2000000),
        'colors': ['Trắng', 'Đen', 'Xám', 'Đỏ', 'Xanh Navy', 'Be'],
        'sizes': ['36', '37', '38', '39', '40', '41', '42', '43', '44']
    },
    'Túi Xách': {
        'products': [
            'Túi Xách Nữ', 'Túi Tote', 'Túi Đeo Chéo', 'Balo Nam',
            'Balo Nữ', 'Túi Laptop', 'Túi Du Lịch', 'Túi Clutch'
        ],
        'materials': ['Da PU', 'Canvas', 'Da Thật', 'Vải'],
        'tags': ['túi xách', 'phụ kiện', 'thời trang', 'tiện dụng'],
        'price_range': (200000, 1500000),
        'colors': ['Đen', 'Nâu', 'Be', 'Xám', 'Đỏ Đô'],
        'sizes': ['One Size']
    },
}

# ==================== HELPER FUNCTIONS ====================

def create_categories():
    """Tạo categories với parent-child relationship"""
    print("\n📁 Creating Categories...")
    categories = {}
    
    # Tạo parent categories trước
    for cat_data in CATEGORIES_DATA:
        if cat_data['parent'] is None:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'parent': None}
            )
            categories[cat_data['name']] = cat
            if created:
                print(f"  ✓ Created: {cat.name}")
    
    # Tạo child categories
    for cat_data in CATEGORIES_DATA:
        if cat_data['parent'] is not None:
            parent = categories.get(cat_data['parent'])
            if parent:
                cat, created = Category.objects.get_or_create(
                    name=cat_data['name'],
                    defaults={'parent': parent}
                )
                categories[cat_data['name']] = cat
                if created:
                    print(f"  ✓ Created: {cat.name} (parent: {parent.name})")
    
    return categories

def create_brands():
    """Tạo brands"""
    print("\n🏷️  Creating Brands...")
    brands = []
    for brand_data in BRANDS_DATA:
        brand, created = Brand.objects.get_or_create(
            name=brand_data['name'],
            defaults={'description': brand_data['description']}
        )
        brands.append(brand)
        if created:
            print(f"  ✓ Created: {brand.name}")
    return brands

def generate_product_name(template, brand):
    """Tạo tên sản phẩm"""
    return f"{template} {brand.name}"

def generate_description(product_name, material, tags):
    """Tạo mô tả sản phẩm"""
    tag_str = ", ".join(tags[:3])
    return f"""{product_name} chất liệu {material} cao cấp, thiết kế hiện đại, 
phù hợp cho phong cách {tag_str}. Sản phẩm được làm từ chất liệu {material} 
thoáng mát, bền đẹp, giữ form tốt. Dễ dàng phối đồ cho nhiều hoàn cảnh khác nhau."""

def generate_short_description(product_name, material):
    """Tạo mô tả ngắn"""
    return f"{product_name} chất liệu {material}, thiết kế hiện đại, thời trang"

def create_product_with_variants(category, brand, template_data, index):
    """Tạo sản phẩm với đầy đủ variants, images, SKUs"""
    
    # Random product template
    product_template = random.choice(template_data['products'])
    material = random.choice(template_data['materials'])
    
    # Tạo Product
    product_name = generate_product_name(product_template, brand)
    
    # Random tags (3-5 tags)
    num_tags = random.randint(3, 5)
    product_tags = random.sample(template_data['tags'], min(num_tags, len(template_data['tags'])))
    
    # Random stats để test
    sold_count = random.randint(0, 500)
    view_count = random.randint(sold_count, sold_count * 3)  # View nhiều hơn sold
    avg_rating = round(random.uniform(3.5, 5.0), 2)
    
    product = Product.objects.create(
        name=product_name,
        description=generate_description(product_name, material, product_tags),
        short_description=generate_short_description(product_name, material),
        category=category,
        brand=brand,
        material=material,
        tags=product_tags,
        sold_count=sold_count,
        view_count=view_count,
        avg_rating=Decimal(str(avg_rating)),
        is_active=True,
        is_featured=random.choice([True, False]) if sold_count > 100 else False,
        is_new=random.choice([True, False]) if index > 70 else False,
    )
    
    # Tạo 2-4 variants (màu sắc khác nhau)
    num_colors = random.randint(2, min(4, len(template_data['colors'])))
    selected_colors = random.sample(template_data['colors'], num_colors)
    
    for color in selected_colors:
        # Random giá cho mỗi màu
        base_price = random.randint(*template_data['price_range'])
        price = Decimal(str(base_price))
        
        # 30% chance có discount
        discount_price = None
        if random.random() < 0.3:
            discount_percent = random.choice([10, 15, 20, 25, 30])
            discount_price = price * (100 - discount_percent) / 100
        
        variant = ProductVariant.objects.create(
            product=product,
            color=color,
            price=price,
            discount_price=discount_price,
            is_active=True
        )
        
        # Tạo 1-3 images cho variant
        num_images = random.randint(1, 3)
        for img_idx in range(num_images):
            ProductVariantImage.objects.create(
                variant=variant,
                is_primary=(img_idx == 0),
                order=img_idx
            )
        
        # Tạo SKUs cho các sizes
        for size in template_data['sizes']:
            stock = random.randint(10, 200)
            ProductSKU.objects.create(
                variant=variant,
                size=size,
                stock_quantity=stock,
                reserved_quantity=0,
                minimum_stock=5,
                reorder_point=10,
                cost_price=price * Decimal('0.6'),  # Cost = 60% giá bán
                is_active=True
            )
    
    return product

# ==================== MAIN GENERATION ====================

def main():
    print("=" * 80)
    print("🚀 BẮT ĐẦU TẠO 100 SẢN PHẨM THỜI TRANG")
    print("=" * 80)
    
    # Tạo categories và brands
    categories = create_categories()
    brands = create_brands()
    
    print("\n📦 Creating Products with full structure...")
    print("-" * 80)
    
    # Tạo sản phẩm cho mỗi category template
    products_created = 0
    target = 100
    
    category_templates = {
        'Áo Thun Nam': categories.get('Áo Thun Nam'),
        'Áo Sơ Mi Nam': categories.get('Áo Sơ Mi Nam'),
        'Quần Jean Nam': categories.get('Quần Jean Nam'),
        'Áo Khoác Nam': categories.get('Áo Khoác Nam'),
        'Áo Thun Nữ': categories.get('Áo Thun Nữ'),
        'Quần Jean Nữ': categories.get('Quần Jean Nữ'),
        'Giày Sneaker': categories.get('Giày Sneaker'),
        'Túi Xách': categories.get('Túi Xách'),
    }
    
    while products_created < target:
        for cat_name, category in category_templates.items():
            if products_created >= target:
                break
            
            if category is None:
                continue
            
            # Random brand
            brand = random.choice(brands)
            
            # Tạo sản phẩm
            template_data = PRODUCT_TEMPLATES[cat_name]
            product = create_product_with_variants(
                category=category,
                brand=brand,
                template_data=template_data,
                index=products_created
            )
            
            products_created += 1
            
            # In progress
            if products_created % 10 == 0:
                print(f"✓ Created {products_created}/{target} products...")
            
            # In chi tiết một số sản phẩm
            if products_created <= 5 or products_created % 20 == 0:
                print(f"\n  [{products_created}] {product.name}")
                print(f"      Category: {product.category.name} | Brand: {product.brand.name}")
                print(f"      Tags: {product.tags}")
                print(f"      Stats: 📊 Sold: {product.sold_count} | 👁️ Views: {product.view_count} | ⭐ Rating: {product.avg_rating}")
                print(f"      Variants: {product.variants.count()} colors")
                print(f"      SKUs: {ProductSKU.objects.filter(variant__product=product).count()} items")
    
    # Summary
    print("\n" + "=" * 80)
    print("✅ HOÀN TẤT TẠO DỮ LIỆU")
    print("=" * 80)
    print(f"\n📊 THỐNG KÊ:")
    print(f"   • Categories: {Category.objects.count()}")
    print(f"   • Brands: {Brand.objects.count()}")
    print(f"   • Products: {Product.objects.count()}")
    print(f"   • Variants: {ProductVariant.objects.count()}")
    print(f"   • Images: {ProductVariantImage.objects.count()}")
    print(f"   • SKUs: {ProductSKU.objects.count()}")
    
    # Best sellers
    print(f"\n🔥 SẢN PHẨM BÁN CHẠY (Top 5):")
    for p in Product.objects.filter(sold_count__gt=0).order_by('-sold_count')[:5]:
        print(f"   • {p.name}: {p.sold_count} sold | {p.avg_rating}⭐")
    
    # Highest rated
    print(f"\n⭐ SẢN PHẨM ĐÁNH GIÁ CAO (Top 5):")
    for p in Product.objects.filter(avg_rating__gt=0).order_by('-avg_rating')[:5]:
        print(f"   • {p.name}: {p.avg_rating}⭐ | {p.sold_count} sold")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
