# shop/signals.py
# Django Signals để tự động xử lý stock khi Order thay đổi trong Admin

from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from .models import Order, OrderItem
from .services.stock_service import StockService
import logging
import time

logger = logging.getLogger(__name__)

# Simple in-memory tracking of recent cancellations
_recent_cancellations = {}
_LOCK_TIMEOUT = 10  # seconds


def _should_process_cancellation(order_id, old_status, new_status):
    """Check if this cancellation should be processed (not a duplicate)"""
    key = f"{order_id}_{old_status}_{new_status}"
    current_time = time.time()
    
    # Clean up old entries
    expired = [k for k, v in list(_recent_cancellations.items()) if current_time - v > _LOCK_TIMEOUT]
    for k in expired:
        _recent_cancellations.pop(k, None)
    
    # Check if this was recently processed
    if key in _recent_cancellations:
        time_since = current_time - _recent_cancellations[key]
        logger.warning(f"⚠️ Duplicate detected: Order #{order_id} {old_status}→{new_status} was processed {time_since:.2f}s ago")
        return False
    
    # Mark as processing
    _recent_cancellations[key] = current_time
    logger.info(f"✓ Lock acquired for Order #{order_id} {old_status}→{new_status}")
    return True


@receiver(pre_save, sender=Order)
def order_status_changed(sender, instance, **kwargs):
    """
    Signal khi Order status thay đổi
    Tự động return stock khi status = cancelled/returned
    """
    logger.info(f"=== SIGNAL PRE_SAVE TRIGGERED for Order #{instance.pk} ===")
    
    if not instance.pk:
        # Order mới, chưa có trong DB
        logger.info("New order, skipping signal")
        return
    
    try:
        # Lấy order cũ từ DB
        old_order = Order.objects.get(pk=instance.pk)
        old_status = old_order.status
        new_status = instance.status
        
        logger.info(f"Old status: {old_status}, New status: {new_status}")
        
        # Nếu status thay đổi sang cancelled hoặc returned
        if new_status in ['cancelled', 'returned'] and old_status not in ['cancelled', 'returned']:
            # Check for duplicate
            if not _should_process_cancellation(instance.id, old_status, new_status):
                return
            
            logger.info(f"✓ Order #{instance.id} status changed from {old_status} to {new_status} - RETURNING STOCK")
            
            # Return stock cho tất cả items
            with transaction.atomic():
                for item in instance.items.all():
                    try:
                        logger.info(f"Returning {item.quantity} x {item.product_variant} (current stock: {item.product_variant.stock_quantity})")
                        StockService.return_stock(
                            product_variant=item.product_variant,
                            quantity=item.quantity,
                            order=instance,
                            user=instance.user,
                            notes=f"Order #{instance.id} {new_status} by admin"
                        )
                        # Refresh để lấy stock mới nhất
                        item.product_variant.refresh_from_db()
                        logger.info(f"✓ Returned {item.quantity} items of {item.product_variant} (new stock: {item.product_variant.stock_quantity})")
                    except Exception as e:
                        logger.error(f"Failed to return stock for order #{instance.id}: {str(e)}")
        else:
            logger.info(f"✗ No stock return needed (status transition: {old_status} → {new_status})")
                        
    except Order.DoesNotExist:
        pass


@receiver(post_save, sender=OrderItem)
def orderitem_created_or_updated(sender, instance, created, **kwargs):
    """
    Signal khi OrderItem được tạo hoặc update
    Tự động export stock khi tạo OrderItem mới từ Admin
    """
    if created:
        # OrderItem mới được tạo
        order = instance.order
        
        # Chỉ export stock nếu order chưa cancelled/returned
        if order.status not in ['cancelled', 'returned']:
            logger.info(f"New OrderItem created for Order #{order.id}")
            
            try:
                # Export stock
                StockService.export_stock(
                    product_variant=instance.product_variant,
                    quantity=instance.quantity,
                    order=order,
                    user=order.user,  # Dùng order owner
                    notes=f"Order #{order.id} - Customer checkout via Admin"
                )
                logger.info(f"Exported {instance.quantity} items of {instance.product_variant}")
            except ValueError as e:
                logger.error(f"Failed to export stock for OrderItem: {str(e)}")
                # Không raise để admin vẫn tạo được OrderItem
                # Nhưng sẽ log lỗi để admin biết
                
    else:
        # OrderItem được update (thay đổi quantity)
        # TODO: Handle quantity change
        pass


@receiver(post_delete, sender=OrderItem)
def orderitem_deleted(sender, instance, **kwargs):
    """
    Signal khi OrderItem bị xóa
    Tự động return stock
    """
    order = instance.order
    
    # Chỉ return stock nếu order chưa cancelled/returned
    if order.status not in ['cancelled', 'returned']:
        logger.info(f"OrderItem deleted from Order #{order.id}")
        
        try:
            # Return stock
            StockService.return_stock(
                product_variant=instance.product_variant,
                quantity=instance.quantity,
                order=order,
                user=order.user,  # Dùng order owner
                notes=f"Order #{order.id} - OrderItem removed via Admin"
            )
            logger.info(f"Returned {instance.quantity} items of {instance.product_variant}")
        except Exception as e:
            logger.error(f"Failed to return stock: {str(e)}")
