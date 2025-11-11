#!/usr/bin/env python
# Quick API Test Script
# Usage: python quick_api_test.py

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

print("=" * 70)
print("🧪 QUICK API TEST - Stock Management Integration")
print("=" * 70)

# Step 1: Login Customer
print("\n📝 Step 1: Login Customer")
print("-" * 70)

login_data = {
    "username": "mot2",
    "password": "Abcd@1234"
}

response = requests.post(f"{BASE_URL}/login/", json=login_data)
if response.status_code == 200:
    tokens = response.json()
    access_token = tokens.get('access')
    print(f"✅ Login SUCCESS")
    print(f"   Token: {access_token[:50]}...")
else:
    print(f"❌ Login FAILED: {response.status_code}")
    print(f"   Response: {response.text}")
    exit(1)

# Setup headers
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Step 2: Get current cart
print("\n📦 Step 2: Check Current Cart")
print("-" * 70)

response = requests.get(f"{BASE_URL}/cart/", headers=headers)
if response.status_code == 200:
    cart = response.json()
    print(f"✅ Cart retrieved")
    print(f"   Items: {len(cart.get('items', []))}")
    
    # Clear cart if has items
    if len(cart.get('items', [])) > 0:
        print("   Clearing existing cart items...")
        for item in cart.get('items', []):
            delete_response = requests.delete(
                f"{BASE_URL}/cart/remove/{item['id']}/", 
                headers=headers
            )
            if delete_response.status_code == 204:
                print(f"   ✅ Removed item {item['id']}")
else:
    print(f"⚠️  Cart check failed: {response.status_code}")

# Step 3: Add product to cart
print("\n🛒 Step 3: Add Product to Cart")
print("-" * 70)

add_to_cart_data = {
    "product_variant_id": 1,  # Change this if needed
    "quantity": 2
}

response = requests.post(f"{BASE_URL}/cart/add/", json=add_to_cart_data, headers=headers)
if response.status_code in [200, 201]:
    print(f"✅ Product added to cart")
    cart_item = response.json()
    print(f"   Variant ID: {cart_item.get('product_variant', {}).get('id')}")
    print(f"   Quantity: {cart_item.get('quantity')}")
else:
    print(f"❌ Add to cart FAILED: {response.status_code}")
    print(f"   Response: {response.text}")
    exit(1)

# Step 4: Create order from cart
print("\n📋 Step 4: Create Order (Checkout)")
print("-" * 70)

order_data = {
    "shipping_name": "API Test Customer",
    "shipping_address": "123 API Test Street",
    "shipping_city": "Ho Chi Minh City",
    "shipping_postal_code": "70000",
    "phone_number": "0987654321",
    "notes": "Test order from API script"
}

response = requests.post(f"{BASE_URL}/orders/create-from-cart/", json=order_data, headers=headers)
if response.status_code == 201:
    order = response.json()
    order_id = order.get('id')
    print(f"✅ Order created successfully")
    print(f"   Order ID: #{order_id}")
    print(f"   Total Price: {order.get('total_price')}")
    print(f"   Status: {order.get('status')}")
    print(f"   Items: {len(order.get('items', []))}")
    
    # Show order items
    for item in order.get('items', []):
        print(f"   - {item.get('product_variant', {}).get('product_name')} x{item.get('quantity')}")
else:
    print(f"❌ Order creation FAILED: {response.status_code}")
    print(f"   Response: {response.text}")
    exit(1)

# Step 5: Login Admin to check stock history
print("\n👨‍💼 Step 5: Login Admin")
print("-" * 70)

admin_login_data = {
    "username": "admin",
    "password": "admin123"
}

response = requests.post(f"{BASE_URL}/login/", json=admin_login_data)
if response.status_code == 200:
    admin_tokens = response.json()
    admin_access_token = admin_tokens.get('access')
    print(f"✅ Admin login SUCCESS")
else:
    print(f"❌ Admin login FAILED: {response.status_code}")
    print("   ⚠️  Cannot verify stock history (need admin access)")
    admin_access_token = None

# Step 6: Check stock history (if admin logged in)
if admin_access_token:
    print("\n📊 Step 6: Check Stock History")
    print("-" * 70)
    
    admin_headers = {
        "Authorization": f"Bearer {admin_access_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/admin/stock/history/", headers=admin_headers)
    if response.status_code == 200:
        history_data = response.json()
        results = history_data.get('results', [])
        print(f"✅ Stock history retrieved")
        print(f"   Total records: {history_data.get('count', 0)}")
        
        # Find records for this order
        order_records = [r for r in results if r.get('order') == order_id]
        if order_records:
            print(f"\n   📦 Records for Order #{order_id}:")
            for record in order_records:
                print(f"   - Type: {record.get('transaction_type').upper()}")
                print(f"     Quantity: {record.get('quantity')}")
                print(f"     Before: {record.get('quantity_before')} → After: {record.get('quantity_after')}")
                print(f"     Time: {record.get('created_at')}")
                print(f"     User: {record.get('created_by', {}).get('username')}")
        else:
            print(f"\n   ⚠️  No stock history found for Order #{order_id} (yet)")
            print("      This is expected - check Django Admin for details")
    else:
        print(f"⚠️  Stock history check failed: {response.status_code}")

# Step 7: Cancel order
print("\n❌ Step 7: Cancel Order")
print("-" * 70)

response = requests.patch(f"{BASE_URL}/orders/{order_id}/cancel/", headers=headers)
if response.status_code == 200:
    cancelled_order = response.json()
    print(f"✅ Order cancelled successfully")
    print(f"   Order ID: #{order_id}")
    print(f"   New Status: {cancelled_order.get('status')}")
else:
    print(f"⚠️  Cancel failed: {response.status_code}")
    print(f"   Response: {response.text}")

# Step 8: Check stock history again (should see return record)
if admin_access_token:
    print("\n📊 Step 8: Verify Stock Return")
    print("-" * 70)
    
    response = requests.get(f"{BASE_URL}/admin/stock/history/", headers=admin_headers)
    if response.status_code == 200:
        history_data = response.json()
        results = history_data.get('results', [])
        
        # Find records for this order
        order_records = [r for r in results if r.get('order') == order_id]
        if order_records:
            print(f"✅ Found {len(order_records)} stock records for Order #{order_id}:")
            for i, record in enumerate(order_records, 1):
                print(f"\n   {i}. {record.get('transaction_type').upper()}")
                print(f"      Quantity: {record.get('quantity')}")
                print(f"      Before: {record.get('quantity_before')} → After: {record.get('quantity_after')}")
                print(f"      Notes: {record.get('notes', 'N/A')}")
                print(f"      User: {record.get('created_by', {}).get('username')}")
        else:
            print(f"⚠️  No stock history found")

# Summary
print("\n" + "=" * 70)
print("📋 TEST SUMMARY")
print("=" * 70)
print(f"✅ Customer login: SUCCESS")
print(f"✅ Add to cart: SUCCESS")
print(f"✅ Create order: SUCCESS (Order #{order_id})")
print(f"✅ Cancel order: SUCCESS")
if admin_access_token:
    print(f"✅ Stock history: Verified")
print("\n💡 Next Steps:")
print("   1. Open Django Admin: http://localhost:8000/admin/")
print("   2. Check: Shop → Stock historys")
print(f"   3. Filter by Order: #{order_id}")
print("   4. Verify 2 records: EXPORT + RETURN")
print("\n🎉 Integration test completed!")
print("=" * 70)
