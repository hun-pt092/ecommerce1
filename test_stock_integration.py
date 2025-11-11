# TEST SCRIPT - Verify Stock Management Integration
# Run: python manage.py runscript test_stock_integration
# Or: python manage.py shell < test_stock_integration.py

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from shop.models import Product, ProductVariant, Order, OrderItem, Cart, CartItem, StockHistory
from shop.services.stock_service import StockService
from django.db import transaction

User = get_user_model()

print("=" * 60)
print("🧪 TESTING STOCK MANAGEMENT INTEGRATION")
print("=" * 60)

# Setup test data
try:
    # Get or create admin user
    admin = User.objects.filter(is_admin=True).first()
    if not admin:
        admin = User.objects.create_user(
            username='admin_test',
            password='admin123',
            is_admin=True
        )
        print("✅ Created admin user")
    else:
        print(f"✅ Using admin: {admin.username}")
    
    # Get or create test user
    user = User.objects.filter(is_admin=False).first()
    if not user:
        user = User.objects.create_user(
            username='customer_test',
            password='test123'
        )
        print("✅ Created customer user")
    else:
        print(f"✅ Using customer: {user.username}")
    
    # Get a product variant with stock
    variant = ProductVariant.objects.filter(stock_quantity__gt=0).first()
    if not variant:
        print("❌ No product variant with stock found!")
        exit(1)
    
    print(f"✅ Using variant: {variant.product.name} - {variant.color}/{variant.size}")
    print(f"   Stock before: {variant.stock_quantity}")
    print(f"   Reserved: {variant.reserved_quantity}")
    print(f"   Available: {variant.available_quantity}")
    
    print("\n" + "=" * 60)
    print("TEST 1: Import Stock")
    print("=" * 60)
    
    # Test 1: Import stock
    try:
        result = StockService.import_stock(
            product_variant=variant,
            quantity=50,
            cost_per_item=100000,
            reference_number="TEST-IMPORT-001",
            notes="Test import for integration",
            user=admin
        )
        
        print("✅ Import stock SUCCESS")
        variant.refresh_from_db()
        print(f"   Stock after import: {variant.stock_quantity}")
        
        # Check StockHistory
        history = StockHistory.objects.filter(
            product_variant=variant,
            reference_number="TEST-IMPORT-001"
        ).first()
        
        if history:
            print(f"✅ StockHistory created:")
            print(f"   - Type: {history.transaction_type}")
            print(f"   - Quantity: {history.quantity}")
            print(f"   - Before: {history.quantity_before}")
            print(f"   - After: {history.quantity_after}")
            print(f"   - User: {history.created_by.username if history.created_by else 'N/A'}")
        else:
            print("❌ StockHistory NOT created")
            
    except Exception as e:
        print(f"❌ Import stock FAILED: {str(e)}")
    
    print("\n" + "=" * 60)
    print("TEST 2: Create Order (Export Stock)")
    print("=" * 60)
    
    # Test 2: Create order (export stock)
    initial_stock = variant.stock_quantity
    order_qty = 2
    
    # Create order
    order = Order.objects.create(
        user=user,
        total_price=variant.product.price * order_qty,
        shipping_name="Test Customer",
        shipping_address="123 Test St",
        shipping_city="Test City"
    )
    
    # Create order item
    OrderItem.objects.create(
        order=order,
        product_variant=variant,
        quantity=order_qty,
        price_per_item=variant.product.price
    )
    
    # Export stock (simulating CreateOrderFromCartView)
    try:
        result = StockService.export_stock(
            product_variant=variant,
            quantity=order_qty,
            order=order,
            user=user,
            notes=f"Order #{order.id} - Customer checkout"
        )
        
        print(f"✅ Export stock SUCCESS for Order #{order.id}")
        variant.refresh_from_db()
        print(f"   Stock before: {initial_stock}")
        print(f"   Stock after: {variant.stock_quantity}")
        print(f"   Difference: -{order_qty}")
        
        # Check StockHistory
        history = StockHistory.objects.filter(
            product_variant=variant,
            order=order,
            transaction_type='export'
        ).first()
        
        if history:
            print(f"✅ StockHistory created for Order #{order.id}:")
            print(f"   - Type: {history.transaction_type}")
            print(f"   - Quantity: {history.quantity}")
            print(f"   - Order: #{history.order.id}")
            print(f"   - User: {history.created_by.username if history.created_by else 'N/A'}")
        else:
            print("❌ StockHistory NOT linked to Order")
            
    except Exception as e:
        print(f"❌ Export stock FAILED: {str(e)}")
    
    print("\n" + "=" * 60)
    print("TEST 3: Cancel Order (Return Stock)")
    print("=" * 60)
    
    # Test 3: Cancel order (return stock)
    stock_before_cancel = variant.stock_quantity
    
    try:
        result = StockService.return_stock(
            product_variant=variant,
            quantity=order_qty,
            order=order,
            user=user,
            notes=f"Order #{order.id} cancelled by customer"
        )
        
        print(f"✅ Return stock SUCCESS for Order #{order.id}")
        variant.refresh_from_db()
        print(f"   Stock before cancel: {stock_before_cancel}")
        print(f"   Stock after cancel: {variant.stock_quantity}")
        print(f"   Difference: +{order_qty}")
        
        # Check StockHistory
        history = StockHistory.objects.filter(
            product_variant=variant,
            order=order,
            transaction_type='return'
        ).first()
        
        if history:
            print(f"✅ StockHistory created for cancelled order:")
            print(f"   - Type: {history.transaction_type}")
            print(f"   - Quantity: {history.quantity}")
            print(f"   - Order: #{history.order.id}")
            print(f"   - Notes: {history.notes}")
        else:
            print("❌ StockHistory NOT created for return")
            
    except Exception as e:
        print(f"❌ Return stock FAILED: {str(e)}")
    
    # Update order status
    order.status = 'cancelled'
    order.save()
    print(f"✅ Order #{order.id} status updated to 'cancelled'")
    
    print("\n" + "=" * 60)
    print("TEST 4: Check Stock History for Order")
    print("=" * 60)
    
    # Check all stock history for this order
    order_history = StockHistory.objects.filter(order=order).order_by('created_at')
    
    if order_history.exists():
        print(f"✅ Found {order_history.count()} StockHistory records for Order #{order.id}:")
        for i, h in enumerate(order_history, 1):
            print(f"\n   {i}. {h.transaction_type.upper()}")
            print(f"      - Quantity: {h.quantity}")
            print(f"      - Before: {h.quantity_before} → After: {h.quantity_after}")
            print(f"      - Time: {h.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"      - User: {h.created_by.username}")
            print(f"      - Notes: {h.notes}")
    else:
        print(f"❌ No StockHistory found for Order #{order.id}")
    
    print("\n" + "=" * 60)
    print("TEST 5: Check Stock Alerts")
    print("=" * 60)
    
    from shop.models import StockAlert
    
    # Check alerts for this variant
    alerts = StockAlert.objects.filter(product_variant=variant, is_resolved=False)
    
    if alerts.exists():
        print(f"✅ Found {alerts.count()} active alerts for variant:")
        for alert in alerts:
            print(f"   - {alert.get_alert_type_display()}")
            print(f"     Current: {alert.current_quantity}, Threshold: {alert.threshold}")
    else:
        print("ℹ️  No active alerts for this variant")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    variant.refresh_from_db()
    print(f"Final Stock Status:")
    print(f"   Product: {variant.product.name} ({variant.color}/{variant.size})")
    print(f"   Stock Quantity: {variant.stock_quantity}")
    print(f"   Reserved: {variant.reserved_quantity}")
    print(f"   Available: {variant.available_quantity}")
    print(f"   Minimum Stock: {variant.minimum_stock}")
    print(f"   Reorder Point: {variant.reorder_point}")
    print(f"   Is Low Stock: {variant.is_low_stock}")
    print(f"   Need Reorder: {variant.need_reorder}")
    
    print("\n✅ ALL TESTS COMPLETED!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
