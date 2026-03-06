"""
Quick test API products
"""
import requests

try:
    print("Testing GET /api/products/...")
    response = requests.get("http://127.0.0.1:8000/api/products/", timeout=5)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, dict) and 'results' in data:
            products = data['results']
            count = data.get('count', 0)
        else:
            products = data
            count = len(products)
        
        print(f"✅ SUCCESS! Got {count} products")
        
        if products:
            p = products[0]
            print(f"\nSample product:")
            print(f"  Name: {p.get('name')}")
            print(f"  Slug: {p.get('slug')}")
            print(f"  Tags: {p.get('tags')}")
            print(f"  Sold: {p.get('sold_count')}")
            print(f"  Views: {p.get('view_count')}")
            print(f"  Rating: {p.get('avg_rating')}")
            print(f"  Best Seller: {p.get('is_best_seller')}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text[:500])
        
except Exception as e:
    print(f"❌ Error: {e}")
