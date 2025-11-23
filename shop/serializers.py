from rest_framework import serializers
from .models import (
    User, Product, ProductVariant, Order, OrderItem, Category, Brand, 
    ProductImage, Review, Wishlist, StockHistory, StockAlert, Cart, CartItem,
    Coupon, UserCoupon
)
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from django.utils import timezone 

# User serializer để đăng ký
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)  # Xác nhận password
    date_of_birth = serializers.DateField(required=False, allow_null=True)  # Tùy chọn
    phone_number = serializers.CharField(required=False, allow_blank=True)  # Tùy chọn

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 
                 'date_of_birth', 'phone_number')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password Không khớp với nhau"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')  # Bỏ password2
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

# Category serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# Brand serializer
class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

# ProductImage serializer
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

# Product serializers
class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

# Admin product serializer with create/update functionality
class AdminProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, required=False)
    images = ProductImageSerializer(many=True, read_only=True)
    
    # For reading - return nested objects
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    
    # For writing - accept IDs
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category',
        write_only=True,
        required=True
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), 
        source='brand',
        write_only=True,
        required=False, 
        allow_null=True
    )
    
    # Handle boolean fields from FormData
    is_active = serializers.BooleanField(required=False, default=True)
    is_featured = serializers.BooleanField(required=False, default=False)
    is_new = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Product
        fields = '__all__'
    
    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        product = Product.objects.create(**validated_data)
        
        # Tạo variants
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product
    
    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', [])
        
        # Update product
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update variants (xóa cũ, tạo mới)
        if variants_data:
            instance.variants.all().delete()
            for variant_data in variants_data:
                ProductVariant.objects.create(product=instance, **variant_data)
        
        return instance



#-----------------------------gio hang-----------------------------------------------
# Để hiển thị thông tin đầy đủ của variant và product trong giỏ
class ProductVariantCartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'color', 'stock_quantity', 'product']

# Cart item
class CartItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantCartSerializer(read_only=True)
    product_variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(),
        source='product_variant',
        write_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product_variant', 'product_variant_id', 'quantity']

# Cart chính
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items']
        read_only_fields = ['user']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        cart = Cart.objects.create(user=self.context['request'].user)
        for item_data in items_data:
            CartItem.objects.create(cart=cart, **item_data)
        return cart

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items')
        instance.items.all().delete()
        for item_data in items_data:
            CartItem.objects.create(cart=instance, **item_data)
        return instance


#-----------------------------Order Management-----------------------------------------------

# Serializer để hiển thị thông tin sản phẩm trong order item
class OrderItemProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'color', 'product_name', 'image']
    
    def get_image(self, obj):
        # Lấy ảnh đầu tiên của product
        if obj.product.images.exists():
            first_image = obj.product.images.first()
            request = self.context.get('request')
            if request and first_image.image:
                return request.build_absolute_uri(first_image.image.url)
        return None

# Order Item serializer
class OrderItemSerializer(serializers.ModelSerializer):
    product_variant = OrderItemProductSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_variant', 'quantity', 'price_per_item', 'total_price']
    
    def get_total_price(self, obj):
        return obj.get_total_price()

# Order serializer cho việc hiển thị
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    total_items = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    coupon_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_name', 'user_email', 'total_price', 'status', 'payment_status',
            'shipping_name', 'shipping_address', 'shipping_city', 
            'shipping_postal_code', 'shipping_country', 'phone_number',
            'notes', 'created_at', 'updated_at', 'items', 'total_items',
            'discount_amount', 'coupon_info'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
            }
        return None
    
    def get_total_items(self, obj):
        return obj.get_total_items()
    
    def get_coupon_info(self, obj):
        if obj.used_coupon:
            return {
                'code': obj.used_coupon.coupon.code,
                'name': obj.used_coupon.coupon.name,
                'discount_amount': obj.discount_amount
            }
        return None

