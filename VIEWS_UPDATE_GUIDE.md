# Views Update Guide - ProductSKU Migration

## Các thay đổi cần thực hiện trong `shop/views.py`

### 1. CartView - Thay đổi từ ProductVariant sang ProductSKU

#### Thay đổi trong get() method:
```python
def get(self, request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart, context={'request': request})  # Thêm context
    return Response(serializer.data)
```

#### Thay đổi trong post() method:
```python
print("Current cart items:", [{"id": item.id, "sku": item.product_sku.id, "qty": item.quantity} for item in cart.items.all()])
```

#### Thay đổi trong put() method - Add item to cart:
```python
def put(self, request):
    """Add single item to cart"""
    cart, _ = Cart.objects.get_or_create(user=request.user)
    
    product_sku_id = request.data.get('product_sku_id')  # Đổi từ product_variant_id
    quantity = int(request.data.get('quantity', 1))
    
    print("=== CART PUT DEBUG (ADD ITEM) ===")
    print(f"Adding SKU {product_sku_id} with quantity {quantity}")
    
    try:
        product_sku = ProductSKU.objects.get(id=product_sku_id)  # Đổi từ ProductVariant
        
        # Check if item already exists
        cart_item, created = cart.items.get_or_create(
            product_sku=product_sku,  # Đổi từ product_variant
            defaults={'quantity': 0}
        )
        
        # Calculate new quantity
        new_quantity = cart_item.quantity + quantity
        
        print(f"Current quantity: {cart_item.quantity}")
        print(f"Adding quantity: {quantity}")
        print(f"New quantity: {new_quantity}")
        print(f"Stock available: {product_sku.available_quantity}")  # Dùng available_quantity
        
        # Validate stock quantity
        if quantity > 0 and new_quantity > product_sku.available_quantity:  # Dùng available_quantity
            available = product_sku.available_quantity - cart_item.quantity
            if created:
                cart_item.delete()
            return Response({
                "error": f"Không đủ hàng trong kho. Chỉ còn {available} sản phẩm có thể thêm.",
                "available_quantity": available,
                "requested_quantity": quantity
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if created:
            cart_item.quantity = quantity
            if cart_item.quantity <= 0:
                cart_item.delete()
                print("Deleted new item with zero/negative quantity")
            else:
                cart_item.save()
                print(f"Created new item with quantity {cart_item.quantity}")
        else:
            cart_item.quantity = new_quantity
            if cart_item.quantity <= 0:
                print(f"Removing item with quantity {cart_item.quantity}")
                cart_item.delete()
            else:
                cart_item.save()
                print(f"Updated existing item to quantity {cart_item.quantity}")
        
        # Return updated cart
        serializer = CartSerializer(cart, context={'request': request})  # Thêm context
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except ProductSKU.DoesNotExist:  # Đổi từ ProductVariant
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
```

#### Thay đổi trong delete() method:
```python
def delete(self, request):
    """Remove specific item from cart"""
    cart, _ = Cart.objects.get_or_create(user=request.user)
    
    product_sku_id = request.data.get('product_sku_id')  # Đổi từ product_variant_id
    
    print(f"=== CART DELETE DEBUG (REMOVE ITEM) ===")
    print(f"Removing SKU {product_sku_id}")
    
    try:
        cart_item = cart.items.get(product_sku=product_sku_id)  # Đổi từ product_variant
        cart_item.delete()
        print(f"Successfully deleted item")
        
        # Return updated cart
        serializer = CartSerializer(cart, context={'request': request})  # Thêm context
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
```

### 2. OrderCreateView - Cập nhật để dùng ProductSKU

Cần kiểm tra và cập nhật logic checkout để:
- Lấy items từ cart với product_sku
- Tạo OrderItem với product_sku thay vì product_variant
- Cập nhật stock cho từng ProductSKU

### 3. Stock Management Views

Nếu có các views liên quan đến stock management, cần cập nhật:
- Từ ProductVariant sang ProductSKU
- Sử dụng `stock_quantity`, `reserved_quantity`, `available_quantity`
- Sử dụng `is_low_stock`, `need_reorder` properties

### 4. Admin Views

Nếu có admin views cho việc quản lý products:
- Hỗ trợ upload nhiều ảnh cho mỗi variant
- Hỗ trợ tạo nhiều SKUs cho mỗi variant
- Nested creation cho variants > images, SKUs

## Testing Checklist

- [ ] GET /api/cart/ - Hiển thị cart với ProductSKU info
- [ ] PUT /api/cart/ - Thêm item vào cart với product_sku_id
- [ ] DELETE /api/cart/ - Xóa item từ cart với product_sku_id
- [ ] POST /api/orders/ - Tạo order từ cart với ProductSKU
- [ ] GET /api/products/{id}/ - Hiển thị product với variants, images, SKUs
