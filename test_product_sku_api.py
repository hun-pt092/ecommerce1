"""
Test ProductSKU API Integration
Tests:
1. Get product with variants, images, and SKUs
2. Add SKU to cart
3. View cart with SKU data
4. Create order from cart
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def get_auth_token():
    """Login and get token"""
    response = requests.post(f"{BASE_URL}/token/", json={
        "username": "testuser",
        "password": "testpass123"
    })
    if response.status_code == 200:
        return response.json()['access']
    else:
        print("❌ Login failed")
        print(response.text)
        return None

def test_get_products(token):
    """Test get products with variants and SKUs"""
    print("\n" + "="*60)
    print("TEST 1: Get Products with Variants & SKUs")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/products/", headers=headers)
    
    if response.status_code == 200:
        products = response.json()['results']
        print(f"✅ Found {len(products)} products\n")
        
        for product in products[:2]:  # Show first 2 products
            print(f"📦 Product: {product['name']}")
            print(f"   Category: {product.get('category', {}).get('name', 'N/A')}")
            print(f"   Brand: {product.get('brand', {}).get('name', 'N/A')}")
            
            if product.get('variants'):
                print(f"\n   Variants ({len(product['variants'])}):")
                for variant in product['variants']:
                    print(f"   🎨 Color: {variant['color']}")
                    print(f"      Price: {variant['price']:,.0f}₫")
                    if variant.get('discount_price'):
                        print(f"      Discount: {variant['discount_price']:,.0f}₫")
                    print(f"      Final Price: {variant['final_price']:,.0f}₫")
                    
                    # Show images
                    if variant.get('images'):
                        print(f"      Images: {len(variant['images'])} images")
                        for img in variant['images'][:2]:
                            print(f"        - {img.get('image', 'N/A')} (Primary: {img.get('is_primary', False)})")
                    
                    # Show SKUs (sizes)
                    if variant.get('skus'):
                        print(f"      SKUs ({len(variant['skus'])}):")
                        for sku in variant['skus']:
                            print(f"        📏 Size {sku['size']}: Stock={sku['stock_quantity']}, Available={sku.get('available_quantity', sku['stock_quantity'])}")
                    print()
            print("-" * 60)
        
        # Return first SKU ID for testing
        if products and products[0].get('variants') and products[0]['variants'][0].get('skus'):
            first_sku = products[0]['variants'][0]['skus'][0]
            return first_sku['id']
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
    
    return None

def test_add_to_cart(token, sku_id):
    """Test add SKU to cart"""
    print("\n" + "="*60)
    print(f"TEST 2: Add SKU {sku_id} to Cart")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{BASE_URL}/cart/",
        headers=headers,
        json={
            "product_sku_id": sku_id,
            "quantity": 2
        }
    )
    
    if response.status_code == 200:
        cart = response.json()
        print("✅ Added to cart successfully!")
        print(f"Cart Total Items: {len(cart.get('items', []))}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return False

def test_view_cart(token):
    """Test view cart with SKU structure"""
    print("\n" + "="*60)
    print("TEST 3: View Cart")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/cart/", headers=headers)
    
    if response.status_code == 200:
        cart = response.json()
        print(f"✅ Cart loaded successfully!\n")
        print(f"Total Items: {len(cart.get('items', []))}")
        
        for item in cart.get('items', []):
            sku = item.get('product_sku', {})
            variant = sku.get('variant', {})
            product = variant.get('product', {})
            
            print(f"\n📦 Product: {product.get('name', 'N/A')}")
            print(f"   Color: {variant.get('color', 'N/A')}")
            print(f"   Size: {sku.get('size', 'N/A')}")
            print(f"   SKU: {sku.get('sku', 'N/A')}")
            print(f"   Quantity: {item.get('quantity', 0)}")
            print(f"   Price: {sku.get('final_price', 0):,.0f}₫")
            print(f"   Stock: {sku.get('stock_quantity', 0)} (Available: {sku.get('available_quantity', 0)})")
            
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return False

def test_create_order(token):
    """Test create order from cart"""
    print("\n" + "="*60)
    print("TEST 4: Create Order")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/orders/",
        headers=headers,
        json={
            "shipping_name": "Test User",
            "shipping_address": "123 Test Street",
            "shipping_city": "Test City",
            "phone_number": "0123456789"
        }
    )
    
    if response.status_code == 201:
        order = response.json()
        print("✅ Order created successfully!\n")
        print(f"Order ID: {order.get('id')}")
        print(f"Total Amount: {order.get('total_amount', 0):,.0f}₫")
        print(f"Status: {order.get('status')}")
        print(f"\nOrder Items:")
        
        for item in order.get('items', []):
            sku = item.get('product_sku', {})
            variant = sku.get('variant', {})
            product = variant.get('product', {})
            
            print(f"  - {product.get('name', 'N/A')} ({variant.get('color')}, Size {sku.get('size')})")
            print(f"    Quantity: {item.get('quantity')} x {item.get('price', 0):,.0f}₫")
        
        return order.get('id')
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return None

def main():
    print("\n" + "="*70)
    print("TESTING PRODUCTSKU API INTEGRATION")
    print("="*70)
    
    # Step 1: Login
    print("\nLogging in...")
    token = get_auth_token()
    if not token:
        print("Cannot proceed without token")
        return
    print("Login successful!")
    
    # Step 2: Get products and SKU ID
    sku_id = test_get_products(token)
    if not sku_id:
        print("No SKU found to test")
        return
    
    # Step 3: Add to cart
    if not test_add_to_cart(token, sku_id):
        print("Cannot proceed without cart")
        return
    
    # Step 4: View cart
    test_view_cart(token)
    
    # Step 5: Create order
    order_id = test_create_order(token)
    
    print("\n" + "="*70)
    print("ALL TESTS COMPLETED!")
    print("="*70)
    
    if order_id:
        print(f"\nOrder #{order_id} created successfully")
        print("Check stock changes in admin or database")

if __name__ == "__main__":
    main()
