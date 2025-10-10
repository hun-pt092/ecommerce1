from rest_framework import serializers
from .models import User, Product, ProductVariant, Order, OrderItem, Category, Brand, ProductImage
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

from .models import Cart, CartItem 

# User serializer để đăng ký
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)  # Xác nhận password

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password Không khớp với nhau"})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.set_password(validated_data['password'])
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
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    
    # Handle foreign key fields
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=True)
    brand = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all(), required=False, allow_null=True)
    
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
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'color', 'product_name']

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
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_name', 'total_price', 'status', 'payment_status',
            'shipping_name', 'shipping_address', 'shipping_city', 
            'shipping_postal_code', 'shipping_country', 'phone_number',
            'notes', 'created_at', 'updated_at', 'items', 'total_items'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_total_items(self, obj):
        return obj.get_total_items()

# Order create serializer
class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'shipping_name', 'shipping_address', 'shipping_city', 
            'shipping_postal_code', 'shipping_country', 'phone_number', 'notes'
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
        
        # Calculate total price
        total_price = 0
        for cart_item in cart.items.all():
            # Use current price or discount price
            product = cart_item.product_variant.product
            item_price = product.discount_price if product.discount_price else product.price
            total_price += item_price * cart_item.quantity
        
        # Create order
        order = Order.objects.create(
            user=user,
            total_price=total_price,
            **validated_data
        )
        
        # Create order items from cart
        for cart_item in cart.items.all():
            product = cart_item.product_variant.product
            item_price = product.discount_price if product.discount_price else product.price
            
            OrderItem.objects.create(
                order=order,
                product_variant=cart_item.product_variant,
                quantity=cart_item.quantity,
                price_per_item=item_price
            )
            
            # Update stock quantity
            cart_item.product_variant.stock_quantity -= cart_item.quantity
            cart_item.product_variant.save()
        
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
                 'is_active', 'is_admin', 'is_staff', 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login')
