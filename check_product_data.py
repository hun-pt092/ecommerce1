import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Product, Order, OrderItem, ProductVariant

print("=" * 60)
print("KIỂM TRA DỮ LIỆU SẢN PHẨM VÀ ĐơN HÀNG")
print("=" * 60)

# Kiểm tra sản phẩm có sold_count cao
print("\n1. TOP 10 SẢN PHẨM CÓ SOLD_COUNT CAO NHẤT:")
print("-" * 60)
top_products = Product.objects.order_by('-sold_count')[:10]
for i, p in enumerate(top_products, 1):
    print(f"{i}. {p.name}")
    print(f"   - sold_count: {p.sold_count}")
    print(f"   - is_new: {p.is_new}")
    print(f"   - on_sale: {p.variants.filter(discount_price__isnull=False).exists()}")
    print()

# Kiểm tra thực tế có bao nhiêu đơn hàng
print("\n2. THỐNG KÊ ĐƠN HÀNG:")
print("-" * 60)
total_orders = Order.objects.count()
completed_orders = Order.objects.filter(status='completed').count()
print(f"Tổng số đơn hàng: {total_orders}")
print(f"Đơn hàng hoàn thành: {completed_orders}")
print()

# Kiểm tra các đơn hàng gần đây
print("\n3. 5 ĐƠN HÀNG GẦN NHẤT:")
print("-" * 60)
recent_orders = Order.objects.order_by('-created_at')[:5]
for order in recent_orders:
    items = OrderItem.objects.filter(order=order)
    print(f"Order #{order.id} - {order.status} - {order.created_at.strftime('%Y-%m-%d %H:%M')}")
    print(f"   User: {order.user.email if order.user else 'Guest'}")
    print(f"   Items: {items.count()} sản phẩm")
    for item in items:
        if item.product_sku:
            product_name = item.product_sku.variant.product.name
            sku_code = item.product_sku.sku
            print(f"      - {product_name} ({sku_code}) x{item.quantity}")
        else:
            print(f"      - (Sản phẩm đã xóa) x{item.quantity}")
    print()

# Kiểm tra sold_count vs thực tế order items
print("\n4. SO SÁNH SOLD_COUNT VS THỰC TẾ BÁN:")
print("-" * 60)
print("Lấy 5 sản phẩm có sold_count > 0 để kiểm tra...")
products_with_sales = Product.objects.filter(sold_count__gt=0).order_by('-sold_count')[:5]
for p in products_with_sales:
    # Đếm thực tế từ OrderItem (chỉ tính completed orders)
    from shop.models import ProductSKU
    actual_sold = 0
    # Lấy tất cả SKU của product này thông qua variants
    for variant in p.variants.all():
        for sku in variant.skus.all():
            sold_in_orders = OrderItem.objects.filter(
                product_sku=sku,
                order__status='completed'
            ).aggregate(total=django.db.models.Sum('quantity'))['total'] or 0
            actual_sold += sold_in_orders
    
    print(f"{p.name}:")
    print(f"   - sold_count trong DB: {p.sold_count}")
    print(f"   - Thực tế bán (completed orders): {actual_sold}")
    print(f"   - Chênh lệch: {p.sold_count - actual_sold}")
    print()

# Kiểm tra sản phẩm cụ thể
print("\n5. KIỂM TRA SẢN PHẨM 'GIÀY SNEAKER':")
print("-" * 60)
from shop.models import ProductSKU
sneaker_products = Product.objects.filter(name__icontains='giày sneaker')
for p in sneaker_products:
    print(f"\n{p.name}:")
    print(f"   - ID: {p.id}")
    print(f"   - sold_count: {p.sold_count}")
    print(f"   - is_new: {p.is_new}")
    
    # Lấy 1 variant để xem
    first_variant = p.variants.first()
    if first_variant:
        print(f"   - Giá (variant đầu): {first_variant.price:,.0f}₫")
        if first_variant.discount_price:
            print(f"   - Giá giảm: {first_variant.discount_price:,.0f}₫")
        
        # Lấy 3 SKU đầu tiên
        skus = first_variant.skus.all()[:3]
        for sku in skus:
            print(f"\n   SKU: {sku.sku}")
            print(f"      - Size: {sku.size}")
            print(f"      - Stock: {sku.stock_quantity}")
            
            # Đếm order items
            sold_count = OrderItem.objects.filter(
                product_sku=sku
            ).aggregate(total=django.db.models.Sum('quantity'))['total'] or 0
            print(f"      - Đã bán (tất cả orders): {sold_count}")

print("\n" + "=" * 60)
print("KẾT LUẬN:")
print("=" * 60)
print("Nếu sold_count > thực tế bán từ orders:")
print("  → Data test được seed sẵn (fake data)")
print("  → Không phải từ đơn hàng thật")
print("\nĐề xuất: Reset sold_count về 0 hoặc tính lại từ orders thực tế")
print("=" * 60)
