#!/usr/bin/env python
"""
Improved script to add comprehensive fashion products data
Compatible with current models and extends existing data
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Category, Brand, Product, ProductVariant

def create_extended_categories():
    """Create comprehensive product categories"""
    categories_data = [
        {"name": "Áo nam", "description": "Các loại áo dành cho nam giới"},
        {"name": "Áo nữ", "description": "Các loại áo dành cho nữ giới"},
        {"name": "Quần nam", "description": "Các loại quần dành cho nam giới"},
        {"name": "Quần nữ", "description": "Các loại quần dành cho nữ giới"},
        {"name": "Phụ kiện", "description": "Các phụ kiện thời trang"},
        {"name": "Giày dép", "description": "Giày và dép thời trang"},
        {"name": "Túi xách", "description": "Túi xách và balo thời trang"},
        {"name": "Đồng hồ", "description": "Đồng hồ thời trang và thể thao"},
    ]
    
    created_categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data["name"]
        )
        created_categories[cat_data["name"]] = category
        print(f"{'Created' if created else 'Found'} category: {category.name}")
    
    return created_categories

def create_extended_brands():
    """Create extended fashion brands"""
    brands_data = [
        {"name": "Nike", "description": "Just Do It - Thương hiệu thể thao hàng đầu"},
        {"name": "Adidas", "description": "Impossible is Nothing - Thương hiệu thể thao từ Đức"},
        {"name": "Uniqlo", "description": "Made for All - Thương hiệu thời trang từ Nhật Bản"},
        {"name": "Zara", "description": "Fashion Forward - Thương hiệu thời trang từ Tây Ban Nha"},
        {"name": "H&M", "description": "Thương hiệu thời trang từ Thụy Điển"},
        {"name": "Calvin Klein", "description": "Thương hiệu thời trang cao cấp từ Mỹ"},
        {"name": "Tommy Hilfiger", "description": "Thương hiệu thời trang Mỹ"},
        {"name": "Local Brand", "description": "Thương hiệu thời trang nội địa"},
    ]
    
    created_brands = {}
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=brand_data["name"],
            defaults={"description": brand_data["description"]}
        )
        created_brands[brand_data["name"]] = brand
        print(f"{'Created' if created else 'Found'} brand: {brand.name}")
    
    return created_brands

def create_comprehensive_products(categories, brands):
    """Create comprehensive products and variants"""
    
    products_data = [
        # === ÁO NAM ===
        {
            "name": "Áo sơ mi trắng basic",
            "short_description": "Áo sơ mi trắng cơ bản cho công sở",
            "description": "Áo sơ mi trắng chất liệu cotton cao cấp, form regular fit, phù hợp cho môi trường công sở và các dịp trang trọng",
            "category": "Áo nam",
            "brand": "Uniqlo",
            "material": "Cotton 100%",
            "price": Decimal("299000"),
            "discount_price": Decimal("249000"),
            "is_featured": True,
            "variants": [
                {"size": "S", "color": "Trắng", "stock": 20},
                {"size": "M", "color": "Trắng", "stock": 25},
                {"size": "L", "color": "Trắng", "stock": 30},
                {"size": "XL", "color": "Trắng", "stock": 15},
            ]
        },
        {
            "name": "Áo polo nam cao cấp",
            "short_description": "Áo polo nam chất liệu cotton cao cấp",
            "description": "Áo polo nam thiết kế thanh lịch, chất liệu cotton co giãn, phù hợp cho cả đi làm và đi chơi",
            "category": "Áo nam",
            "brand": "Calvin Klein",
            "material": "Cotton pha",
            "price": Decimal("499000"),
            "is_new": True,
            "variants": [
                {"size": "S", "color": "Xanh navy", "stock": 15},
                {"size": "M", "color": "Xanh navy", "stock": 20},
                {"size": "L", "color": "Xanh navy", "stock": 18},
                {"size": "M", "color": "Trắng", "stock": 12},
                {"size": "L", "color": "Trắng", "stock": 10},
            ]
        },
        {
            "name": "Áo thun Nike Basic",
            "short_description": "Áo thun cotton 100% thoáng mát",
            "description": "Áo thun Nike chất liệu cotton 100%, form regular fit, phù hợp mặc hàng ngày",
            "category": "Áo nam",
            "brand": "Nike",
            "material": "Cotton 100%",
            "price": Decimal("299000"),
            "discount_price": Decimal("249000"),
            "is_featured": True,
            "variants": [
                {"size": "S", "color": "Đen", "stock": 25},
                {"size": "M", "color": "Đen", "stock": 30},
                {"size": "L", "color": "Đen", "stock": 20},
                {"size": "M", "color": "Trắng", "stock": 15},
                {"size": "L", "color": "Trắng", "stock": 18},
            ]
        },
        
        # === QUẦN NAM ===
        {
            "name": "Quần jean Uniqlo Slim",
            "short_description": "Quần jean dáng slim fit hiện đại",
            "description": "Quần jean Uniqlo chất liệu denim co giãn, dáng slim fit, tôn dáng",
            "category": "Quần nam",
            "brand": "Uniqlo",
            "material": "Denim",
            "price": Decimal("799000"),
            "is_new": True,
            "variants": [
                {"size": "29", "color": "Xanh đậm", "stock": 20},
                {"size": "30", "color": "Xanh đậm", "stock": 25},
                {"size": "31", "color": "Xanh đậm", "stock": 22},
                {"size": "32", "color": "Xanh đậm", "stock": 18},
                {"size": "30", "color": "Đen", "stock": 15},
            ]
        },
        {
            "name": "Quần kaki nam công sở",
            "short_description": "Quần kaki nam cho môi trường công sở",
            "description": "Quần kaki nam chất liệu cotton pha, form straight fit, phù hợp môi trường công sở",
            "category": "Quần nam",
            "brand": "Zara",
            "material": "Cotton pha",
            "price": Decimal("399000"),
            "variants": [
                {"size": "29", "color": "Be", "stock": 18},
                {"size": "30", "color": "Be", "stock": 22},
                {"size": "31", "color": "Be", "stock": 20},
                {"size": "30", "color": "Xanh navy", "stock": 15},
            ]
        },
        
        # === ÁO NỮ ===
        {
            "name": "Áo blouse nữ thanh lịch",
            "short_description": "Áo blouse nữ thiết kế thanh lịch",
            "description": "Áo blouse nữ chất liệu silk pha, thiết kế thanh lịch, phù hợp công sở và dự tiệc",
            "category": "Áo nữ",
            "brand": "Zara",
            "material": "Silk pha",
            "price": Decimal("399000"),
            "discount_price": Decimal("329000"),
            "is_featured": True,
            "variants": [
                {"size": "S", "color": "Trắng", "stock": 20},
                {"size": "M", "color": "Trắng", "stock": 25},
                {"size": "L", "color": "Trắng", "stock": 15},
                {"size": "M", "color": "Hồng pastel", "stock": 18},
            ]
        },
        {
            "name": "Áo crop top nữ",
            "short_description": "Áo crop top nữ phong cách trẻ trung",
            "description": "Áo crop top nữ chất liệu cotton co giãn, phong cách trẻ trung, năng động",
            "category": "Áo nữ",
            "brand": "H&M",
            "material": "Cotton co giãn",
            "price": Decimal("199000"),
            "is_new": True,
            "variants": [
                {"size": "S", "color": "Đen", "stock": 22},
                {"size": "M", "color": "Đen", "stock": 28},
                {"size": "S", "color": "Trắng", "stock": 20},
                {"size": "M", "color": "Trắng", "stock": 25},
            ]
        },
        
        # === QUẦN NỮ ===
        {
            "name": "Quần jean nữ skinny",
            "short_description": "Quần jean nữ form skinny tôn dáng",
            "description": "Quần jean nữ chất liệu denim co giãn, form skinny fit, tôn dáng và thoải mái",
            "category": "Quần nữ",
            "brand": "Zara",
            "material": "Denim co giãn",
            "price": Decimal("549000"),
            "discount_price": Decimal("449000"),
            "variants": [
                {"size": "25", "color": "Xanh nhạt", "stock": 18},
                {"size": "26", "color": "Xanh nhạt", "stock": 22},
                {"size": "27", "color": "Xanh nhạt", "stock": 20},
                {"size": "26", "color": "Đen", "stock": 15},
            ]
        },
        {
            "name": "Chân váy nữ midi",
            "short_description": "Chân váy nữ dáng midi thanh lịch",
            "description": "Chân váy nữ dáng midi, chất liệu polyester cao cấp, thiết kế thanh lịch",
            "category": "Quần nữ",
            "brand": "H&M",
            "material": "Polyester",
            "price": Decimal("299000"),
            "variants": [
                {"size": "S", "color": "Đen", "stock": 20},
                {"size": "M", "color": "Đen", "stock": 25},
                {"size": "L", "color": "Đen", "stock": 18},
                {"size": "M", "color": "Be", "stock": 15},
            ]
        },
        
        # === PHỤ KIỆN ===
        {
            "name": "Túi xách nữ mini",
            "short_description": "Túi xách nữ size mini thời trang",
            "description": "Túi xách nữ size mini, chất liệu da PU cao cấp, thiết kế hiện đại và tiện dụng",
            "category": "Túi xách",
            "brand": "Local Brand",
            "material": "Da PU",
            "price": Decimal("399000"),
            "is_featured": True,
            "variants": [
                {"size": "One Size", "color": "Đen", "stock": 15},
                {"size": "One Size", "color": "Nâu", "stock": 12},
                {"size": "One Size", "color": "Trắng", "stock": 10},
            ]
        },
        {
            "name": "Đồng hồ nam thể thao",
            "short_description": "Đồng hồ nam phong cách thể thao",
            "description": "Đồng hồ nam Nike thiết kế thể thao, chống nước, phù hợp cho các hoạt động thể thao",
            "category": "Đồng hồ",
            "brand": "Nike",
            "material": "Nhựa chống nước",
            "price": Decimal("799000"),
            "variants": [
                {"size": "One Size", "color": "Đen", "stock": 8},
                {"size": "One Size", "color": "Xanh", "stock": 6},
            ]
        },
        {
            "name": "Giày sneaker unisex",
            "short_description": "Giày sneaker phong cách unisex",
            "description": "Giày sneaker Nike Air Max, thiết kế unisex, đế êm ái, phù hợp cho cả nam và nữ",
            "category": "Giày dép",
            "brand": "Nike",
            "material": "Da synthetic + mesh",
            "price": Decimal("1299000"),
            "discount_price": Decimal("1099000"),
            "is_featured": True,
            "variants": [
                {"size": "39", "color": "Trắng", "stock": 10},
                {"size": "40", "color": "Trắng", "stock": 12},
                {"size": "41", "color": "Trắng", "stock": 8},
                {"size": "42", "color": "Trắng", "stock": 6},
                {"size": "40", "color": "Đen", "stock": 5},
            ]
        },
    ]
    
    for product_data in products_data:
        try:
            # Create or get product
            product, created = Product.objects.get_or_create(
                name=product_data["name"],
                defaults={
                    "short_description": product_data["short_description"],
                    "description": product_data["description"],
                    "category": categories[product_data["category"]],
                    "brand": brands[product_data["brand"]],
                    "material": product_data.get("material", ""),
                    "price": product_data["price"],
                    "discount_price": product_data.get("discount_price"),
                    "is_active": True,
                    "is_featured": product_data.get("is_featured", False),
                    "is_new": product_data.get("is_new", False),
                }
            )
            
            print(f"{'Created' if created else 'Found'} product: {product.name}")
            
            # Create variants
            for variant_data in product_data["variants"]:
                variant, variant_created = ProductVariant.objects.get_or_create(
                    product=product,
                    size=variant_data["size"],
                    color=variant_data["color"],
                    defaults={
                        "stock_quantity": variant_data["stock"],
                    }
                )
                if variant_created:
                    print(f"  - Created variant: {variant.size} / {variant.color} / {variant.stock_quantity} items")
                    
        except Exception as e:
            print(f"Error creating product {product_data['name']}: {e}")

def main():
    print("🚀 Starting to add comprehensive fashion products data...")
    print("=" * 60)
    
    try:
        # Create categories
        print("\n📁 Creating/updating categories...")
        categories = create_extended_categories()
        
        # Create brands
        print("\n🏷️ Creating/updating brands...")
        brands = create_extended_brands()
        
        # Create products and variants
        print("\n👕 Creating products and variants...")
        create_comprehensive_products(categories, brands)
        
        print("\n" + "=" * 60)
        print("✅ Successfully added comprehensive fashion products data!")
        print(f"📊 Final Summary:")
        print(f"   - Categories: {Category.objects.count()}")
        print(f"   - Brands: {Brand.objects.count()}")
        print(f"   - Products: {Product.objects.count()}")
        print(f"   - Product Variants: {ProductVariant.objects.count()}")
        print("\n🎯 Next steps:")
        print("   1. Access http://127.0.0.1:8000/admin/")  
        print("   2. Login with: admin / admin12")
        print("   3. Add product images in Products section")
        print("   4. Test the frontend at http://localhost:3000")
        
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()