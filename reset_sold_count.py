import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Product

print("=" * 60)
print("RESET SOLD_COUNT VỀ 0")
print("=" * 60)

# Đếm products có sold_count > 0
products_with_fake_sales = Product.objects.filter(sold_count__gt=0)
count = products_with_fake_sales.count()

print(f"\nTìm thấy {count} sản phẩm có sold_count > 0 (fake data)")
print("\nVí dụ:")
for p in products_with_fake_sales[:5]:
    print(f"  - {p.name}: sold_count = {p.sold_count}")

choice = input("\n⚠️  RESET TẤT CẢ sold_count về 0? (y/n): ")

if choice.lower() == 'y':
    updated = Product.objects.update(sold_count=0)
    print(f"\n✅ Đã reset {updated} sản phẩm về sold_count = 0")
    print("✅ Giờ sold_count sẽ chỉ tăng khi có đơn hàng thực sự hoàn thành!")
else:
    print("\n❌ Hủy bỏ. Giữ nguyên data test.")

print("\n" + "=" * 60)
print("LƯU Ý:")
print("- sold_count chỉ tăng khi Order.status = 'completed'")
print("- Hiện tại có 0 đơn completed → sold_count nên = 0")
print("- Nếu muốn test chatbot, hãy:")
print("  1. Đặt vài đơn hàng")
print("  2. Chuyển status sang 'completed' trong admin")
print("  3. sold_count sẽ tự động cập nhật (nếu có signal)")
print("=" * 60)
