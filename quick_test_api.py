"""Quick API test - minimal version"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Login
print("1. Login...")
response = requests.post(f"{BASE_URL}/token/", json={
    "username": "testuser",
    "password": "testpass123"
})
token = response.json()['access']
print(f"   Token: {token[:20]}...")

# 2. Get products
print("\n2. Get products...")
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/products/", headers=headers)
print(f"   Status: {response.status_code}")
print(f"   Products count: {response.json()['count']}")

# Get first SKU
products = response.json()['results']
first_product = products[0]
first_variant = first_product['variants'][0]
first_sku = first_variant['skus'][0]
sku_id = first_sku['id']
print(f"   First SKU ID: {sku_id}")
print(f"   Size: {first_sku['size']}, Stock: {first_sku['stock_quantity']}")

# 3. Add to cart
print("\n3. Add to cart...")
response = requests.put(f"{BASE_URL}/cart/", headers=headers, json={
    "product_sku_id": sku_id,
    "quantity": 1  # Đổi từ 2 thành 1
})
print(f"   Status: {response.status_code}")

# 4. View cart
print("\n4. View cart...")
response = requests.get(f"{BASE_URL}/cart/", headers=headers)
cart_data = response.json()
print(f"   Status: {response.status_code}")
cart_items = cart_data.get('items', [])
print(f"   Cart items: {len(cart_items)}")
if cart_items:
    item = cart_items[0]
    print(f"   Quantity: {item['quantity']}")
    print(f"   SKU size: {item['product_sku']['size']}")
    
# 5. Create order
print("\n5. Create order...")
response = requests.post(f"{BASE_URL}/orders/create-from-cart/", headers=headers, json={
    "payment_method": "bank_transfer",
    "shipping_address": "123 Test St"
})
print(f"   Status: {response.status_code}")
if response.status_code == 201:
    order = response.json()
    print(f"   Order ID: {order['id']}")
    print(f"   Total: {order.get('total_amount') or order.get('total_price', 'N/A')}")
    print("\n   SUCCESS! All API endpoints working with ProductSKU!")
else:
    print(f"   Error: {response.text[:200]}")
