# shop/management/commands/cleanup_data.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from shop.models import Cart, Order

class Command(BaseCommand):
    help = 'Clean up old data like abandoned carts and expired sessions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to keep data (default: 30)',
        )

    def handle(self, *args, **options):
        days = options['days']
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Clean up old abandoned carts (no orders created)
        old_carts = Cart.objects.filter(
            updated_at__lt=cutoff_date,
            user__order__isnull=True
        ).distinct()
        
        cart_count = old_carts.count()
        old_carts.delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully cleaned up {cart_count} abandoned carts older than {days} days'
            )
        )
        
        # Log statistics
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        
        self.stdout.write(f'Total orders: {total_orders}')
        self.stdout.write(f'Pending orders: {pending_orders}')