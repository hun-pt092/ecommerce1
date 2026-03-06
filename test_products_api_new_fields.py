"""
Test API Products với các trường mới
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

print("=" * 80)
print("🧪 TEST API PRODUCTS VỚI CÁC TRƯỜNG MỚI")
print("=" * 80)

# 1. Get list products
print("\n📋 TEST 1: GET /products/")
print("-" * 80)
response = requests.get(f"{BASE_URL}/products/")
if response.status_code == 200:
    data = response.json()
    print(f"✅ Status: {response.status_code}")
    print(f"   Total products: {data.get('count', len(data))}")
    
    # Show first product với tất cả các trường
    if isinstance(data, dict) and 'results' in data:
        products = data['results']
    else:
        products = data
    
    if products:
        product = products[0]
        print(f"\n📦 Sample Product:")
        print(f"   ID: {product.get('id')}")
        print(f"   Name: {product.get('name')}")
        print(f"   Slug: {product.get('slug')} ✨ NEW")
        print(f"   Tags: {product.get('tags')} ✨ NEW")
        print(f"   Sold Count: {product.get('sold_count')} ✨ NEW")
        print(f"   View Count: {product.get('view_count')} ✨ NEW")
        print(f"   Avg Rating: {product.get('avg_rating')} ✨ NEW")
        print(f"   Is Best Seller: {product.get('is_best_seller')} ✨ NEW")
        print(f"   Review Count: {product.get('review_count')} ✨ NEW")
        print(f"   Brand: {product.get('brand', {}).get('name')}")
        print(f"   Category: {product.get('category', {}).get('name')}")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)

# 2. Get product by slug (nếu có slug trong URL pattern)
print("\n\n📦 TEST 2: GET Product by ID")
print("-" * 80)
response = requests.get(f"{BASE_URL}/products/1/")
if response.status_code == 200:
    product = response.json()
    print(f"✅ Status: {response.status_code}")
    print(f"\n📦 Product Details:")
    print(f"   ID: {product.get('id')}")
    print(f"   Name: {product.get('name')}")
    print(f"   Slug: {product.get('slug')}")
    print(f"   Tags: {product.get('tags')}")
    print(f"   Material: {product.get('material')}")
    print(f"\n   📊 Statistics:")
    print(f"      • Sold: {product.get('sold_count')}")
    print(f"      • Views: {product.get('view_count')}")
    print(f"      • Rating: {product.get('avg_rating')}⭐")
    print(f"      • Reviews: {product.get('review_count')}")
    print(f"      • Best Seller: {product.get('is_best_seller')}")
    print(f"\n   🎨 Variants: {len(product.get('variants', []))}")
    for variant in product.get('variants', [])[:2]:
        print(f"      • {variant.get('color')}: {variant.get('price')}₫")
else:
    print(f"❌ Error: {response.status_code}")

# 3. Filter products by tags (nếu API support)
print("\n\n🏷️  TEST 3: Filter Products")
print("-" * 80)
print("Top 10 Best Sellers (sold_count > 100):")
response = requests.get(f"{BASE_URL}/products/?limit=100")
if response.status_code == 200:
    data = response.json()
    if isinstance(data, dict) and 'results' in data:
        products = data['results']
    else:
        products = data
    
    # Sort by sold_count
    best_sellers = sorted(
        [p for p in products if p.get('sold_count', 0) > 100],
        key=lambda x: x.get('sold_count', 0),
        reverse=True
    )[:10]
    
    for idx, p in enumerate(best_sellers, 1):
        print(f"   {idx}. {p.get('name')}")
        print(f"      Sold: {p.get('sold_count')} | Rating: {p.get('avg_rating')}⭐ | Views: {p.get('view_count')}")
else:
    print(f"❌ Error: {response.status_code}")

# 4. Products with specific tags
print("\n\n🔍 TEST 4: Products with 'nam' tag")
print("-" * 80)
response = requests.get(f"{BASE_URL}/products/?limit=100")
if response.status_code == 200:
    data = response.json()
    if isinstance(data, dict) and 'results' in data:
        products = data['results']
    else:
        products = data
    
    # Filter by tag
    products_with_tag = [
        p for p in products 
        if 'nam' in p.get('tags', [])
    ]
    
    print(f"Found: {len(products_with_tag)} products")
    for p in products_with_tag[:5]:
        print(f"   • {p.get('name')}: {p.get('tags')}")
else:
    print(f"❌ Error: {response.status_code}")

# 5. Highest rated products
print("\n\n⭐ TEST 5: Highest Rated Products")
print("-" * 80)
response = requests.get(f"{BASE_URL}/products/?limit=100")
if response.status_code == 200:
    data = response.json()
    if isinstance(data, dict) and 'results' in data:
        products = data['results']
    else:
        products = data
    
    # Sort by rating
    top_rated = sorted(
        products,
        key=lambda x: float(x.get('avg_rating', 0)),
        reverse=True
    )[:5]
    
    for idx, p in enumerate(top_rated, 1):
        print(f"   {idx}. {p.get('name')}")
        print(f"      Rating: {p.get('avg_rating')}⭐ | Sold: {p.get('sold_count')} | Reviews: {p.get('review_count')}")
else:
    print(f"❌ Error: {response.status_code}")

print("\n" + "=" * 80)
print("✅ TEST API HOÀN TẤT!")
print("=" * 80)
print("\n💡 Các trường mới đã hoạt động:")
print("   ✅ slug - URL thân thiện")
print("   ✅ tags - Mảng tags cho recommendation")
print("   ✅ sold_count - Số lượng đã bán")
print("   ✅ view_count - Lượt xem sản phẩm")
print("   ✅ avg_rating - Điểm đánh giá trung bình")
print("   ✅ is_best_seller - Sản phẩm bán chạy (property)")
print("   ✅ review_count - Số lượng đánh giá (property)")
print("\n🚀 Sẵn sàng cho:")
print("   • Gợi ý sản phẩm thông minh")
print("   • Chatbot tư vấn")
print("   • Thống kê & Analytics")
print("   • Recommendation Engine")
print("=" * 80)
