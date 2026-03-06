"""
Test update product logic - verify images are preserved
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Product, ProductVariant, ProductVariantImage

print("=" * 80)
print("🧪 TEST: Kiểm tra ảnh variant sau khi update")
print("=" * 80)

# Tìm sản phẩm có ảnh
products_with_images = Product.objects.filter(
    variants__images__isnull=False
).distinct()

if products_with_images.exists():
    product = products_with_images.first()
    
    print(f"\n📦 Product: {product.name} (ID: {product.id})")
    print(f"   Variants: {product.variants.count()}")
    
    for variant in product.variants.all():
        images_count = variant.images.count()
        print(f"\n   🎨 Variant: {variant.color}")
        print(f"      Images: {images_count}")
        
        if images_count > 0:
            for img in variant.images.all():
                print(f"         • {img.image.name if img.image else 'No file'} (primary: {img.is_primary})")
        else:
            print(f"         ⚠️  NO IMAGES!")
    
    print("\n" + "=" * 80)
    print("📝 HƯỚNG DẪN TEST:")
    print("=" * 80)
    print(f"1. Vào trang edit: http://localhost:3000/admin/products/edit/{product.id}")
    print(f"2. KHÔNG thay đổi ảnh, chỉ sửa tên hoặc mô tả")
    print(f"3. Click 'Cập nhật sản phẩm'")
    print(f"4. Reload trang và kiểm tra ảnh vẫn còn")
    print(f"5. Chạy lại script này để verify:")
    print(f"   python test_preserve_images.py")
    
else:
    print("\n❌ Không tìm thấy sản phẩm nào có ảnh")
    print("Chạy script tạo data hoặc upload ảnh thủ công")

print("\n" + "=" * 80)
