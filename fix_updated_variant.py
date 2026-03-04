import re

# Read file
with open('shop/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all updated_variant references to updated_sku in response blocks
# Pattern 1: variant field name
content = content.replace("'variant': {", "'sku': {")

# Pattern 2: updated_variant.id
content = content.replace("'id': updated_variant.id,", "'id': updated_sku.id,")

# Pattern 3: updated_variant.sku
content = content.replace("'sku': updated_variant.sku,", "'sku': updated_sku.sku,")

# Pattern 4: updated_variant.product.name -> updated_sku.variant.product.name
content = content.replace("'product_name': updated_variant.product.name,", "'product_name': updated_sku.variant.product.name,")

# Pattern 5: updated_variant.size
content = content.replace("'size': updated_variant.size,", "'size': updated_sku.size,")

# Pattern 6: updated_variant.color -> updated_sku.variant.color
content = content.replace("'color': updated_variant.color,", "'color': updated_sku.variant.color,")

# Pattern 7: updated_variant.stock_quantity
content = content.replace("'stock_quantity': updated_variant.stock_quantity,", "'stock_quantity': updated_sku.stock_quantity,")
content = content.replace("'new_quantity': updated_variant.stock_quantity,", "'new_quantity': updated_sku.stock_quantity,")

# Pattern 8: updated_variant.reserved_quantity
content = content.replace("'reserved_quantity': updated_variant.reserved_quantity,", "'reserved_quantity': updated_sku.reserved_quantity,")

# Pattern 9: updated_variant.available_quantity
content = content.replace("'available_quantity': updated_variant.available_quantity,", "'available_quantity': updated_sku.available_quantity,")

# Pattern 10: updated_variant.cost_price
content = content.replace("'cost_price': float(updated_variant.cost_price),", "'cost_price': float(updated_sku.cost_price),")

# Write back
with open('shop/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed all updated_variant -> updated_sku references")
print("✓ Fixed all 'variant' -> 'sku' in response field names")
print("✓ Fixed all product/color relationships to use variant")
