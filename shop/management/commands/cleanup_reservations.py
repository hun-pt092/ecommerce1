"""
Management command to cleanup expired stock reservations
Chạy lệnh: python manage.py cleanup_reservations
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from shop.services import StockService


class Command(BaseCommand):
    help = 'Cleanup expired stock reservations (older than 30 minutes)'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Chỉ hiển thị số lượng sẽ xóa, không thực sự xóa',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            # Chỉ đếm số lượng
            from shop.models import CartItem
            expired_count = CartItem.objects.filter(
                is_reserved=True,
                reservation_expires_at__lt=timezone.now()
            ).count()
            
            self.stdout.write(
                self.style.WARNING(
                    f'[DRY RUN] Sẽ giải phóng {expired_count} reservation(s) đã hết hạn'
                )
            )
        else:
            # Thực hiện cleanup
            count = StockService.cleanup_expired_reservations()
            
            if count > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Đã giải phóng {count} reservation(s) đã hết hạn'
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        '✅ Không có reservation nào hết hạn'
                    )
                )
        
        # Hiển thị thống kê
        from shop.models import CartItem
        active_count = CartItem.objects.filter(is_reserved=True).count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n📊 Thống kê:\n'
                f'   - Reservations đang active: {active_count}\n'
                f'   - Đã cleanup: {count if not dry_run else "0 (dry-run)"}'
            )
        )
