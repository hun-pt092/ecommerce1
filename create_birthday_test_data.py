"""
Script tạo dữ liệu mẫu cho tính năng sinh nhật
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta, date
from shop.models import User, Coupon

# Tạo user có sinh nhật trong 15 ngày tới
today = date.today()

test_users = [
    {
        'username': 'user_birthday_today',
        'email': 'birthday_today@test.com',
        'password': 'test123456',
        'date_of_birth': today.replace(year=1995),  # Sinh nhật hôm nay
        'phone_number': '0901234567'
    },
    {
        'username': 'user_birthday_in_5days',
        'email': 'birthday_5days@test.com',
        'password': 'test123456',
        'date_of_birth': (today + timedelta(days=5)).replace(year=1990),  # Sinh nhật 5 ngày nữa
        'phone_number': '0901234568'
    },
    {
        'username': 'user_birthday_in_10days',
        'email': 'birthday_10days@test.com',
        'password': 'test123456',
        'date_of_birth': (today + timedelta(days=10)).replace(year=1992),  # Sinh nhật 10 ngày nữa
        'phone_number': '0901234569'
    },
]

print("🎂 Tạo user mẫu có sinh nhật...")
for user_data in test_users:
    username = user_data.pop('username')
    email = user_data.pop('email')
    password = user_data.pop('password')
    
    if User.objects.filter(username=username).exists():
        print(f"  ⚠ User {username} đã tồn tại, bỏ qua")
        continue
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        **user_data
    )
    
    birthday = user.date_of_birth.strftime('%d/%m')
    print(f"  ✅ Tạo user: {username} - Sinh nhật: {birthday}")

# Tạo coupon template nếu chưa có
print("\n🎁 Tạo mã giảm giá sinh nhật template...")
coupon, created = Coupon.objects.get_or_create(
    code='BIRTHDAY2025',
    defaults={
        'name': 'Mã giảm giá sinh nhật',
        'description': 'Giảm 20% (tối đa 200,000đ) cho đơn hàng từ 500,000đ. Chúc mừng sinh nhật! 🎉',
        'coupon_type': 'percentage',
        'occasion_type': 'birthday',
        'discount_value': 20,
        'max_discount_amount': 200000,
        'min_purchase_amount': 500000,
        'max_uses_per_user': 1,
        'is_active': True,
        'is_public': False,
    }
)

if created:
    print("  ✅ Đã tạo mã BIRTHDAY2025")
else:
    print("  ⚠ Mã BIRTHDAY2025 đã tồn tại")

print("\n" + "="*60)
print("✨ Hoàn thành!")
print("="*60)
print("\n📝 Tiếp theo:")
print("  1. Chạy: python manage.py generate_birthday_coupons")
print("  2. Chạy: python manage.py notify_birthday_coupons")
print("  3. Login với:")
print("     - user_birthday_today / test123456")
print("     - user_birthday_in_5days / test123456")
print("     - user_birthday_in_10days / test123456")
