import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Category

# Update display_group cho các categories
updates = [
    # Nam
    ('Trang phục nam', 'men'),
    ('Áo nam', 'men'),
    ('Quần nam', 'men'),
    
    # Nữ
    ('Trang phục nữ', 'women'),
    ('Áo nữ', 'women'),
    ('Quần nữ', 'women'),
    ('Váy Nữ', 'women'),
    
    # Phụ kiện
    ('Phụ Kiện', 'accessories'),
    ('Giày Dép', 'accessories'),
    ('đồng hồ', 'accessories'),
    ('Túi Xách', 'accessories'),
    ('Ví', 'accessories'),
    ('Thắt Lưng', 'accessories'),
    ('Mũ Nón', 'accessories'),
    ('Giày Sneaker', 'accessories'),
    ('Giày Tây', 'accessories'),
    ('Dép Sandal', 'accessories'),
]

print("=== UPDATING CATEGORY GROUPS ===\n")
for name, group in updates:
    try:
        cat = Category.objects.get(name=name)
        cat.display_group = group
        cat.save()
        print(f"✅ {name:30} → {group}")
    except Category.DoesNotExist:
        print(f"⚠️  {name:30} → NOT FOUND")

print("\n=== SUMMARY ===")
for group_code, group_label in Category.DISPLAY_GROUP_CHOICES:
    count = Category.objects.filter(display_group=group_code).count()
    print(f"{group_label:15} ({group_code}): {count} categories")
