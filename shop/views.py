#from django.shortcuts import render

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product, ProductVariant, User, Order, OrderItem, Category, Brand, ProductImage, Review, Wishlist
from .pagination import ProductPagination, OrderPagination, AdminPagination, StandardResultsSetPagination
from .serializers import (
    RegisterSerializer, ProductSerializer, OrderSerializer, 
    OrderCreateSerializer, OrderStatusUpdateSerializer,
    OrderItemSerializer, UserSerializer,
    CategorySerializer, BrandSerializer, ReviewSerializer, 
    WishlistSerializer, WishlistItemSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

# Custom permission for admin only
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)

# Current User Info
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from .serializers import CartSerializer
from rest_framework.permissions import IsAuthenticated

# Đăng ký user
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
    def post(self, request, *args, **kwargs):
        print("=== REGISTER REQUEST DEBUG ===")
        print("Request data:", request.data)
        print("Request content type:", request.content_type)
        print("Request method:", request.method)
        print("Request headers:", dict(request.headers))
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print("User created successfully:", user.username)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Danh sách sản phẩm
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('images', 'variants')
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ProductPagination

# Chi tiết sản phẩm
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)

# Public Categories List (for filtering)
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

# Public Brands List (for filtering)  
class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = (permissions.AllowAny,)

#------------------------------them gio hang----------------------------------------