# Order create serializer
class OrderCreateSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(required=False, write_only=True)
    payment_method = serializers.CharField(required=False, write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'shipping_name', 'shipping_address', 'shipping_city', 
            'shipping_postal_code', 'shipping_country', 'phone_number', 'notes',
            'coupon_code', 'payment_method'
        ]
    
    def validate(self, attrs):
        # Validate that user has items in cart
        user = self.context['request'].user
        try:
            cart = Cart.objects.get(user=user)
            if not cart.items.exists():
                raise serializers.ValidationError("Cart is empty")
        except Cart.DoesNotExist:
            raise serializers.ValidationError("No cart found")
        
        return attrs
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.get(user=user)
        
        # Extract coupon code and payment method if provided
        coupon_code = validated_data.pop('coupon_code', None)
        payment_method = validated_data.pop('payment_method', None)
        
        # Calculate total price
        total_price = 0
        for cart_item in cart.items.all():
            # Use current price or discount price
            product = cart_item.product_variant.product
            item_price = product.discount_price if product.discount_price else product.price
            total_price += item_price * cart_item.quantity
        
        # Add shipping fee if order is less than 500,000
        shipping_fee = 0 if total_price >= 500000 else 30000
        total_price += shipping_fee
        
        # Apply coupon if provided
        discount_amount = 0
        used_coupon = None
        
        if coupon_code:
            try:
                # Find the user's coupon
                user_coupon = UserCoupon.objects.get(
                    user=user,
                    coupon__code=coupon_code,
                    is_used=False
                )
                
                # Validate coupon
                if user_coupon.coupon.is_valid(user):
                    # Check if order amount meets minimum purchase requirement
                    if total_price >= user_coupon.coupon.min_purchase_amount:
                        # Calculate discount
                        discount_amount = user_coupon.coupon.calculate_discount(total_price)
                        total_price -= discount_amount
                        used_coupon = user_coupon
                    else:
                        raise serializers.ValidationError({
                            'coupon_code': f'Đơn hàng phải tối thiểu {user_coupon.coupon.min_purchase_amount:,.0f}₫ để sử dụng mã này'
                        })
                else:
                    raise serializers.ValidationError({
                        'coupon_code': 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
                    })
            except UserCoupon.DoesNotExist:
                raise serializers.ValidationError({
                    'coupon_code': 'Mã giảm giá không tồn tại hoặc đã được sử dụng'
                })
        
        # Determine payment status based on payment method
        payment_status = 'pending'  # Default
        if payment_method == 'momo':
            payment_status = 'paid'  # MoMo payments are pre-paid
        
        # Create order
        order = Order.objects.create(
            user=user,
            total_price=total_price,
            discount_amount=discount_amount,
            used_coupon=used_coupon,
            payment_status=payment_status,
            **validated_data
        )
        
        # Mark coupon as used
        if used_coupon:
            used_coupon.is_used = True
            used_coupon.used_at = timezone.now()
            used_coupon.order = order
            used_coupon.save()
        
        # Create order items from cart
        for cart_item in cart.items.all():
            product = cart_item.product_variant.product
            item_price = product.discount_price if product.discount_price else product.price
            
            # Release reservation before creating OrderItem
            # This will restore reserved_quantity back to available
            if cart_item.is_reserved:
                cart_item.release_reservation()
            
            OrderItem.objects.create(
                order=order,
                product_variant=cart_item.product_variant,
                quantity=cart_item.quantity,
                price_per_item=item_price
            )
            
            # Stock will be exported automatically by post_save signal
            # Signal will handle the actual stock export (reduce stock_quantity)
        
        # Clear cart after creating order
        cart.items.all().delete()
        
        return order

# Order status update serializer (for admin)
class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status', 'payment_status']
    
    def validate_status(self, value):
        valid_statuses = dict(Order.STATUS_CHOICES)
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {list(valid_statuses.keys())}")
        return value
    
    def validate_payment_status(self, value):
        valid_payment_statuses = dict(Order.PAYMENT_STATUS_CHOICES)
        if value not in valid_payment_statuses:
            raise serializers.ValidationError(f"Invalid payment status. Must be one of: {list(valid_payment_statuses.keys())}")
        return value

