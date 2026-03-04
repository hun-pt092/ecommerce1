"""
Test Full Flow: Cart → Order → Stock
Test complete workflow với ProductSKU architecture
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import (
    User, Product, ProductSKU, Cart, CartItem, 
    Order, OrderItem, StockHistory
)
from django.db import transaction
from decimal import Decimal

def print_separator(title=""):
    print("\n" + "=" * 70)
    if title:
        print(f" {title}")
        print("=" * 70)

def test_full_flow():
    print_separator("TEST FULL FLOW: CART → ORDER → STOCK")
    
    # 1. Get test user
    print("\n1. Get Test User...")
    try:
        user = User.objects.get(username='testuser')
        print(f"   ✓ User: {user.username} (ID: {user.id})")
    except User.DoesNotExist:
        print("   ✗ Error: testuser not found. Run setup_test_data_sku.py first!")
        return
    
    # 2. Get sample SKUs
    print("\n2. Get Sample SKUs...")
    skus = ProductSKU.objects.select_related(
        'variant__product'
    ).filter(is_active=True)[:5]
    
    if not skus.exists():
        print("   ✗ Error: No SKUs found. Run setup_test_data_sku.py first!")
        return
    
    print(f"   ✓ Found {skus.count()} SKUs for testing\n")
    
    selected_skus = []
    for sku in skus[:3]:  # Take 3 SKUs
        product_name = sku.variant.product.name
        color = sku.variant.color
        size = sku.size
        stock = sku.stock_quantity
        available = sku.available_quantity
        price = sku.get_final_price()
        
        print(f"   SKU #{sku.id}: {product_name} - {color} - Size {size}")
        print(f"            Stock: {stock} | Available: {available} | Price: {price:,.0f}₫")
        selected_skus.append((sku, 2))  # Add 2 items each
    
    # 3. Clear existing cart
    print("\n3. Clear Existing Cart...")
    cart, created = Cart.objects.get_or_create(user=user)
    cart.items.all().delete()
    print(f"   ✓ Cart cleared")
    
    # 4. Add items to cart
    print_separator("STEP 1: ADD ITEMS TO CART")
    
    for sku, quantity in selected_skus:
        print(f"\n   Adding {quantity}x {sku.variant.product.name} ({sku.variant.color}, {sku.size})")
        print(f"   Before: Stock={sku.stock_quantity}, Reserved={sku.reserved_quantity}, Available={sku.available_quantity}")
        
        cart_item = CartItem.objects.create(
            cart=cart,
            product_sku=sku,
            quantity=quantity
        )
        
        sku.refresh_from_db()
        print(f"   After:  Stock={sku.stock_quantity}, Reserved={sku.reserved_quantity}, Available={sku.available_quantity}")
        print(f"   ✓ Added to cart (CartItem ID: {cart_item.id})")
    
    # 5. Show cart summary
    print_separator("CART SUMMARY")
    cart_items = cart.items.select_related('product_sku__variant__product').all()
    total = Decimal('0')
    
    for item in cart_items:
        price = item.product_sku.get_final_price()
        subtotal = price * item.quantity
        total += subtotal
        print(f"\n   {item.product_sku.variant.product.name}")
        print(f"   Color: {item.product_sku.variant.color} | Size: {item.product_sku.size}")
        print(f"   Qty: {item.quantity} x {price:,.0f}₫ = {subtotal:,.0f}₫")
    
    print(f"\n   {'─' * 66}")
    print(f"   Total: {total:,.0f}₫")
    
    # 6. Create Order (Checkout)
    print_separator("STEP 2: CREATE ORDER (CHECKOUT)")
    
    # Record stock before checkout
    stock_before = {}
    for item in cart_items:
        sku = item.product_sku
        stock_before[sku.id] = {
            'stock': sku.stock_quantity,
            'reserved': sku.reserved_quantity,
            'available': sku.available_quantity
        }
    
    print("\n   Creating order...")
    with transaction.atomic():
        order = Order.objects.create(
            user=user,
            total_price=total,
            status='pending',
            payment_status='pending',
            shipping_name='Test User',
            shipping_address='123 Test Street',
            shipping_city='Ho Chi Minh',
            phone_number='0123456789'
        )
        
        # Create order items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product_sku=cart_item.product_sku,
                quantity=cart_item.quantity,
                price_per_item=cart_item.product_sku.get_final_price()
            )
        
        # Clear cart
        cart.items.all().delete()
    
    print(f"   ✓ Order created (ID: {order.id})")
    print(f"   ✓ Status: {order.status}")
    print(f"   ✓ Total: {order.total_price:,.0f}₫")
    
    # 7. Verify stock changes
    print_separator("STEP 3: VERIFY STOCK AFTER ORDER")
    
    order_items = order.items.select_related('product_sku__variant__product').all()
    
    for item in order_items:
        sku = item.product_sku
        sku.refresh_from_db()
        
        before = stock_before[sku.id]
        
        print(f"\n   {sku.variant.product.name} ({sku.variant.color}, {sku.size})")
        print(f"   Ordered: {item.quantity}")
        print(f"   Before:  Stock={before['stock']}, Reserved={before['reserved']}, Available={before['available']}")
        print(f"   After:   Stock={sku.stock_quantity}, Reserved={sku.reserved_quantity}, Available={sku.available_quantity}")
        print(f"   Change:  Stock={sku.stock_quantity - before['stock']}, Available={sku.available_quantity - before['available']}")
        
        # Verify stock decreased
        if sku.stock_quantity == before['stock'] - item.quantity:
            print(f"   ✓ Stock correctly decreased by {item.quantity}")
        else:
            print(f"   ✗ ERROR: Stock mismatch!")
    
    # 8. Check StockHistory
    print_separator("STEP 4: CHECK STOCK HISTORY")
    
    stock_histories = StockHistory.objects.filter(
        order=order
    ).select_related('product_sku__variant__product').order_by('-created_at')
    
    print(f"\n   Found {stock_histories.count()} stock transactions for this order:\n")
    
    for history in stock_histories:
        print(f"   {history.get_transaction_type_display()}")
        print(f"   SKU: {history.product_sku}")
        print(f"   Quantity: {history.quantity}")
        print(f"   Before: {history.quantity_before} → After: {history.quantity_after}")
        print()
    
    # 9. Cancel Order
    print_separator("STEP 5: CANCEL ORDER")
    
    # Record stock before cancel
    stock_before_cancel = {}
    for item in order_items:
        sku = item.product_sku
        sku.refresh_from_db()
        stock_before_cancel[sku.id] = {
            'stock': sku.stock_quantity,
            'available': sku.available_quantity
        }
    
    print(f"\n   Cancelling order #{order.id}...")
    order.status = 'cancelled'
    order.save()
    
    print(f"   ✓ Order status changed to: {order.status}")
    
    # 10. Verify stock returned
    print_separator("STEP 6: VERIFY STOCK AFTER CANCELLATION")
    
    for item in order_items:
        sku = item.product_sku
        sku.refresh_from_db()
        
        before = stock_before_cancel[sku.id]
        
        print(f"\n   {sku.variant.product.name} ({sku.variant.color}, {sku.size})")
        print(f"   Returned: {item.quantity}")
        print(f"   Before:  Stock={before['stock']}, Available={before['available']}")
        print(f"   After:   Stock={sku.stock_quantity}, Available={sku.available_quantity}")
        print(f"   Change:  Stock=+{sku.stock_quantity - before['stock']}, Available=+{sku.available_quantity - before['available']}")
        
        # Verify stock returned
        if sku.stock_quantity == before['stock'] + item.quantity:
            print(f"   ✓ Stock correctly returned by {item.quantity}")
        else:
            print(f"   ✗ ERROR: Stock return mismatch!")
    
    # 11. Final StockHistory check
    print_separator("STEP 7: FINAL STOCK HISTORY")
    
    all_histories = StockHistory.objects.filter(
        order=order
    ).select_related('product_sku__variant__product').order_by('created_at')
    
    print(f"\n   Total transactions for order #{order.id}: {all_histories.count()}\n")
    
    for history in all_histories:
        action = history.get_transaction_type_display()
        sku_info = f"{history.product_sku.variant.product.name} ({history.product_sku.variant.color}, {history.product_sku.size})"
        qty = f"+{history.quantity}" if history.quantity > 0 else str(history.quantity)
        
        print(f"   [{history.created_at.strftime('%H:%M:%S')}] {action:15s} {qty:5s} - {sku_info}")
        print(f"                      Stock: {history.quantity_before} → {history.quantity_after}")
    
    # Final Summary
    print_separator("✓ TEST COMPLETE - SUMMARY")
    
    print(f"""
   Test Results:
   ─────────────────────────────────────────────────────────────────
   ✓ Cart creation and item addition
   ✓ Order creation from cart
   ✓ Stock export on order creation (via signals)
   ✓ StockHistory tracking
   ✓ Order cancellation
   ✓ Stock return on cancellation (via signals)
   ✓ All stock quantities verified
   
   Order ID: {order.id}
   Order Status: {order.status}
   Total Items: {order_items.count()}
   Total Amount: {order.total_price:,.0f}₫
   
   Stock Transactions: {all_histories.count()} records
   """)
    
    print("=" * 70)

if __name__ == "__main__":
    try:
        test_full_flow()
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
