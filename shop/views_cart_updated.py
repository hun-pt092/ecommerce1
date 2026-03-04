# Updated CartView with ProductSKU support
# Replace the CartView class in shop/views.py with this code

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem, ProductSKU
from .serializers import CartSerializer


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        print("=== CART POST DEBUG ===")
        print("Request data:", request.data)
        print("Current cart items:", [{"id": item.id, "sku": item.product_sku.id, "qty": item.quantity} for item in cart.items.all()])
        
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
        
        product_sku_id = request.data.get('product_sku_id')
        quantity = int(request.data.get('quantity', 1))
        
        print("=== CART PUT DEBUG (ADD ITEM) ===")
        print(f"Adding SKU {product_sku_id} with quantity {quantity}")
        
        try:
            product_sku = ProductSKU.objects.get(id=product_sku_id)
            
            # Check if item already exists
            cart_item, created = cart.items.get_or_create(
                product_sku=product_sku,
                defaults={'quantity': 0}
            )
            
            # Calculate new quantity
            new_quantity = cart_item.quantity + quantity
            
            print(f"Current quantity: {cart_item.quantity}")
            print(f"Adding quantity: {quantity}")
            print(f"New quantity: {new_quantity}")
            print(f"Stock available: {product_sku.available_quantity}")
            
            # Validate stock quantity (chỉ khi tăng quantity)
            if quantity > 0 and new_quantity > product_sku.available_quantity:
                available = product_sku.available_quantity - cart_item.quantity
                if created:
                    cart_item.delete()
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
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ProductSKU.DoesNotExist:
            return Response(
                {"error": "Product SKU not found"}, 
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
        
        product_sku_id = request.data.get('product_sku_id')
        
        print(f"=== CART DELETE DEBUG (REMOVE ITEM) ===")
        print(f"Removing SKU {product_sku_id}")
        
        try:
            cart_item = cart.items.get(product_sku=product_sku_id)
            cart_item.delete()
            print(f"Successfully deleted item")
            
            # Return updated cart
            serializer = CartSerializer(cart, context={'request': request})
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