# User serializer for admin management
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'is_active', 'is_admin', 'is_staff', 'date_joined', 'last_login',
                 'date_of_birth', 'phone_number')
        read_only_fields = ('id', 'date_joined', 'last_login')

#-----------------------------Review Management-----------------------------------------------

# Review serializer
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'order', 'rating', 'comment', 
            'created_at', 'user_name', 'user_first_name', 'user_last_name',
            'product_name'
        ]
        read_only_fields = ['user', 'created_at']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate(self, attrs):
        # Kiểm tra xem user đã mua sản phẩm này chưa
        user = self.context['request'].user
        product = attrs['product']
        
        # Kiểm tra xem user đã có đơn hàng chứa sản phẩm này và đã delivered chưa
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product_variant__product=product,
            order__status='delivered'
        ).exists()
        
        if not has_purchased:
            raise serializers.ValidationError("You can only review products you have purchased and received")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

#-----------------------------Wishlist Management-----------------------------------------------

# Wishlist serializer
class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

# Wishlist item serializer (để hiển thị đầy đủ thông tin)
class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Trả về full product object
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_discount_price = serializers.DecimalField(source='product.discount_price', max_digits=10, decimal_places=2, read_only=True)
    product_main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = [
            'id', 'product', 'product_name', 'product_price', 
            'product_discount_price', 'product_main_image', 'created_at'
        ]
    
    def get_product_main_image(self, obj):
        return obj.product.get_main_image()


#-----------------------------Stock Management Serializers-----------------------------------------------

