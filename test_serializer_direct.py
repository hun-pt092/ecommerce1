"""
Test serializer trực tiếp
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Product
from shop.serializers import ProductSerializer

print("=" * 80)
print("🧪 TEST PRODUCT SERIALIZER")
print("=" * 80)

# Lấy 1 sản phẩm
product = Product.objects.first()

if product:
    print(f"\nProduct: {product.name}")
    print(f"Has variants: {product.variants.count()}")
    print(f"Has images: {product.variants.first().images.count() if product.variants.first() else 0}")
    
    # Test serializer
    print("\n🔧 Testing serializer...")
    try:
        serializer = ProductSerializer(product)
        data = serializer.data
        print("✅ Serializer SUCCESS!")
        print(f"\nSerialized data:")
        print(f"  ID: {data.get('id')}")
        print(f"  Name: {data.get('name')}")
        print(f"  Slug: {data.get('slug')}")
        print(f"  Tags: {data.get('tags')}")
        print(f"  Sold: {data.get('sold_count')}")
        print(f"  Views: {data.get('view_count')}")
        print(f"  Rating: {data.get('avg_rating')}")
        print(f"  Best Seller: {data.get('is_best_seller')}")
        print(f"  Display Image: {data.get('display_image')}")
        print(f"  Variants: {len(data.get('variants', []))}")
    except Exception as e:
        print(f"❌ Serializer ERROR: {e}")
        import traceback
        traceback.print_exc()
else:
    print("❌ No products found")

print("\n" + "=" * 80)
