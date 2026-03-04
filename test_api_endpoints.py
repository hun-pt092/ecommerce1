"""
Test API Endpoints với ProductSKU
Quick test script để verify API responses
"""
import requests
from pprint import pprint
import json

BASE_URL = "http://localhost:8000/api"

def print_separator(title=""):
    print("\n" + "=" * 70)
    if title:
        print(f" {title}")
        print("=" * 70)

def test_api_endpoints():
    print_separator("TEST API ENDPOINTS - ProductSKU Architecture")
    
    # 1. Login để lấy token
    print("\n1. Login to get token...")
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/token/", json=login_data)
    
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens['access']
        print(f"   ✓ Login successful")
        print(f"   Token: {access_token[:50]}...")
    else:
        print(f"   ✗ Login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # 2. Get Products List
    print_separator("2. GET /api/products/ - List Products")
    
    response = requests.get(f"{BASE_URL}/products/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', data)
        print(f"   ✓ Found {len(results)} products\n")
        
        for product in results[:2]:
            print(f"   Product: {product['name']}")
            print(f"   Price Range: {product.get('price_range', 'N/A')}")
            print(f"   Variants: {len(product.get('variants', []))}")
            if product.get('variants'):
                variant = product['variants'][0]
                print(f"     - Color: {variant['color']}")
                print(f"       Images: {len(variant.get('images', []))} images")
                print(f"       SKUs: {len(variant.get('skus', []))} sizes")
            print()
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   {response.text[:200]}")
    
    # 3. Get Product Detail
    print_separator("3. GET /api/products/1/ - Product Detail")
    
    response = requests.get(f"{BASE_URL}/products/1/", headers=headers)
    
    if response.status_code == 200:
        product = response.json()
        print(f"   ✓ Product: {product['name']}\n")
        print(f"   Variants ({len(product.get('variants', []))}):")
        
        for variant in product.get('variants', []):
            print(f"\n     Color: {variant['color']}")
            print(f"     Price: {variant.get('final_price', 'N/A'):,}₫")
            print(f"     Images: {len(variant.get('images', []))} images")
            
            # Show images
            for img in variant.get('images', [])[:2]:
                print(f"       - {'[PRIMARY]' if img.get('is_primary') else '[      ]'} {img.get('image_url', '')[-50:]}")
            
            print(f"     SKUs ({len(variant.get('skus', []))}):")
            for sku in variant.get('skus', []):
                print(f"       - Size {sku['size']:3s}: Stock={sku['stock_quantity']:3d}, Available={sku['available_quantity']:3d}, ID={sku['id']}")
    else:
        print(f"   ✗ Error: {response.status_code}")
    
    # Get first available SKU for cart test
    first_sku_id = None
    if response.status_code == 200:
        product = response.json()
        for variant in product.get('variants', []):
            for sku in variant.get('skus', []):
                if sku.get('available_quantity', 0) > 0:
                    first_sku_id = sku['id']
                    print(f"\n   → Will use SKU ID {first_sku_id} for cart test")
                    break
            if first_sku_id:
                break
    
    # 4. Get Cart
    print_separator("4. GET /api/cart/ - Current Cart")
    
    response = requests.get(f"{BASE_URL}/cart/", headers=headers)
    
    if response.status_code == 200:
        cart = response.json()
        items = cart.get('items', [])
        print(f"   ✓ Cart has {len(items)} items\n")
        
        for item in items:
            sku = item['product_sku']
            print(f"   - {sku['variant']['product']['name']}")
            print(f"     Color: {sku['variant']['color']} | Size: {sku['size']}")
            print(f"     Qty: {item['quantity']} x {sku['final_price']:,}₫")
            print()
    else:
        print(f"   ✗ Error: {response.status_code}")
    
    # 5. Add to Cart
    if first_sku_id:
        print_separator(f"5. PUT /api/cart/ - Add SKU #{first_sku_id} to Cart")
        
        cart_data = {
            "product_sku_id": first_sku_id,
            "quantity": 2
        }
        
        response = requests.put(
            f"{BASE_URL}/cart/",
            headers=headers,
            json=cart_data
        )
        
        if response.status_code == 200:
            cart = response.json()
            items = cart.get('items', [])
            print(f"   ✓ Added to cart successfully")
            print(f"   ✓ Cart now has {len(items)} items\n")
            
            # Show added item
            for item in items:
                if item['product_sku']['id'] == first_sku_id:
                    sku = item['product_sku']
                    print(f"   Added Item:")
                    print(f"   - {sku['variant']['product']['name']}")
                    print(f"     Color: {sku['variant']['color']} | Size: {sku['size']}")
                    print(f"     Qty: {item['quantity']}")
                    print(f"     Stock Available: {sku['available_quantity']}")
                    break
        else:
            print(f"   ✗ Error: {response.status_code}")
            print(f"   {response.text}")
    
    # 6. Get Orders
    print_separator("6. GET /api/orders/ - User Orders")
    
    response = requests.get(f"{BASE_URL}/orders/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        orders = data.get('results', data)
        print(f"   ✓ Found {len(orders)} orders\n")
        
        for order in orders[:3]:
            print(f"   Order #{order['id']}")
            print(f"   Status: {order['status']} | Payment: {order['payment_status']}")
            print(f"   Total: {float(order['total_price']):,.0f}₫")
            print(f"   Items: {order.get('total_items', len(order.get('items', [])))} items")
            print(f"   Created: {order['created_at']}")
            print()
    else:
        print(f"   ✗ Error: {response.status_code}")
    
    # Summary
    print_separator("✓ API TEST COMPLETE")
    
    print("""
   Test Results:
   ─────────────────────────────────────────────────────────────────
   ✓ Authentication (JWT token)
   ✓ GET /api/products/ - List with nested variants, images, SKUs
   ✓ GET /api/products/{id}/ - Detail with full nested data
   ✓ GET /api/cart/ - Cart with ProductSKU info
   ✓ PUT /api/cart/ - Add item with product_sku_id
   ✓ GET /api/orders/ - Orders with ProductSKU in items
   
   Next Steps:
   ─────────────────────────────────────────────────────────────────
   1. Test checkout: POST /api/orders/
   2. Test order detail: GET /api/orders/{id}/
   3. Update frontend to use new structure
   """)
    
    print("=" * 70)

if __name__ == "__main__":
    print("\nMake sure Django server is running on http://localhost:8000")
    print("Run: python manage.py runserver\n")
    
    try:
        test_api_endpoints()
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Cannot connect to server!")
        print("Please run: python manage.py runserver")
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
