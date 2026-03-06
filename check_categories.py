import django
import os
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import Category

# Get parent categories
parents = list(Category.objects.filter(parent__isnull=True).values('id', 'name'))
print("=== PARENT CATEGORIES ===")
print(json.dumps(parents, indent=2, ensure_ascii=False))

# Get children for each parent
print("\n=== CATEGORY HIERARCHY ===")
for parent in Category.objects.filter(parent__isnull=True):
    children = list(parent.children.values('id', 'name'))
    print(f"\n{parent.name} (ID: {parent.id}):")
    print(json.dumps(children, indent=2, ensure_ascii=False))

# Count total
total = Category.objects.count()
parent_count = Category.objects.filter(parent__isnull=True).count()
child_count = Category.objects.filter(parent__isnull=False).count()
print(f"\n=== SUMMARY ===")
print(f"Total categories: {total}")
print(f"Parent categories: {parent_count}")
print(f"Child categories: {child_count}")
