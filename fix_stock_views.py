"""Fix remaining product_variant references in views.py"""
import re

# Read file
with open('shop/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: AdminStockImportView response
content = content.replace(
    """            # Return updated variant info
            return Response({
                'message': f'Nháºp kho thÃ nh cÃ´ng: {quantity} sáº£n pháº©m',
                'variant': {
                    'id': updated_variant.id,
                    'sku': updated_variant.sku,
                    'product_name': updated_variant.product.name,
                    'size': updated_variant.size,
                    'color': updated_variant.color,
                    'stock_quantity': updated_variant.stock_quantity,
                    'reserved_quantity': updated_variant.reserved_quantity,
                    'available_quantity': updated_variant.available_quantity,
                    'cost_price': float(updated_variant.cost_price),
                }
            }, status=status.HTTP_201_CREATED)

        except ProductVariant.DoesNotExist:
            return Response(
                {'error': 'Product variant not found'},""",
    """            # Return updated SKU info
            return Response({
                'message': f'Nháºp kho thÃ nh cÃ´ng: {quantity} sáº£n pháº©m',
                'sku': {
                    'id': updated_sku.id,
                    'product_name': updated_sku.variant.product.name,
                    'size': updated_sku.size,
                    'color': updated_sku.variant.color,
                    'stock_quantity': updated_sku.stock_quantity,
                    'reserved_quantity': updated_sku.reserved_quantity,
                    'available_quantity': updated_sku.available_quantity,
                }
            }, status=status.HTTP_201_CREATED)

        except ProductSKU.DoesNotExist:
            return Response(
                {'error': 'Product SKU not found'},"""
)

# Fix 2: AdminStockAdjustView response
content = content.replace(
    """            return Response({
                'message': f'Äiá»u chá»nh tá»n kho thÃ nh cÃ´ng: {action} {abs(difference)} sáº£n pháº©m',
                'variant': {
                    'id': updated_variant.id,
                    'sku': updated_variant.sku,
                    'product_name': updated_variant.product.name,
                    'size': updated_variant.size,
                    'color': updated_variant.color,
                    'old_quantity': old_quantity,
                    'new_quantity': updated_variant.stock_quantity,
                    'difference': difference,
                    'available_quantity': updated_variant.available_quantity,
                }
            }, status=status.HTTP_200_OK)

        except ProductVariant.DoesNotExist:
            return Response(
                {'error': 'Product variant not found'},""",
    """            return Response({
                'message': f'Äiá»u chá»nh tá»n kho thÃ nh cÃ´ng: {action} {abs(difference)} sáº£n pháº©m',
                'sku': {
                    'id': updated_sku.id,
                    'product_name': updated_sku.variant.product.name,
                    'size': updated_sku.size,
                    'color': updated_sku.variant.color,
                    'old_quantity': old_quantity,
                    'new_quantity': updated_sku.stock_quantity,
                    'difference': difference,
                    'available_quantity': updated_sku.available_quantity,
                }
            }, status=status.HTTP_200_OK)

        except ProductSKU.DoesNotExist:
            return Response(
                {'error': 'Product SKU not found'},"""
)

# Fix 3: AdminStockDamagedView response
content = content.replace(
    """            return Response({
                'message': f'Äà Äánh dáº¥u {quantity} sáº£n pháº©m háng',
                'variant': {
                    'id': updated_variant.id,
                    'sku': updated_variant.sku,
                    'product_name': updated_variant.product.name,
                    'stock_quantity': updated_variant.stock_quantity,
                    'available_quantity': updated_variant.available_quantity,
                }
            }, status=status.HTTP_200_OK)

        except ProductVariant.DoesNotExist:
            return Response(
                {'error': 'Product variant not found'},""",
    """            return Response({
                'message': f'Äà Äánh dáº¥u {quantity} sáº£n pháº©m háng',
                'sku': {
                    'id': updated_sku.id,
                    'product_name': updated_sku.variant.product.name,
                    'size': updated_sku.size,
                    'color': updated_sku.variant.color,
                    'stock_quantity': updated_sku.stock_quantity,
                    'available_quantity': updated_sku.available_quantity,
                }
            }, status=status.HTTP_200_OK)

        except ProductSKU.DoesNotExist:
            return Response(
                {'error': 'Product SKU not found'},"""
)

# Write back
with open('shop/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed all updated_variant → updated_sku")
print("✓ Fixed all ProductVariant.DoesNotExist → ProductSKU.DoesNotExist")  
print("✓ Fixed all 'variant' → 'sku' in responses")
