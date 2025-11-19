# shop/management/commands/refresh_stock_alerts.py
from django.core.management.base import BaseCommand
from shop.models import ProductVariant, StockAlert
from shop.services.stock_service import StockService


class Command(BaseCommand):
    help = 'Refresh all stock alerts - Xóa alerts cũ và tạo lại theo logic mới'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete-resolved',
            action='store_true',
            help='Xóa cả alerts đã resolved',
        )

    def handle(self, *args, **options):
        delete_resolved = options['delete_resolved']
        
        self.stdout.write('🔄 Bắt đầu refresh stock alerts...\n')
        
        # 1. Xóa alerts cũ
        if delete_resolved:
            deleted = StockAlert.objects.all().delete()
            self.stdout.write(f'🗑️  Đã xóa {deleted[0]} alerts (bao gồm cả resolved)')
        else:
            deleted = StockAlert.objects.filter(is_resolved=False).delete()
            self.stdout.write(f'🗑️  Đã xóa {deleted[0]} alerts chưa giải quyết')
        
        # 2. Tạo lại alerts cho tất cả variants
        created_count = 0
        for variant in ProductVariant.objects.select_related('product').all():
            old_count = StockAlert.objects.filter(
                product_variant=variant, 
                is_resolved=False
            ).count()
            
            # Tạo alert mới nếu cần
            StockService.check_and_create_alerts(variant)
            
            new_count = StockAlert.objects.filter(
                product_variant=variant, 
                is_resolved=False
            ).count()
            
            if new_count > old_count:
                created_count += (new_count - old_count)
                available = variant.available_quantity
                self.stdout.write(
                    f'  ⚠️  {variant.product.name} - {variant.size}/{variant.color}: '
                    f'available={available}, minimum={variant.minimum_stock}, '
                    f'reorder={variant.reorder_point}'
                )
        
        self.stdout.write(f'\n✅ Đã tạo {created_count} alerts mới')
        
        # 3. Thống kê
        stats = {
            'out_of_stock': StockAlert.objects.filter(
                alert_type='out_of_stock', 
                is_resolved=False
            ).count(),
            'low_stock': StockAlert.objects.filter(
                alert_type='low_stock', 
                is_resolved=False
            ).count(),
            'reorder_needed': StockAlert.objects.filter(
                alert_type='reorder_needed', 
                is_resolved=False
            ).count(),
        }
        
        self.stdout.write('\n📊 Thống kê alerts hiện tại:')
        self.stdout.write(f'  🔴 Hết hàng: {stats["out_of_stock"]}')
        self.stdout.write(f'  ⚠️  Tồn kho thấp: {stats["low_stock"]}')
        self.stdout.write(f'  📦 Cần đặt hàng: {stats["reorder_needed"]}')
        self.stdout.write(f'  ───────────────')
        self.stdout.write(f'  📍 Tổng: {sum(stats.values())}')
