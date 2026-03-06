"""
Script kiểm tra dữ liệu sản phẩm đã tạo
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Product, ProductVariant, ProductSKU, Category, Brand
from django.db.models import Count, Avg, Sum

print("=" * 80)
print("📊 THỐNG KÊ DỮ LIỆU SẢN PHẨM")
print("=" * 80)

# Tổng quan
print(f"\n📈 TỔNG QUAN:")
print(f"   • Tổng Categories: {Category.objects.count()}")
print(f"   • Tổng Brands: {Brand.objects.count()}")
print(f"   • Tổng Products: {Product.objects.count()}")
print(f"   • Tổng Variants (màu): {ProductVariant.objects.count()}")
print(f"   • Tổng SKUs (size): {ProductSKU.objects.count()}")

# Products by Category
print(f"\n📁 SẢN PHẨM THEO CATEGORY:")
categories_with_count = Category.objects.annotate(
    product_count=Count('products')
).filter(product_count__gt=0).order_by('-product_count')

for cat in categories_with_count[:10]:
    print(f"   • {cat.name}: {cat.product_count} sản phẩm")

# Products by Brand
print(f"\n🏷️  SẢN PHẨM THEO BRAND:")
brands_with_count = Brand.objects.annotate(
    product_count=Count('products')
).filter(product_count__gt=0).order_by('-product_count')

for brand in brands_with_count:
    print(f"   • {brand.name}: {brand.product_count} sản phẩm")

# Best sellers (sold_count > 100)
print(f"\n🔥 SẢN PHẨM BÁN CHẠY (sold > 100):")
best_sellers = Product.objects.filter(sold_count__gt=100).order_by('-sold_count')[:10]
print(f"   Tổng: {best_sellers.count()} sản phẩm")
for p in best_sellers[:5]:
    print(f"   • {p.name}: {p.sold_count} đã bán | ⭐{p.avg_rating}")

# Highest rated
print(f"\n⭐ SẢN PHẨM ĐÁNH GIÁ CAO (rating >= 4.5):")
top_rated = Product.objects.filter(avg_rating__gte=4.5).order_by('-avg_rating')[:10]
print(f"   Tổng: {top_rated.count()} sản phẩm")
for p in top_rated[:5]:
    print(f"   • {p.name}: ⭐{p.avg_rating} | {p.sold_count} đã bán")

# Products with tags
print(f"\n🏷️  TAGS PHỔ BIẾN:")
all_tags = []
for p in Product.objects.exclude(tags=[]):
    all_tags.extend(p.tags)

from collections import Counter
tag_counts = Counter(all_tags)
for tag, count in tag_counts.most_common(10):
    print(f"   • {tag}: {count} sản phẩm")

# Products with discount
print(f"\n💰 SẢN PHẨM ĐANG GIẢM GIÁ:")
products_with_discount = Product.objects.filter(
    variants__discount_price__isnull=False
).distinct()
print(f"   Tổng: {products_with_discount.count()} sản phẩm")
for p in products_with_discount[:5]:
    variant = p.variants.filter(discount_price__isnull=False).first()
    if variant:
        discount_percent = ((variant.price - variant.discount_price) / variant.price * 100)
        print(f"   • {p.name}: {int(variant.price):,}₫ → {int(variant.discount_price):,}₫ (-{int(discount_percent)}%)")

# Stock status
print(f"\n📦 TÌNH TRẠNG TỒN KHO:")
total_stock = ProductSKU.objects.aggregate(total=Sum('stock_quantity'))['total']
low_stock_skus = ProductSKU.objects.filter(stock_quantity__lte=20).count()
out_of_stock = ProductSKU.objects.filter(stock_quantity=0).count()

print(f"   • Tổng tồn kho: {total_stock:,} items")
print(f"   • SKUs sắp hết: {low_stock_skus}")
print(f"   • SKUs hết hàng: {out_of_stock}")

# Sample products with full info
print(f"\n📦 MẪU SẢN PHẨM CHI TIẾT:")
sample = Product.objects.all()[0]
print(f"\n{sample.name}")
print(f"   ID: {sample.id}")
print(f"   Slug: {sample.slug}")
print(f"   Category: {sample.category.name}")
print(f"   Brand: {sample.brand.name}")
print(f"   Material: {sample.material}")
print(f"   Tags: {sample.tags}")
print(f"   Stats: Sold: {sample.sold_count} | Views: {sample.view_count} | Rating: {sample.avg_rating}⭐")
print(f"   Is Best Seller: {sample.is_best_seller}")
print(f"   Is Featured: {sample.is_featured}")
print(f"   Is New: {sample.is_new}")
print(f"\n   Variants ({sample.variants.count()}):")
for variant in sample.variants.all():
    print(f"      • {variant.color}: {int(variant.price):,}₫", end="")
    if variant.discount_price:
        print(f" → {int(variant.discount_price):,}₫", end="")
    print(f" | Stock: {variant.get_total_stock()} | SKUs: {variant.skus.count()}")

print("\n" + "=" * 80)
print("✅ KIỂM TRA HOÀN TẤT!")
print("=" * 80)
