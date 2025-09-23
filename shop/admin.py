
from django.contrib import admin
from .models import User, Category, Product, ProductVariant, Order, OrderItem

admin.site.register(User)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(ProductVariant)
admin.site.register(Order)
admin.site.register(OrderItem)
