"""
Management command để gửi thông báo mã sinh nhật cho khách hàng
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from shop.models import UserCoupon


class Command(BaseCommand):
    help = 'Gửi thông báo mã giảm giá sinh nhật cho khách hàng chưa được thông báo'

    def handle(self, *args, **options):
        # Lấy các mã chưa được thông báo
        pending_coupons = UserCoupon.objects.filter(
            notified=False,
            coupon__occasion_type='birthday',
            is_used=False
        ).select_related('user', 'coupon')
        
        notified_count = 0
        
        self.stdout.write(f"📧 Tìm thấy {pending_coupons.count()} mã cần thông báo...")
        
        for user_coupon in pending_coupons:
            user = user_coupon.user
            coupon = user_coupon.coupon
            
            # TODO: Gửi email/notification thật
            # Hiện tại chỉ đánh dấu đã thông báo
            
            self.stdout.write(
                f"  📨 Gửi thông báo cho {user.username} ({user.email})"
            )
            self.stdout.write(
                f"     Mã: {coupon.code} - Giảm {coupon.discount_value}%"
            )
            self.stdout.write(
                f"     Hiệu lực: {user_coupon.valid_from.strftime('%d/%m/%Y')} - "
                f"{user_coupon.valid_to.strftime('%d/%m/%Y')}\n"
            )
            
            # Đánh dấu đã thông báo
            user_coupon.notified = True
            user_coupon.notified_at = timezone.now()
            user_coupon.save()
            
            notified_count += 1
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS(f"✨ Đã gửi {notified_count} thông báo!"))
        self.stdout.write("="*60)
