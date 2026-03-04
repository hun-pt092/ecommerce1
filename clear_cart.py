import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Cart, User, ProductSKU

user = User.objects.get(username='testuser')
cart, _ = Cart.objects.get_or_create(user=user)

print(f"Cart items before: {cart.items.count()}")
cart.items.all().delete()
print(f"Cart items after: {cart.items.count()}")

# Check SKU stock
sku = ProductSKU.objects.first()
print(f"\nFirst SKU: {sku}")
print(f"Stock: {sku.stock_quantity}")
print(f"Reserved: {sku.reserved_quantity}")
print(f"Available: {sku.available_quantity}")
