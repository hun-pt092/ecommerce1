import re

# Read file
with open('shop/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dashboard stats line
content = content.replace(
    "'total_products': ProductVariant.objects.filter(product__is_active=True).count()",
    "'total_products': ProductSKU.objects.filter(variant__product__is_active=True).count()"
)

# Write back
with open('shop/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed dashboard stats to use ProductSKU")