# API giỏ hàng
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        print("=== CART POST DEBUG ===")
        print("Request data:", request.data)
        print("Current cart items:", [{"id": item.id, "variant": item.product_variant.id, "qty": item.quantity} for item in cart.items.all()])
        
        # Sử dụng serializer để update cart với items mới
        serializer = CartSerializer(cart, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            print("Cart updated successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("Cart serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """Add single item to cart"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        product_variant_id = request.data.get('product_variant_id')
        quantity = int(request.data.get('quantity', 1))
        
        print("=== CART PUT DEBUG (ADD ITEM) ===")
        print(f"Adding variant {product_variant_id} with quantity {quantity}")
        
        try:
            product_variant = ProductVariant.objects.get(id=product_variant_id)
            
            # Check if item already exists
            cart_item, created = cart.items.get_or_create(
                product_variant=product_variant,
                defaults={'quantity': 0}  # Set default 0 để validate sau
            )
            
            # Calculate new quantity
            new_quantity = cart_item.quantity + quantity
            
            print(f"Current quantity: {cart_item.quantity}")
            print(f"Adding quantity: {quantity}")
            print(f"New quantity: {new_quantity}")
            print(f"Stock available: {product_variant.stock_quantity}")
            
            # Validate stock quantity (chỉ khi tăng quantity)
            if quantity > 0 and new_quantity > product_variant.stock_quantity:
                available = product_variant.stock_quantity - cart_item.quantity
                if created:
                    cart_item.delete()  # Xóa item vừa tạo nếu validation fail
                return Response({
                    "error": f"Không đủ hàng trong kho. Chỉ còn {available} sản phẩm có thể thêm.",
                    "available_quantity": available,
                    "requested_quantity": quantity
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if created:
                # Item mới, set quantity sau khi validate
                cart_item.quantity = quantity
                if cart_item.quantity <= 0:
                    cart_item.delete()
                    print("Deleted new item with zero/negative quantity")
                else:
                    cart_item.save()
                    print(f"Created new item with quantity {cart_item.quantity}")
            else:
                # Update existing item
                cart_item.quantity = new_quantity
                
                # Nếu quantity <= 0, xóa item
                if cart_item.quantity <= 0:
                    print(f"Removing item with quantity {cart_item.quantity}")
                    cart_item.delete()
                else:
                    cart_item.save()
                    print(f"Updated existing item to quantity {cart_item.quantity}")
            
            # Return updated cart
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ProductVariant.DoesNotExist:
            return Response(
                {"error": "Product variant not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error adding to cart: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request):
        """Remove specific item from cart"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        product_variant_id = request.data.get('product_variant_id')
        
        print(f"=== CART DELETE DEBUG (REMOVE ITEM) ===")
        print(f"Removing variant {product_variant_id}")
        
        try:
            cart_item = cart.items.get(product_variant=product_variant_id)
            cart_item.delete()
            print(f"Successfully deleted item")
            
            # Return updated cart
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Item not found in cart"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error removing from cart: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


#-----------------------------Order Management-----------------------------------------------

# Create order from cart
class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        print("=== ORDER CREATE REQUEST DEBUG ===")
        print("Request data:", request.data)
        print("User:", request.user.username)
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            print("Order created successfully:", order.id)
            
            # Return full order data
            order_serializer = OrderSerializer(order)
            return Response(order_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# List user's orders
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = OrderPagination
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('user').prefetch_related('items__product_variant__product').order_by('-created_at')

# Get order details
class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

# Admin: List all orders
class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        return Order.objects.all().select_related('user').prefetch_related('items__product_variant__product').order_by('-created_at')

# Admin: Update order status
class AdminOrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only allow admin users to update order status
        if not self.request.user.is_admin and not self.request.user.is_superuser:
            return Order.objects.none()
        return Order.objects.all()
    
    def patch(self, request, *args, **kwargs):
        print("=== ORDER STATUS UPDATE DEBUG ===")
        print("Request data:", request.data)
        print("User:", request.user.username)
        print("Is admin:", request.user.is_admin)
        print("Is superuser:", request.user.is_superuser)
        
        return super().patch(request, *args, **kwargs)

# Cancel order (user can cancel if status is pending)
class OrderCancelView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
            
            if order.status != 'pending':
                return Response(
                    {"error": "Can only cancel pending orders"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Restore stock quantities
            for item in order.items.all():
                item.product_variant.stock_quantity += item.quantity
                item.product_variant.save()
            
            # Update order status
            order.status = 'cancelled'
            order.save()
            
            serializer = OrderSerializer(order)
            return Response(serializer.data)
            
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


# ===== NEW ORDER MANAGEMENT VIEWS =====

# Create order from cart with shipping info
class CreateOrderFromCartView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get user's cart
            cart = Cart.objects.get(user=request.user)
            if not cart.items.exists():
                return Response(
                    {"error": "Cart is empty"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate total price
            total_price = sum(
                item.quantity * item.product_variant.product.price 
                for item in cart.items.all()
            )
            
            # Create order
            order_data = {
                'user': request.user.id,
                'total_price': total_price,
                'shipping_name': request.data.get('shipping_name', ''),
                'shipping_address': request.data.get('shipping_address', ''),
                'shipping_city': request.data.get('shipping_city', ''),
                'shipping_postal_code': request.data.get('shipping_postal_code', ''),
                'shipping_country': request.data.get('shipping_country', 'Vietnam'),
                'phone_number': request.data.get('phone_number', ''),
                'notes': request.data.get('notes', ''),
                'payment_method': request.data.get('payment_method', 'cod')
            }
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                total_price=total_price,
                shipping_name=order_data['shipping_name'],
                shipping_address=order_data['shipping_address'],
                shipping_city=order_data['shipping_city'],
                shipping_postal_code=order_data['shipping_postal_code'],
                shipping_country=order_data['shipping_country'],
                phone_number=order_data['phone_number'],
                notes=order_data['notes']
            )
            
            # Create order items from cart items
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product_variant=cart_item.product_variant,
                    quantity=cart_item.quantity,
                    price_per_item=cart_item.product_variant.product.price
                )
                
                # Update stock quantity
                cart_item.product_variant.stock_quantity -= cart_item.quantity
                cart_item.product_variant.save()
            
            # Clear cart
            cart.items.all().delete()
            
            # Return order details
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# User's orders list
class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = OrderPagination
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('user').prefetch_related('items__product_variant__product').order_by('-created_at')


# Order detail for user
class UserOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# Update order status (admin only)
class OrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        # Check if user is admin
        if not (request.user.is_admin or request.user.is_superuser):
            return Response(
                {"error": "Permission denied. Admin access required."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            order = Order.objects.get(pk=pk)
            
            # Update status if provided
            if 'status' in request.data:
                if request.data['status'] not in dict(Order.STATUS_CHOICES):
                    return Response(
                        {"error": "Invalid status"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                order.status = request.data['status']
            
            # Update payment status if provided
            if 'payment_status' in request.data:
                if request.data['payment_status'] not in dict(Order.PAYMENT_STATUS_CHOICES):
                    return Response(
                        {"error": "Invalid payment status"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                order.payment_status = request.data['payment_status']
            
            order.save()
            
            return Response({
                "message": "Order status updated successfully",
                "order": {
                    "id": order.id,
                    "status": order.status,
                    "payment_status": order.payment_status
                }
            })
            
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, pk):
        # Check if user is admin
        if not (request.user.is_admin or request.user.is_superuser):
            return Response(
                {"error": "Permission denied. Admin access required."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            order = Order.objects.get(pk=pk)
            
            # Update status if provided
            if 'status' in request.data:
                if request.data['status'] not in dict(Order.STATUS_CHOICES):
                    return Response(
                        {"error": "Invalid status"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                order.status = request.data['status']
            
            # Update payment status if provided
            if 'payment_status' in request.data:
                if request.data['payment_status'] not in dict(Order.PAYMENT_STATUS_CHOICES):
                    return Response(
                        {"error": "Invalid payment status"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                order.payment_status = request.data['payment_status']
            
            order.save()
            
            return Response({
                "message": "Order status updated successfully",
                "order": {
                    "id": order.id,
                    "status": order.status,
                    "payment_status": order.payment_status
                }
            })
            
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


# ===== ADMIN API VIEWS =====

from .serializers import CategorySerializer, BrandSerializer, AdminProductSerializer, ProductImageSerializer

# Admin: Categories CRUD
class AdminCategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return Category.objects.none()
        return Category.objects.all()

class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return Category.objects.none()
        return Category.objects.all()

# Admin: Brands CRUD
class AdminBrandListView(generics.ListCreateAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return Brand.objects.none()
        return Brand.objects.all()

class AdminBrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return Brand.objects.none()
        return Brand.objects.all()

# Admin: Products CRUD
class AdminProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return Product.objects.none()
        return Product.objects.all().select_related('category', 'brand').prefetch_related('variants', 'images').order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        # Debug logging
        print("=== ADMIN PRODUCT CREATE DEBUG ===")
        print("User:", request.user.username)
        print("Is admin:", request.user.is_admin)
        print("Is superuser:", request.user.is_superuser)
        print("Request data keys:", list(request.data.keys()))
        print("Request files keys:", list(request.FILES.keys()))
        
        # Check admin permission first
        if not (request.user.is_admin or request.user.is_superuser):
            return Response(
                {"error": "Admin access required"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Call parent create method
        try:
            response = super().create(request, *args, **kwargs)
            print("Product created successfully")
            return response
        except Exception as e:
            print(f"Error creating product: {str(e)}")
            return Response(
                {"error": f"Failed to create product: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def perform_create(self, serializer):
        # Debug logging
        print("=== ADMIN PRODUCT CREATE DEBUG ===")
        print("User:", self.request.user.username)
        print("Is admin:", self.request.user.is_admin)
        print("Is superuser:", self.request.user.is_superuser)
        print("Request data:", dict(self.request.data))
        print("Request files:", list(self.request.FILES.keys()))
        
        # Check admin permission
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Admin access required")
            
        product = serializer.save()
        
        # Handle image uploads
        images_data = self.request.FILES.getlist('images')
        for i, image_file in enumerate(images_data):
            is_main = i == 0  # First image is main
            ProductImage.objects.create(
                product=product,
                image=image_file,
                is_main=is_main,
                order=i,
                alt_text=f"{product.name} - Image {i+1}"
            )
        
        # Handle variants from JSON
        variants_json = self.request.data.get('variants')
        if variants_json:
            import json
            try:
                variants_data = json.loads(variants_json)
                for variant_data in variants_data:
                    ProductVariant.objects.create(
                        product=product,
                        size=variant_data.get('size', ''),
                        color=variant_data.get('color', ''),
                        stock_quantity=variant_data.get('stock_quantity', 0)
                    )
            except json.JSONDecodeError:
                pass

class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return Product.objects.none()
        return Product.objects.all().select_related('category', 'brand').prefetch_related('variants', 'images')
    
    def update(self, request, *args, **kwargs):
        # Debug logging
        print("=== ADMIN PRODUCT UPDATE DEBUG ===")
        print("User:", request.user.username)
        print("Product ID:", kwargs.get('pk'))
        print("Request data keys:", list(request.data.keys()))
        print("Request files keys:", list(request.FILES.keys()))
        
        # Check admin permission
        if not (request.user.is_admin or request.user.is_superuser):
            return Response(
                {"error": "Admin access required"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the product instance
        instance = self.get_object()
        
        # Debug brand field specifically
        print("Brand in request.data:", request.data.get('brand'))
        print("Category in request.data:", request.data.get('category'))
        
        # Update basic product fields
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            print("Serializer is valid. Validated data:", serializer.validated_data)
            product = serializer.save()
            
            # Handle deleted images
            deleted_image_ids_json = request.data.get('deleted_image_ids')
            if deleted_image_ids_json:
                import json
                try:
                    deleted_ids = json.loads(deleted_image_ids_json)
                    # Delete the images
                    ProductImage.objects.filter(
                        id__in=deleted_ids, 
                        product=product
                    ).delete()
                except json.JSONDecodeError:
                    pass
            
            # Handle existing images updates
            existing_images_json = request.data.get('existing_images')
            if existing_images_json:
                import json
                try:
                    existing_images_data = json.loads(existing_images_json)
                    for img_data in existing_images_data:
                        try:
                            img_obj = ProductImage.objects.get(
                                id=img_data['id'], 
                                product=product
                            )
                            # Reset all images to not main if this one is being set as main
                            if img_data.get('is_main'):
                                ProductImage.objects.filter(product=product).update(is_main=False)
                            
                            img_obj.is_main = img_data.get('is_main', False)
                            img_obj.alt_text = img_data.get('alt_text', '')
                            img_obj.order = img_data.get('order', 0)
                            img_obj.save()
                        except ProductImage.DoesNotExist:
                            continue
                except json.JSONDecodeError:
                    pass
            
            # Handle new image uploads
            new_images = request.FILES.getlist('images')
            for i, image_file in enumerate(new_images):
                # Get existing images count to set proper order
                existing_count = product.images.count()
                ProductImage.objects.create(
                    product=product,
                    image=image_file,
                    is_main=False,  # Don't auto-set main for updates
                    order=existing_count + i,
                    alt_text=f"{product.name} - Image {existing_count + i + 1}"
                )
            
            # Handle variants update (replace all)
            variants_json = request.data.get('variants')
            if variants_json:
                import json
                try:
                    variants_data = json.loads(variants_json)
                    # Delete existing variants
                    product.variants.all().delete()
                    # Create new variants
                    for variant_data in variants_data:
                        ProductVariant.objects.create(
                            product=product,
                            size=variant_data.get('size', ''),
                            color=variant_data.get('color', ''),
                            stock_quantity=variant_data.get('stock_quantity', 0)
                        )
                except json.JSONDecodeError:
                    pass
            
            # Return updated product data
            return Response(self.get_serializer(product).data)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin check endpoint
class AdminCheckView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'is_admin': user.is_admin or user.is_superuser,
            'username': user.username,
            'email': user.email
        })

# Dashboard Statistics API
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        
        from django.db.models import Count, Sum
        from django.utils import timezone
        from datetime import timedelta
        
        # Get current month's data
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        stats = {
            'total_products': ProductVariant.objects.filter(product__is_active=True).count(),  # Tổng sản phẩm (variants)
            'total_product_types': Product.objects.filter(is_active=True).count(),  # Tổng loại sản phẩm
            'total_orders': Order.objects.count(),
            'total_users': User.objects.count(),
            'total_revenue': Order.objects.filter(
                payment_status='completed'
            ).aggregate(
                total=Sum('total_price')
            )['total'] or 0,
            
            # Monthly stats
            'monthly_orders': Order.objects.filter(
                created_at__gte=start_of_month
            ).count(),
            'monthly_revenue': Order.objects.filter(
                created_at__gte=start_of_month,
                payment_status='completed'
            ).aggregate(
                total=Sum('total_price')
            )['total'] or 0,
            
            # Today stats
            'today_orders': Order.objects.filter(
                created_at__gte=start_of_today
            ).count(),
            'today_users': User.objects.filter(
                date_joined__gte=start_of_today
            ).count(),
            
            # Recent data
            'recent_orders': OrderSerializer(
                Order.objects.order_by('-created_at')[:5], 
                many=True
            ).data,
            'recent_users': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'date_joined': user.date_joined
                }
                for user in User.objects.order_by('-date_joined')[:5]
            ]
        }
        
        return Response(stats)

# Orders Statistics API
class AdminOrderStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        
        from django.db.models import Count, Sum
        
        stats = {
            'total_orders': Order.objects.count(),
            'status_breakdown': dict(
                Order.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')
            ),
            'payment_breakdown': dict(
                Order.objects.values('payment_status').annotate(count=Count('id')).values_list('payment_status', 'count')
            ),
            'total_revenue': Order.objects.filter(
                payment_status='completed'
            ).aggregate(total=Sum('total_price'))['total'] or 0
        }
        
        return Response(stats)

# Users Statistics API
class AdminUserStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        # Get current month's data
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'inactive_users': User.objects.filter(is_active=False).count(),
            'admin_users': User.objects.filter(is_admin=True).count(),
            'monthly_new_users': User.objects.filter(
                date_joined__gte=start_of_month
            ).count(),
        }
        
        return Response(stats)

# Users Management API  
class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    pagination_class = AdminPagination
    
    def get_queryset(self):
        return User.objects.order_by('-date_joined')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['include_sensitive'] = False  # Don't include password in response
        return context

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.all()

# Update User Status (activate/deactivate)
class AdminUserStatusUpdateView(APIView):
    permission_classes = [IsAdminUser]
    
    def patch(self, request, pk):
        
        try:
            user = User.objects.get(pk=pk)
            action = request.data.get('action')
            
            if action == 'activate':
                user.is_active = True
                message = f'User {user.username} has been activated'
            elif action == 'deactivate':
                user.is_active = False
                message = f'User {user.username} has been deactivated'
            else:
                return Response({'error': 'Invalid action'}, status=400)
            
            user.save()
            return Response({
                'message': message,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'is_active': user.is_active
                }
            })
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

#-----------------------------Review Management-----------------------------------------------

# Review List for Product
class ProductReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return Review.objects.filter(product_id=product_id).select_related('user', 'product')

# Create Review
class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# User's Reviews
class UserReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related('product')

# Update/Delete Review (user can only edit their own reviews)
class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)

#-----------------------------Wishlist Management-----------------------------------------------

# User's Wishlist
class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's wishlist"""
        wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
        serializer = WishlistItemSerializer(wishlist_items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Add product to wishlist"""
        serializer = WishlistSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Handle unique constraint violation
                if "UNIQUE constraint failed" in str(e):
                    return Response(
                        {"error": "Product already in wishlist"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                return Response(
                    {"error": str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Remove from wishlist
class WishlistItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, product_id):
        """Remove product from wishlist"""
        try:
            wishlist_item = Wishlist.objects.get(
                user=request.user, 
                product_id=product_id
            )
            wishlist_item.delete()
            return Response(
                {"message": "Product removed from wishlist"}, 
                status=status.HTTP_200_OK
            )
        except Wishlist.DoesNotExist:
            return Response(
                {"error": "Product not found in wishlist"}, 
                status=status.HTTP_404_NOT_FOUND
            )

# Check if product is in wishlist
class WishlistCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, product_id):
        """Check if product is in user's wishlist"""
        is_in_wishlist = Wishlist.objects.filter(
            user=request.user, 
            product_id=product_id
        ).exists()
        return Response({"is_in_wishlist": is_in_wishlist})

# Product stats (including reviews and wishlist count)
class ProductStatsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, product_id):
        """Get product statistics"""
        try:
            product = Product.objects.get(id=product_id)
            reviews = Review.objects.filter(product=product)
            
            # Calculate average rating
            total_reviews = reviews.count()
            avg_rating = 0
            if total_reviews > 0:
                total_rating = sum(review.rating for review in reviews)
                avg_rating = total_rating / total_reviews
            
            # Count wishlist
            wishlist_count = Wishlist.objects.filter(product=product).count()
            
            # Rating breakdown (1-5 stars)
            rating_breakdown = {}
            for i in range(1, 6):
                rating_breakdown[f"star_{i}"] = reviews.filter(rating=i).count()
            
            return Response({
                "product_id": product_id,
                "total_reviews": total_reviews,
                "average_rating": round(avg_rating, 1),
                "wishlist_count": wishlist_count,
                "rating_breakdown": rating_breakdown
            })
            
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
