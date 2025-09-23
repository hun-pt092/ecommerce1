#from django.shortcuts import render

from rest_framework import generics, permissions
from .models import Product, ProductVariant, User, Order, OrderItem
from .serializers import (
    RegisterSerializer, ProductSerializer, OrderSerializer, 
    OrderCreateSerializer, OrderStatusUpdateSerializer,
    OrderItemSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView


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
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)

# Chi tiết sản phẩm
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
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
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

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
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only allow admin users to see all orders
        if not self.request.user.is_admin and not self.request.user.is_superuser:
            return Order.objects.none()
        return Order.objects.all()

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
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


# Order detail for user
class UserOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# Update order status (admin only)
class OrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
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
