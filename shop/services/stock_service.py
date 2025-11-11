"""
Stock Management Service
Xử lý các tác vụ liên quan đến kho hàng
"""

from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Count, F, Q
from ..models import ProductVariant, StockHistory, StockAlert


class StockService:
    """Service xử lý các tác vụ liên quan đến kho hàng"""
    
    @staticmethod
    @transaction.atomic
    def import_stock(product_variant, quantity, cost_per_item=None, reference_number='', notes='', user=None):
        """
        Nhập kho
        
        Args:
            product_variant: ProductVariant object
            quantity: Số lượng nhập (phải > 0)
            cost_per_item: Giá vốn mỗi sản phẩm
            reference_number: Mã phiếu nhập
            notes: Ghi chú
            user: User thực hiện
            
        Returns:
            ProductVariant object đã được cập nhật
        """
        if quantity <= 0:
            raise ValueError("Số lượng nhập phải lớn hơn 0")
        
        # Update stock
        old_quantity = product_variant.stock_quantity
        product_variant.stock_quantity += quantity
        
        # Update cost price if provided
        if cost_per_item is not None and cost_per_item > 0:
            product_variant.cost_price = cost_per_item
        
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='import',
            quantity=quantity,
            quantity_before=old_quantity,
            quantity_after=product_variant.stock_quantity,
            reference_number=reference_number,
            cost_per_item=cost_per_item,
            notes=notes,
            created_by=user
        )
        
        # Resolve alerts if stock is back to normal
        if product_variant.stock_quantity > product_variant.minimum_stock:
            StockAlert.objects.filter(
                product_variant=product_variant,
                is_resolved=False
            ).update(
                is_resolved=True,
                resolved_at=timezone.now(),
                resolved_by=user
            )
        
        return product_variant
    
    @staticmethod
    @transaction.atomic
    def export_stock(product_variant, quantity, order=None, notes='', user=None):
        """
        Xuất kho (khi bán hàng)
        
        Args:
            product_variant: ProductVariant object
            quantity: Số lượng xuất (phải > 0)
            order: Order liên quan (nếu có)
            notes: Ghi chú
            user: User thực hiện
            
        Returns:
            ProductVariant object đã được cập nhật
        """
        if quantity <= 0:
            raise ValueError("Số lượng xuất phải lớn hơn 0")
        
        if product_variant.available_quantity < quantity:
            raise ValueError(
                f"Không đủ hàng trong kho. Có thể bán: {product_variant.available_quantity}, "
                f"Yêu cầu: {quantity}"
            )
        
        # Update stock
        old_quantity = product_variant.stock_quantity
        product_variant.stock_quantity -= quantity
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='export',
            quantity=-quantity,  # Negative for export
            quantity_before=old_quantity,
            quantity_after=product_variant.stock_quantity,
            order=order,
            notes=notes,
            created_by=user
        )
        
        # Check and create alerts
        StockService.check_and_create_alerts(product_variant)
        
        return product_variant
    
    @staticmethod
    @transaction.atomic
    def return_stock(product_variant, quantity, order=None, notes='', user=None):
        """
        Hoàn trả hàng
        
        Args:
            product_variant: ProductVariant object
            quantity: Số lượng hoàn trả (phải > 0)
            order: Order liên quan
            notes: Ghi chú
            user: User thực hiện
            
        Returns:
            ProductVariant object đã được cập nhật
        """
        if quantity <= 0:
            raise ValueError("Số lượng hoàn trả phải lớn hơn 0")
        
        # Update stock
        old_quantity = product_variant.stock_quantity
        product_variant.stock_quantity += quantity
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='return',
            quantity=quantity,
            quantity_before=old_quantity,
            quantity_after=product_variant.stock_quantity,
            order=order,
            notes=notes,
            created_by=user
        )
        
        # Resolve alerts if stock is back to normal
        if product_variant.stock_quantity > product_variant.minimum_stock:
            StockAlert.objects.filter(
                product_variant=product_variant,
                is_resolved=False
            ).update(
                is_resolved=True,
                resolved_at=timezone.now(),
                resolved_by=user
            )
        
        return product_variant
    
    @staticmethod
    @transaction.atomic
    def adjust_stock(product_variant, new_quantity, reason='', user=None):
        """
        Điều chỉnh tồn kho (kiểm kê, hàng hỏng...)
        
        Args:
            product_variant: ProductVariant object
            new_quantity: Số lượng mới (phải >= 0)
            reason: Lý do điều chỉnh
            user: User thực hiện
            
        Returns:
            ProductVariant object đã được cập nhật
        """
        if new_quantity < 0:
            raise ValueError("Số lượng mới không thể âm")
        
        old_quantity = product_variant.stock_quantity
        difference = new_quantity - old_quantity
        
        product_variant.stock_quantity = new_quantity
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='adjustment',
            quantity=difference,
            quantity_before=old_quantity,
            quantity_after=new_quantity,
            notes=reason,
            created_by=user
        )
        
        # Check and create alerts
        StockService.check_and_create_alerts(product_variant)
        
        return product_variant
    
    @staticmethod
    @transaction.atomic
    def mark_damaged(product_variant, quantity, reason='', user=None):
        """
        Đánh dấu hàng hỏng
        
        Args:
            product_variant: ProductVariant object
            quantity: Số lượng hàng hỏng (phải > 0)
            reason: Lý do
            user: User thực hiện
            
        Returns:
            ProductVariant object đã được cập nhật
        """
        if quantity <= 0:
            raise ValueError("Số lượng hàng hỏng phải lớn hơn 0")
        
        if product_variant.stock_quantity < quantity:
            raise ValueError(
                f"Số lượng hàng hỏng vượt quá tồn kho. Tồn kho hiện tại: {product_variant.stock_quantity}"
            )
        
        # Update stock
        old_quantity = product_variant.stock_quantity
        product_variant.stock_quantity -= quantity
        product_variant.save()
        
        # Create history record
        StockHistory.objects.create(
            product_variant=product_variant,
            transaction_type='damaged',
            quantity=-quantity,
            quantity_before=old_quantity,
            quantity_after=product_variant.stock_quantity,
            notes=reason,
            created_by=user
        )
        
        # Check and create alerts
        StockService.check_and_create_alerts(product_variant)
        
        return product_variant
    
    @staticmethod
    def check_and_create_alerts(product_variant):
        """
        Kiểm tra và tạo cảnh báo tồn kho
        
        Args:
            product_variant: ProductVariant object
        """
        available = product_variant.available_quantity
        
        # Out of stock alert
        if available == 0:
            StockAlert.objects.get_or_create(
                product_variant=product_variant,
                alert_type='out_of_stock',
                is_resolved=False,
                defaults={
                    'current_quantity': available,
                    'threshold': 0
                }
            )
        # Low stock alert
        elif available <= product_variant.minimum_stock:
            StockAlert.objects.get_or_create(
                product_variant=product_variant,
                alert_type='low_stock',
                is_resolved=False,
                defaults={
                    'current_quantity': available,
                    'threshold': product_variant.minimum_stock
                }
            )
        # Reorder needed alert
        elif available <= product_variant.reorder_point:
            StockAlert.objects.get_or_create(
                product_variant=product_variant,
                alert_type='reorder_needed',
                is_resolved=False,
                defaults={
                    'current_quantity': available,
                    'threshold': product_variant.reorder_point
                }
            )
    
    @staticmethod
    def resolve_alerts(product_variant, user=None):
        """
        Giải quyết tất cả alerts của một variant
        
        Args:
            product_variant: ProductVariant object
            user: User thực hiện
        """
        StockAlert.objects.filter(
            product_variant=product_variant,
            is_resolved=False
        ).update(
            is_resolved=True,
            resolved_at=timezone.now(),
            resolved_by=user
        )
    
    @staticmethod
    def get_inventory_report(filters=None):
        """
        Tạo báo cáo tồn kho
        
        Args:
            filters: Dict chứa các filter (category, brand, low_stock, out_of_stock, etc.)
            
        Returns:
            Dict chứa thông tin báo cáo
        """
        # Base queryset
        variants = ProductVariant.objects.select_related('product', 'product__category', 'product__brand').annotate(
            available=F('stock_quantity') - F('reserved_quantity'),
            total_value=F('stock_quantity') * F('cost_price')
        )
        
        # Apply filters
        if filters:
            if 'category' in filters:
                variants = variants.filter(product__category_id=filters['category'])
            
            if 'brand' in filters:
                variants = variants.filter(product__brand_id=filters['brand'])
            
            if filters.get('low_stock'):
                variants = variants.filter(stock_quantity__lte=F('minimum_stock'))
            
            if filters.get('out_of_stock'):
                variants = variants.filter(stock_quantity=0)
            
            if filters.get('need_reorder'):
                variants = variants.filter(stock_quantity__lte=F('reorder_point'))
        
        # Calculate statistics
        total_variants = variants.count()
        total_stock_value = variants.aggregate(total=Sum('total_value'))['total'] or 0
        total_stock_quantity = variants.aggregate(total=Sum('stock_quantity'))['total'] or 0
        total_reserved_quantity = variants.aggregate(total=Sum('reserved_quantity'))['total'] or 0
        
        low_stock_items = variants.filter(stock_quantity__lte=F('minimum_stock')).count()
        out_of_stock_items = variants.filter(stock_quantity=0).count()
        need_reorder_items = variants.filter(stock_quantity__lte=F('reorder_point')).count()
        
        report = {
            'summary': {
                'total_variants': total_variants,
                'total_stock_quantity': total_stock_quantity,
                'total_reserved_quantity': total_reserved_quantity,
                'total_available_quantity': total_stock_quantity - total_reserved_quantity,
                'total_stock_value': float(total_stock_value),
                'low_stock_items': low_stock_items,
                'out_of_stock_items': out_of_stock_items,
                'need_reorder_items': need_reorder_items,
            },
            'variants': variants
        }
        
        return report
    
    @staticmethod
    def get_variant_stock_history(product_variant, limit=50):
        """
        Lấy lịch sử stock của một variant
        
        Args:
            product_variant: ProductVariant object
            limit: Số lượng record tối đa
            
        Returns:
            QuerySet of StockHistory
        """
        return StockHistory.objects.filter(
            product_variant=product_variant
        ).select_related('created_by', 'order')[:limit]
    
    @staticmethod
    def cleanup_expired_reservations():
        """
        Dọn dẹp các reservation đã hết hạn
        Chạy định kỳ bằng celery hoặc cron job
        """
        from ..models import CartItem
        
        expired_items = CartItem.objects.filter(
            is_reserved=True,
            reservation_expires_at__lt=timezone.now()
        )
        
        count = 0
        for item in expired_items:
            item.release_reservation()
            count += 1
        
        return count
