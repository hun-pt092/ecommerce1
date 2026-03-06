"""
Script xóa các ProductVariantImage không có file ảnh
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import ProductVariantImage

print("=" * 80)
print("🧹 XÓA CÁC IMAGE RECORDS KHÔNG CÓ FILE")
print("=" * 80)

# Đếm tổng số images
total_images = ProductVariantImage.objects.count()
print(f"\nTổng số ProductVariantImage: {total_images}")

# Tìm các images không có file
images_without_file = []
for img in ProductVariantImage.objects.all():
    if not img.image:
        images_without_file.append(img)

print(f"Images không có file: {len(images_without_file)}")

if images_without_file:
    print("\n🗑️  Đang xóa...")
    for img in images_without_file:
        img.delete()
    print(f"✅ Đã xóa {len(images_without_file)} images không có file")
else:
    print("✅ Không có images nào cần xóa")

print(f"\nTổng số ProductVariantImage còn lại: {ProductVariantImage.objects.count()}")
print("=" * 80)
