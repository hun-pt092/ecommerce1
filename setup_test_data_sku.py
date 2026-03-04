"""
Setup Test Data with ProductSKU Architecture
Tạo products, variants (colors), images, SKUs (sizes) với stock
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import (
    Category, Brand, Product, ProductVariant, 
    ProductVariantImage, ProductSKU, User
)
from django.core.files.base import ContentFile
from PIL import Image
from io import BytesIO

def create_dummy_image(color_name, order=0):
    """Tạo ảnh màu dummy"""
    img = Image.new('RGB', (800, 800), color=color_name.lower())
    buffer = BytesIO()
    img.save(buffer, 'JPEG')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f'{color_name.lower()}_{order}.jpg')

def setup_test_data():
    print("=" * 60)
    print("SETUP TEST DATA WITH PRODUCTSKU ARCHITECTURE")
    print("=" * 60)
    
    # 1. Tạo Categories
    print("\n1. Tạo Categories...")
    categories_data = ["Áo nam", "Áo nữ", "Quần nam", "Quần nữ", "Phụ kiện"]
    categories = {}
    for cat_name in categories_data:
        category, created = Category.objects.get_or_create(name=cat_name)
        categories[cat_name] = category
        print(f"   {'✓' if created else '→'} {cat_name}")
    
    # 2. Tạo Brands
    print("\n2. Tạo Brands...")
    brands_data = [
        {"name": "Nike", "description": "Just Do It"},
        {"name": "Adidas", "description": "Impossible is Nothing"},
        {"name": "Uniqlo", "description": "Made for All"},
    ]
    brands = {}
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=brand_data["name"],
            defaults={"description": brand_data["description"]}
        )
        brands[brand_data["name"]] = brand
        print(f"   {'✓' if created else '→'} {brand_data['name']}")
    
    # 3. Tạo Test User
    print("\n3. Tạo Test User...")
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"   ✓ Created: testuser (password: testpass123)")
    else:
        print(f"   → User exists: testuser")
    
    # 4. Tạo Products với Variants, Images, SKUs
    print("\n4. Tạo Products với Variants, Images, SKUs...")
    
    products_data = [
        {
            "name": "Áo thun Nike Basic",
            "short_description": "Áo thun cotton thoáng mát",
            "description": "Áo thun Nike chất liệu cotton 100%, form regular fit",
            "category": "Áo nam",
            "brand": "Nike",
            "material": "Cotton 100%",
            "variants": [
                {
                    "color": "Black",
                    "price": Decimal("450000"),
                    "discount_price": Decimal("399000"),
                    "images_count": 3,
                    "sizes": [
                        {"size": "S", "stock": 20, "cost": Decimal("200000")},
                        {"size": "M", "stock": 30, "cost": Decimal("200000")},
                        {"size": "L", "stock": 25, "cost": Decimal("200000")},
                        {"size": "XL", "stock": 15, "cost": Decimal("200000")},
                    ]
                },
                {
                    "color": "White",
                    "price": Decimal("450000"),
                    "discount_price": Decimal("399000"),
                    "images_count": 3,
                    "sizes": [
                        {"size": "S", "stock": 15, "cost": Decimal("200000")},
                        {"size": "M", "stock": 25, "cost": Decimal("200000")},
                        {"size": "L", "stock": 20, "cost": Decimal("200000")},
                        {"size": "XL", "stock": 10, "cost": Decimal("200000")},
                    ]
                },
                {
                    "color": "Blue",
                    "price": Decimal("450000"),
                    "discount_price": None,
                    "images_count": 2,
                    "sizes": [
                        {"size": "S", "stock": 10, "cost": Decimal("200000")},
                        {"size": "M", "stock": 15, "cost": Decimal("200000")},
                        {"size": "L", "stock": 12, "cost": Decimal("200000")},
                    ]
                },
            ]
        },
        {
            "name": "Áo Polo Adidas Premium",
            "short_description": "Áo polo thể thao cao cấp",
            "description": "Áo polo Adidas với công nghệ Climacool, thấm hút mồ hôi tốt",
            "category": "Áo nam",
            "brand": "Adidas",
            "material": "Polyester",
            "variants": [
                {
                    "color": "Navy",
                    "price": Decimal("650000"),
                    "discount_price": Decimal("550000"),
                    "images_count": 3,
                    "sizes": [
                        {"size": "M", "stock": 20, "cost": Decimal("300000")},
                        {"size": "L", "stock": 18, "cost": Decimal("300000")},
                        {"size": "XL", "stock": 12, "cost": Decimal("300000")},
                    ]
                },
                {
                    "color": "Red",
                    "price": Decimal("650000"),
                    "discount_price": Decimal("550000"),
                    "images_count": 2,
                    "sizes": [
                        {"size": "M", "stock": 15, "cost": Decimal("300000")},
                        {"size": "L", "stock": 10, "cost": Decimal("300000")},
                    ]
                },
            ]
        },
        {
            "name": "Quần Jean Uniqlo Slim",
            "short_description": "Quần jean co giãn thoải mái",
            "description": "Quần jean Uniqlo với chất liệu co giãn, form slim fit hiện đại",
            "category": "Quần nam",
            "brand": "Uniqlo",
            "material": "Cotton + Spandex",
            "variants": [
                {
                    "color": "DarkBlue",
                    "price": Decimal("790000"),
                    "discount_price": Decimal("690000"),
                    "images_count": 4,
                    "sizes": [
                        {"size": "29", "stock": 12, "cost": Decimal("350000")},
                        {"size": "30", "stock": 18, "cost": Decimal("350000")},
                        {"size": "31", "stock": 15, "cost": Decimal("350000")},
                        {"size": "32", "stock": 20, "cost": Decimal("350000")},
                        {"size": "33", "stock": 10, "cost": Decimal("350000")},
                    ]
                },
                {
                    "color": "Black",
                    "price": Decimal("790000"),
                    "discount_price": None,
                    "images_count": 3,
                    "sizes": [
                        {"size": "30", "stock": 10, "cost": Decimal("350000")},
                        {"size": "31", "stock": 12, "cost": Decimal("350000")},
                        {"size": "32", "stock": 15, "cost": Decimal("350000")},
                    ]
                },
            ]
        },
    ]
    
    created_products = []
    
    for product_data in products_data:
        print(f"\n   → Creating: {product_data['name']}")
        
        # Tạo Product
        product, created = Product.objects.get_or_create(
            name=product_data["name"],
            defaults={
                "short_description": product_data["short_description"],
                "description": product_data["description"],
                "category": categories[product_data["category"]],
                "brand": brands[product_data["brand"]],
                "material": product_data["material"],
                "is_active": True,
                "is_featured": True,
            }
        )
        
        if created:
            print(f"     ✓ Product created")
        else:
            print(f"     → Product exists, clearing variants...")
            product.variants.all().delete()  # Xóa variants cũ
        
        created_products.append(product)
        
        # Tạo Variants với Images và SKUs
        for variant_data in product_data["variants"]:
            print(f"       → Variant: {variant_data['color']}")
            
            variant = ProductVariant.objects.create(
                product=product,
                color=variant_data["color"],
                price=variant_data["price"],
                discount_price=variant_data["discount_price"],
                is_active=True
            )
            
            # Tạo Images cho variant
            for i in range(variant_data["images_count"]):
                image_file = create_dummy_image(variant_data["color"], i)
                ProductVariantImage.objects.create(
                    variant=variant,
                    image=image_file,
                    is_primary=(i == 0),
                    order=i
                )
            print(f"         ✓ {variant_data['images_count']} images")
            
            # Tạo SKUs cho variant
            for sku_data in variant_data["sizes"]:
                ProductSKU.objects.create(
                    variant=variant,
                    size=sku_data["size"],
                    stock_quantity=sku_data["stock"],
                    cost_price=sku_data["cost"],
                    minimum_stock=5,
                    reorder_point=10,
                    is_active=True
                )
            print(f"         ✓ {len(variant_data['sizes'])} SKUs (sizes)")
    
    # 5. Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Categories: {Category.objects.count()}")
    print(f"Brands: {Brand.objects.count()}")
    print(f"Products: {Product.objects.count()}")
    print(f"Variants: {ProductVariant.objects.count()}")
    print(f"Images: {ProductVariantImage.objects.count()}")
    print(f"SKUs: {ProductSKU.objects.count()}")
    print(f"Users: {User.objects.filter(username='testuser').count()}")
    
    # Print sample SKUs
    print("\n" + "=" * 60)
    print("SAMPLE SKUs FOR TESTING")
    print("=" * 60)
    first_product = created_products[0]
    print(f"\nProduct: {first_product.name}")
    for variant in first_product.variants.all()[:2]:
        print(f"\n  Color: {variant.color} (Price: {variant.get_final_price():,.0f}₫)")
        for sku in variant.skus.all()[:3]:
            print(f"    - SKU ID: {sku.id:3d} | Size: {sku.size:3s} | Stock: {sku.stock_quantity:3d} | Available: {sku.available_quantity:3d}")
    
    print("\n" + "=" * 60)
    print("✓ TEST DATA SETUP COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. python manage.py runserver")
    print("2. Login: testuser / testpass123")
    print("3. Test cart → order → stock flow")
    print()
    
    return created_products

if __name__ == "__main__":
    setup_test_data()
