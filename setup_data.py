import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Category, Brand, Product, ProductVariant

# Tạo categories
print("Tạo categories...")
categories = [
    "Áo nam",
    "Áo nữ", 
    "Quần nam",
    "Quần nữ",
    "Phụ kiện"
]

for cat_name in categories:
    category, created = Category.objects.get_or_create(name=cat_name)
    if created:
        print(f"Tạo category: {cat_name}")

# Tạo brands
print("Tạo brands...")
brands = [
    {"name": "Nike", "description": "Just Do It"},
    {"name": "Adidas", "description": "Impossible is Nothing"},
    {"name": "Uniqlo", "description": "Made for All"},
    {"name": "Zara", "description": "Fashion Forward"},
]

for brand_data in brands:
    brand, created = Brand.objects.get_or_create(
        name=brand_data["name"],
        defaults={"description": brand_data["description"]}
    )
    if created:
        print(f"Tạo brand: {brand_data['name']}")

# Tạo sample products
print("Tạo sample products...")
sample_products = [
    {
        "name": "Áo thun Nike Basic",
        "short_description": "Áo thun cotton 100% thoáng mát",
        "description": "Áo thun Nike chất liệu cotton 100%, form regular fit, phù hợp mặc hàng ngày",
        "category": "Áo nam",
        "brand": "Nike",
        "material": "Cotton 100%",
        "price": 299000,
        "discount_price": 249000,
        "is_featured": True
    },
    {
        "name": "Quần jean Uniqlo Slim",
        "short_description": "Quần jean dáng slim fit hiện đại",
        "description": "Quần jean Uniqlo chất liệu denim co giãn, dáng slim fit, tôn dáng",
        "category": "Quần nam",
        "brand": "Uniqlo", 
        "material": "Denim",
        "price": 799000,
        "is_new": True
    },
    {
        "name": "Áo sơ mi Zara Office",
        "short_description": "Áo sơ mi công sở thanh lịch",
        "description": "Áo sơ mi Zara chất liệu cotton pha, form fitted, phù hợp đi làm",
        "category": "Áo nam",
        "brand": "Zara",
        "material": "Cotton pha",
        "price": 599000,
        "discount_price": 499000
    }
]

for product_data in sample_products:
    try:
        category = Category.objects.get(name=product_data["category"])
        brand = Brand.objects.get(name=product_data["brand"])
        
        product, created = Product.objects.get_or_create(
            name=product_data["name"],
            defaults={
                "short_description": product_data["short_description"],
                "description": product_data["description"],
                "category": category,
                "brand": brand,
                "material": product_data["material"],
                "price": product_data["price"],
                "discount_price": product_data.get("discount_price"),
                "is_featured": product_data.get("is_featured", False),
                "is_new": product_data.get("is_new", False)
            }
        )
        
        if created:
            print(f"Tạo product: {product_data['name']}")
            
            # Tạo variants cho mỗi sản phẩm
            sizes = ["S", "M", "L", "XL"]
            colors = ["Đen", "Trắng", "Xanh navy"]
            
            for size in sizes:
                for color in colors:
                    variant, variant_created = ProductVariant.objects.get_or_create(
                        product=product,
                        size=size,
                        color=color,
                        defaults={"stock_quantity": 10}
                    )
                    if variant_created:
                        print(f"  - Tạo variant: {size} - {color}")
                        
    except Exception as e:
        print(f"Lỗi tạo product {product_data['name']}: {e}")

print("Hoàn thành tạo sample data!")
print("Bây giờ bạn có thể:")
print("1. Truy cập http://127.0.0.1:8000/admin/")
print("2. Đăng nhập với: admin / admin12")
print("3. Thêm ảnh cho các sản phẩm trong phần Products")