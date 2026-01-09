
from django.contrib import admin
from .models import (
    User, Category, Brand, Product, ProductVariant, 
    Order, OrderItem, Review, Wishlist, Cart, CartItem,
    StockHistory, StockAlert, Coupon, UserCoupon, ProductVoucher
)

# Custom admin cho User
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'date_of_birth', 'phone_number', 'is_admin', 'is_staff', 'date_joined']
    list_filter = ['is_admin', 'is_staff', 'is_superuser', 'date_of_birth']
    search_fields = ['username', 'email', 'phone_number']
    fieldsets = (
        ('Thông tin tài khoản', {
            'fields': ('username', 'email', 'password')
        }),
        ('Thông tin cá nhân', {
            'fields': ('first_name', 'last_name', 'date_of_birth', 'phone_number')
        }),
        ('Quyền', {
            'fields': ('is_admin', 'is_staff', 'is_superuser', 'is_active')
        }),
        ('Thời gian', {
            'fields': ('date_joined', 'last_login'),
            'classes': ('collapse',)
        }),
    )

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

# Inline cho ProductVariant
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['image', 'size', 'color', 'price', 'discount_price', 'stock_quantity', 'reserved_quantity', 'minimum_stock', 'cost_price', 'is_active']
    readonly_fields = ['sku']

# Inline cho ProductVoucher
class ProductVoucherInline(admin.TabularInline):
    model = ProductVoucher
    extra = 0
    fields = ['code', 'name', 'discount_type', 'discount_value', 'max_discount_amount', 'valid_from', 'valid_to', 'is_active']
    readonly_fields = []

# Custom admin cho Product
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'brand', 'is_active', 'is_featured', 'created_at']
    list_filter = ['category', 'brand', 'is_active', 'is_featured', 'is_new', 'created_at']
    search_fields = ['name', 'sku', 'description']
    readonly_fields = ['sku', 'created_at', 'updated_at']
    inlines = [ProductVariantInline, ProductVoucherInline]
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('name', 'sku', 'short_description', 'description', 'category', 'brand', 'material')
        }),
        ('Trạng thái', {
            'fields': ('is_active', 'is_featured', 'is_new')
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# Custom admin cho ProductVariant  
@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['sku', 'product', 'size', 'color', 'price', 'discount_price', 'stock_quantity', 'reserved_quantity', 'available_quantity', 'is_low_stock', 'is_active']
    list_filter = ['size', 'color', 'is_active', 'product__category', 'product__brand']
    search_fields = ['product__name', 'sku', 'size', 'color']
    readonly_fields = ['sku', 'available_quantity', 'is_low_stock', 'need_reorder', 'created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Thông tin sản phẩm', {
            'fields': ('product', 'sku', 'size', 'color')
        }),
        ('Ảnh và giá', {
            'fields': ('image', 'image_preview', 'price', 'discount_price')
        }),
        ('Quản lý kho', {
            'fields': ('stock_quantity', 'reserved_quantity', 'available_quantity', 'minimum_stock', 'reorder_point', 'cost_price')
        }),
        ('Trạng thái', {
            'fields': ('is_active', 'is_low_stock', 'need_reorder')
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-height: 100px; max-width: 150px;" />'
        return "No image"
    image_preview.short_description = 'Preview'
    image_preview.allow_tags = True
    
    def available_quantity(self, obj):
        return obj.available_quantity
    available_quantity.short_description = 'Available Stock'
    
    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'

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


# Custom admin cho StockHistory
@admin.register(StockHistory)
class StockHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'product_variant', 'transaction_type', 'quantity', 'quantity_before', 'quantity_after', 'created_by', 'created_at']
    list_filter = ['transaction_type', 'created_at', 'product_variant__product__category']
    search_fields = ['product_variant__product__name', 'product_variant__sku', 'reference_number', 'notes']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('product_variant', 'transaction_type', 'quantity', 'quantity_before', 'quantity_after')
        }),
        ('Reference', {
            'fields': ('order', 'reference_number', 'cost_per_item')
        }),
        ('Details', {
            'fields': ('notes', 'created_by', 'created_at')
        }),
    )


# Custom admin cho StockAlert
@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = ['id', 'product_variant', 'alert_type', 'current_quantity', 'threshold', 'is_resolved', 'created_at']
    list_filter = ['alert_type', 'is_resolved', 'created_at']
    search_fields = ['product_variant__product__name', 'product_variant__sku']
    readonly_fields = ['created_at', 'resolved_at']
    
    actions = ['mark_as_resolved']
    
    def mark_as_resolved(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            is_resolved=True,
            resolved_at=timezone.now(),
            resolved_by=request.user
        )
        self.message_user(request, f'{updated} alert(s) marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected alerts as resolved'


# Custom admin cho Coupon
@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'coupon_type', 'occasion_type', 'discount_value', 'is_active', 'current_uses', 'max_uses', 'valid_from', 'valid_to']
    list_filter = ['coupon_type', 'occasion_type', 'is_active', 'is_public', 'created_at']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['current_uses', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin mã', {
            'fields': ('code', 'name', 'description', 'coupon_type', 'occasion_type')
        }),
        ('Giá trị giảm', {
            'fields': ('discount_value', 'max_discount_amount', 'min_purchase_amount')
        }),
        ('Giới hạn sử dụng', {
            'fields': ('max_uses', 'max_uses_per_user', 'current_uses')
        }),
        ('Thời gian', {
            'fields': ('valid_from', 'valid_to')
        }),
        ('Trạng thái', {
            'fields': ('is_active', 'is_public')
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Custom admin cho UserCoupon
@admin.register(UserCoupon)
class UserCouponAdmin(admin.ModelAdmin):
    list_display = ['user', 'coupon', 'valid_from', 'valid_to', 'is_used', 'used_at', 'notified', 'assigned_at']
    list_filter = ['is_used', 'notified', 'coupon__occasion_type', 'assigned_at', 'valid_to']
    search_fields = ['user__username', 'user__email', 'coupon__code', 'coupon__name']
    readonly_fields = ['assigned_at', 'notified_at', 'used_at']
    
    fieldsets = (
        ('User & Coupon', {
            'fields': ('user', 'coupon')
        }),
        ('Thời gian hiệu lực', {
            'fields': ('valid_from', 'valid_to')
        }),
        ('Trạng thái sử dụng', {
            'fields': ('is_used', 'used_at', 'order')
        }),
        ('Thông báo', {
            'fields': ('notified', 'notified_at')
        }),
        ('Timestamp', {
            'fields': ('assigned_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_notified']
    
    def mark_as_notified(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            notified=True,
            notified_at=timezone.now()
        )
        self.message_user(request, f'{updated} coupon(s) marked as notified.')
    mark_as_notified.short_description = 'Mark selected as notified'


# Custom admin cho ProductVoucher
@admin.register(ProductVoucher)
class ProductVoucherAdmin(admin.ModelAdmin):
    list_display = ['code', 'product', 'name', 'discount_type', 'discount_value', 'current_uses', 'max_uses', 'is_active', 'valid_from', 'valid_to']
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_to']
    search_fields = ['code', 'name', 'product__name']
    readonly_fields = ['current_uses', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin voucher', {
            'fields': ('product', 'code', 'name', 'description')
        }),
        ('Giảm giá', {
            'fields': ('discount_type', 'discount_value', 'max_discount_amount')
        }),
        ('Số lượng', {
            'fields': ('max_uses', 'current_uses')
        }),
        ('Thời gian', {
            'fields': ('valid_from', 'valid_to')
        }),
        ('Trạng thái', {
            'fields': ('is_active',)
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
