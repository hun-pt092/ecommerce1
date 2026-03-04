import re

# Read file
with open('shop/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace alert.product_variant with alert.product_sku
content = content.replace(
    "'product_variant': alert.product_variant.sku,",
    "'product_sku': alert.product_sku.sku,"
)

# Write back
with open('shop/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed alert response to use product_sku")
