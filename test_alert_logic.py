"""
Script test logic resolve alerts
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import ProductVariant, StockAlert

# Tìm variant có stock thấp (có alerts)
# Tính available = stock - reserved
variants = ProductVariant.objects.all()
variant = None
for v in variants:
    available = v.stock_quantity - v.reserved_quantity
    if 0 < available <= 3:  # Tìm variant có available rất thấp (1-3)
        variant = v
        break

# Nếu không có, lấy variant có available thấp nhất
if not variant:
    for v in variants:
        available = v.stock_quantity - v.reserved_quantity
        if available > 0:
            if not variant or available < (variant.stock_quantity - variant.reserved_quantity):
                variant = v

if not variant:
    print("❌ Không tìm thấy variant có available thấp")
else:
    available = variant.stock_quantity - variant.reserved_quantity
    print(f"📦 Variant: {variant.product.name} - {variant.size}/{variant.color}")
    print(f"   Stock: {variant.stock_quantity}")
    print(f"   Reserved: {variant.reserved_quantity}")
    print(f"   Available: {available}")
    print(f"   Minimum: {variant.minimum_stock}")
    print(f"   Reorder: {variant.reorder_point}")
    
    # Check alerts
    alerts = StockAlert.objects.filter(product_variant=variant, is_resolved=False)
    print(f"\n⚠️  Alerts chưa giải quyết: {alerts.count()}")
    for alert in alerts:
        print(f"   - {alert.get_alert_type_display()}: current_qty={alert.current_quantity}, threshold={alert.threshold}")
    
    # Test scenarios
    print(f"\n� GIẢI THÍCH LOGIC MỚI:")
    print(f"   ✅ out_of_stock: Resolve khi available > 0")
    print(f"   ✅ low_stock: Resolve khi available > minimum_stock ({variant.minimum_stock})")
    print(f"   ✅ reorder_needed: Resolve khi available > reorder_point ({variant.reorder_point})")
    
    if available == 0:
        print(f"\n🔧 Scenario 1: Nhập kho 1 cái (0 → 1)")
        print(f"   Expected: Alert 'out_of_stock' RESOLVED ngay lập tức")
        print(f"   Alert 'low_stock' và 'reorder_needed' vẫn còn")
    elif available <= variant.minimum_stock:
        print(f"\n🔧 Scenario hiện tại: Available = {available}")
        print(f"   - Nếu available = 0: Alert 'out_of_stock'")
        print(f"   - Nếu 0 < available ≤ {variant.minimum_stock}: Alert 'low_stock'")
        print(f"   - Nếu available ≤ {variant.reorder_point}: Alert 'reorder_needed'")
        
        need_import = variant.minimum_stock - available + 1
        print(f"\n   Để resolve 'low_stock', cần nhập thêm: {need_import} cái")
        print(f"   Sau khi nhập → Available = {available + need_import} > {variant.minimum_stock} ✅")