# Stock History Serializer
class StockHistorySerializer(serializers.ModelSerializer):
    product_variant_detail = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = StockHistory
        fields = [
            'id', 'product_variant', 'product_variant_detail', 'transaction_type', 
            'transaction_type_display', 'quantity', 'quantity_before', 'quantity_after',
            'order', 'order_id', 'reference_number', 'cost_per_item', 'notes',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_product_variant_detail(self, obj):
        return {
            'id': obj.product_variant.id,
            'sku': obj.product_variant.sku,
            'product_name': obj.product_variant.product.name,
            'size': obj.product_variant.size,
            'color': obj.product_variant.color,
        }


# Stock Alert Serializer
class StockAlertSerializer(serializers.ModelSerializer):
    product_variant_detail = serializers.SerializerMethodField()
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    
    class Meta:
        model = StockAlert
        fields = [
            'id', 'product_variant', 'product_variant_detail', 'alert_type', 
            'alert_type_display', 'current_quantity', 'threshold', 
            'is_resolved', 'resolved_at', 'resolved_by', 'resolved_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_product_variant_detail(self, obj):
        return {
            'id': obj.product_variant.id,
            'sku': obj.product_variant.sku,
            'product_name': obj.product_variant.product.name,
            'size': obj.product_variant.size,
            'color': obj.product_variant.color,
            'stock_quantity': obj.product_variant.stock_quantity,
            'available_quantity': obj.product_variant.available_quantity,
        }


# Product Variant với Stock Info đầy đủ
class ProductVariantStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    need_reorder = serializers.BooleanField(read_only=True)
    total_value = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_name', 'sku', 'size', 'color',
            'stock_quantity', 'reserved_quantity', 'available_quantity',
            'minimum_stock', 'reorder_point', 'cost_price', 'total_value',
            'is_active', 'is_low_stock', 'need_reorder',
            'created_at', 'updated_at'
        ]
    
    def get_total_value(self, obj):
        return float(obj.stock_quantity * obj.cost_price)


# Stock Import/Export Request Serializer
# NOTE: variant_id now comes from URL parameter, not request body
class StockTransactionSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(required=True, min_value=1)
    cost_per_item = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    reference_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0")
        return value


# Stock Adjustment Request Serializer
# NOTE: variant_id now comes from URL parameter, not request body
class StockAdjustmentSerializer(serializers.Serializer):
    new_quantity = serializers.IntegerField(required=True, min_value=0)
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_new_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Số lượng mới không thể âm")
        return value


#-----------------------------Coupon & Birthday Coupons-----------------------------------------------

class CouponSerializer(serializers.ModelSerializer):
    """Serializer cho Coupon (Admin tạo/quản lý)"""
    is_valid_now = serializers.SerializerMethodField()
    remaining_uses = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = '__all__'
        read_only_fields = ('current_uses', 'created_at', 'updated_at')
    
    def get_is_valid_now(self, obj):
        valid, message = obj.is_valid()
        return valid
    
    def get_remaining_uses(self, obj):
        if obj.max_uses:
            return obj.max_uses - obj.current_uses
        return None


class UserCouponSerializer(serializers.ModelSerializer):
    """Serializer cho UserCoupon (Ví voucher của khách hàng)"""
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    coupon_name = serializers.CharField(source='coupon.name', read_only=True)
    coupon_description = serializers.CharField(source='coupon.description', read_only=True)
    coupon_type = serializers.CharField(source='coupon.coupon_type', read_only=True)
    discount_value = serializers.DecimalField(source='coupon.discount_value', 
                                              max_digits=10, decimal_places=2, read_only=True)
    max_discount_amount = serializers.DecimalField(source='coupon.max_discount_amount', 
                                                    max_digits=10, decimal_places=2, read_only=True)
    min_purchase_amount = serializers.DecimalField(source='coupon.min_purchase_amount', 
                                                    max_digits=10, decimal_places=2, read_only=True)
    
    is_valid_now = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = UserCoupon
        fields = [
            'id', 'coupon', 'coupon_code', 'coupon_name', 'coupon_description',
            'coupon_type', 'discount_value', 'max_discount_amount', 'min_purchase_amount',
            'valid_from', 'valid_to', 'is_used', 'used_at', 'order',
            'assigned_at', 'notified', 'is_valid_now', 'days_remaining'
        ]
        read_only_fields = ('assigned_at', 'notified', 'is_used', 'used_at', 'order')
    
    def get_is_valid_now(self, obj):
        valid, message = obj.is_valid()
        return {
            'valid': valid,
            'message': message
        }
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        if obj.is_used:
            return 0
        remaining = (obj.valid_to - timezone.now()).days
        return max(0, remaining)


class ApplyCouponSerializer(serializers.Serializer):
    """Serializer để áp dụng mã giảm giá vào đơn hàng"""
    coupon_code = serializers.CharField(max_length=50)
    order_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    def validate_coupon_code(self, value):
        try:
            # Tìm kiếm không phân biệt hoa thường
            coupon = Coupon.objects.get(code__iexact=value)
            return coupon
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Mã giảm giá không tồn tại")
    
    def validate(self, attrs):
        coupon = attrs['coupon_code']
        order_amount = attrs['order_amount']
        user = self.context.get('user')
        
        # Kiểm tra coupon có hợp lệ không
        valid, message = coupon.is_valid(user)
        if not valid:
            raise serializers.ValidationError({"coupon_code": message})
        
        # Kiểm tra đơn hàng tối thiểu
        if order_amount < coupon.min_purchase_amount:
            raise serializers.ValidationError({
                "order_amount": f"Đơn hàng tối thiểu {coupon.min_purchase_amount:,}đ"
            })
        
        # Kiểm tra user có mã này trong ví không (với birthday coupon)
        if coupon.occasion_type == 'birthday':
            user_coupon = UserCoupon.objects.filter(
                user=user,
                coupon=coupon,
                is_used=False
            ).first()
            
            if not user_coupon:
                raise serializers.ValidationError({
                    "coupon_code": "Bạn không có mã sinh nhật này trong ví voucher"
                })
            
            # Kiểm tra thời gian của user_coupon
            valid_uc, message_uc = user_coupon.is_valid()
            if not valid_uc:
                raise serializers.ValidationError({"coupon_code": message_uc})
        
        # Tính discount
        discount = coupon.calculate_discount(order_amount)
        attrs['discount_amount'] = discount
        attrs['final_amount'] = order_amount - discount
        
        return attrs
