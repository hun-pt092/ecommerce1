
from django.contrib import admin
from .models import User, Category, Brand, Product, ProductImage, ProductVariant, Order, OrderItem, Review, Wishlist

# Custom admin cho User
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_admin', 'is_staff', 'date_joined']
    list_filter = ['is_admin', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email']

# Custom admin cho Category
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent']
    list_filter = ['parent']
    search_fields = ['name']

# Custom admin cho Brand
@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'description': ('name',)}

# Inline cho ProductImage
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_main', 'order']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-height: 100px; max-width: 150px;" />'
        return "No image"
    image_preview.short_description = 'Preview'
    image_preview.allow_tags = True

# Inline cho ProductVariant
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['size', 'color', 'stock_quantity']

# Custom admin cho Product
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'brand', 'price', 'discount_price', 'is_active', 'is_featured', 'created_at']
    list_filter = ['category', 'brand', 'is_active', 'is_featured', 'is_new', 'created_at']
    search_fields = ['name', 'sku', 'description']
    readonly_fields = ['sku', 'created_at', 'updated_at']
    inlines = [ProductImageInline, ProductVariantInline]
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('name', 'sku', 'short_description', 'description', 'category', 'brand', 'material')
        }),
        ('Giá cả', {
            'fields': ('price', 'discount_price')
        }),
        ('Trạng thái', {
            'fields': ('is_active', 'is_featured', 'is_new')
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# Custom admin cho ProductImage
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'alt_text', 'is_main', 'order', 'image_preview']
    list_filter = ['is_main', 'created_at']
    search_fields = ['product__name', 'alt_text']
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-height: 50px; max-width: 75px;" />'
        return "No image"
    image_preview.short_description = 'Preview'
    image_preview.allow_tags = True

# Custom admin cho ProductVariant  
@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'size', 'color', 'stock_quantity']
    list_filter = ['size', 'color', 'product__category']
    search_fields = ['product__name', 'size', 'color']

# Custom admin cho Order
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_price', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['user__username', 'shipping_name', 'id']
    readonly_fields = ['created_at', 'updated_at']

# Custom admin cho OrderItem
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_variant', 'quantity', 'price_per_item']
    list_filter = ['order__status', 'product_variant__product__category']
    search_fields = ['order__id', 'product_variant__product__name']

# Custom admin cho Review
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at', 'comment_preview']
    list_filter = ['rating', 'created_at', 'product__category']
    search_fields = ['product__name', 'user__username', 'comment']
    readonly_fields = ['created_at']
    
    def comment_preview(self, obj):
        return obj.comment[:50] + "..." if len(obj.comment) > 50 else obj.comment
    comment_preview.short_description = 'Comment Preview'

# Custom admin cho Wishlist
@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at', 'product__category']
    search_fields = ['user__username', 'product__name']
    readonly_fields = ['created_at']
