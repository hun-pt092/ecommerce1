"""
Management command để tự động tạo mã giảm giá sinh nhật cho khách hàng
Chạy hàng ngày qua cron job: python manage.py generate_birthday_coupons
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from shop.models import User, Coupon, UserCoupon


class Command(BaseCommand):
    help = 'Tự động tạo mã giảm giá sinh nhật cho khách hàng (15 ngày trước sinh nhật)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-before',
            type=int,
            default=15,
            help='Số ngày trước sinh nhật để tạo mã (mặc định: 15)',
        )
        parser.add_argument(
            '--discount-percent',
            type=int,
            default=20,
            help='Phần trăm giảm giá (mặc định: 20%)',
        )
        parser.add_argument(
            '--max-discount',
            type=int,
            default=200000,
            help='Giảm tối đa (mặc định: 200,000đ)',
        )
        parser.add_argument(
            '--min-purchase',
            type=int,
            default=500000,
            help='Đơn hàng tối thiểu (mặc định: 500,000đ)',
        )
        parser.add_argument(
            '--validity-days',
            type=int,
            default=15,
            help='Số ngày có hiệu lực (mặc định: 15)',
        )

    def handle(self, *args, **options):
        days_before = options['days_before']
        discount_percent = options['discount_percent']
        max_discount = options['max_discount']
        min_purchase = options['min_purchase']
        validity_days = options['validity_days']
        
        today = timezone.now().date()
        target_birthday = today + timedelta(days=days_before)
        
        self.stdout.write(f"🎂 Tìm khách hàng có sinh nhật vào {target_birthday.strftime('%d/%m')}...")
        
        # Tìm khách hàng có sinh nhật vào ngày target (bỏ qua năm)
        users_with_birthday = User.objects.filter(
            date_of_birth__month=target_birthday.month,
            date_of_birth__day=target_birthday.day,
            is_active=True
        )
        
        created_count = 0
        skipped_count = 0
        
        for user in users_with_birthday:
            # Kiểm tra xem đã có mã sinh nhật năm nay chưa
            current_year = today.year
            valid_from = timezone.make_aware(
                timezone.datetime.combine(today, timezone.datetime.min.time())
            )
            valid_to = valid_from + timedelta(days=validity_days)
            
            # Check xem user đã có mã năm nay chưa
            existing = UserCoupon.objects.filter(
                user=user,
                coupon__occasion_type='birthday',
                valid_from__year=current_year
            ).exists()
            
            if existing:
                self.stdout.write(self.style.WARNING(
                    f"  ⚠ {user.username} đã có mã sinh nhật năm {current_year}"
                ))
                skipped_count += 1
                continue
            
            # Tạo hoặc lấy coupon sinh nhật template
            coupon, _ = Coupon.objects.get_or_create(
                code='BIRTHDAY2025',
                defaults={
                    'name': 'Mã giảm giá sinh nhật',
                    'description': f'Giảm {discount_percent}% (tối đa {max_discount:,}đ) cho đơn hàng từ {min_purchase:,}đ. Chúc mừng sinh nhật! 🎉',
                    'coupon_type': 'percentage',
                    'occasion_type': 'birthday',
                    'discount_value': discount_percent,
                    'max_discount_amount': max_discount,
                    'min_purchase_amount': min_purchase,
                    'max_uses_per_user': 1,
                    'is_active': True,
                    'is_public': False,  # Không công khai, chỉ gửi cho user
                }
            )
            
            # Tạo UserCoupon cho user
            user_coupon = UserCoupon.objects.create(
                user=user,
                coupon=coupon,
                valid_from=valid_from,
                valid_to=valid_to,
                notified=False  # Sẽ gửi thông báo sau
            )
            
            self.stdout.write(self.style.SUCCESS(
                f"  ✅ Tạo mã sinh nhật cho {user.username} ({user.email}) - "
                f"Hiệu lực: {valid_from.strftime('%d/%m/%Y')} - {valid_to.strftime('%d/%m/%Y')}"
            ))
            created_count += 1
        
        # Summary
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS(f"✨ Hoàn thành!"))
        self.stdout.write(f"  • Tạo mới: {created_count} mã")
        self.stdout.write(f"  • Bỏ qua: {skipped_count} mã (đã tồn tại)")
        self.stdout.write(f"  • Tổng: {users_with_birthday.count()} khách hàng")
        self.stdout.write("="*60)
        
        # Thông báo cho user (có thể thêm logic gửi email/notification)
        if created_count > 0:
            self.stdout.write("\n💡 Tiếp theo:")
            self.stdout.write("  1. Chạy command gửi thông báo: python manage.py notify_birthday_coupons")
            self.stdout.write("  2. Hoặc user sẽ thấy mã trong 'Ví voucher' khi đăng nhập")
