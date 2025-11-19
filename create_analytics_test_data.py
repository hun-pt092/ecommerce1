"""
Tạo dữ liệu test cho Analytics Dashboard
Tạo thêm orders để có đủ các VIP tiers và dữ liệu đẹp
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from shop.models import Product, ProductVariant, Order, OrderItem
from decimal import Decimal
from datetime import datetime, timedelta
import random

User = get_user_model()

def create_test_users_and_orders():
    """Tạo users với các mức chi tiêu khác nhau để test VIP tiers"""
    
    print("🚀 Bắt đầu tạo dữ liệu test cho Analytics...")
    
    # Lấy products có sẵn
    products = list(Product.objects.filter(is_active=True))
    if not products:
        print("❌ Không có sản phẩm nào! Chạy create_fashion_data.py trước")
        return
    
    print(f"✅ Tìm thấy {len(products)} sản phẩm")
    
    # Tạo các test users với mức chi tiêu khác nhau
    test_users = [
        # Diamond tier: ≥50M
        {"username": "vip_diamond", "email": "diamond@test.com", "total_spend": 55_000_000, "orders": 15},
        
        # Platinum tier: ≥20M
        {"username": "vip_platinum1", "email": "platinum1@test.com", "total_spend": 25_000_000, "orders": 10},
        {"username": "vip_platinum2", "email": "platinum2@test.com", "total_spend": 22_000_000, "orders": 8},
        
        # Gold tier: ≥10M
        {"username": "vip_gold1", "email": "gold1@test.com", "total_spend": 15_000_000, "orders": 7},
        {"username": "vip_gold2", "email": "gold2@test.com", "total_spend": 12_000_000, "orders": 6},
        {"username": "vip_gold3", "email": "gold3@test.com", "total_spend": 10_500_000, "orders": 5},
        
        # Silver tier: ≥5M
        {"username": "vip_silver1", "email": "silver1@test.com", "total_spend": 8_000_000, "orders": 5},
        {"username": "vip_silver2", "email": "silver2@test.com", "total_spend": 6_500_000, "orders": 4},
        {"username": "vip_silver3", "email": "silver3@test.com", "total_spend": 5_200_000, "orders": 3},
        
        # Bronze tier: ≥2M
        {"username": "vip_bronze1", "email": "bronze1@test.com", "total_spend": 3_500_000, "orders": 3},
        {"username": "vip_bronze2", "email": "bronze2@test.com", "total_spend": 2_800_000, "orders": 2},
        {"username": "vip_bronze3", "email": "bronze3@test.com", "total_spend": 2_100_000, "orders": 2},
    ]
    
    created_count = 0
    
    for user_data in test_users:
        # Tạo hoặc lấy user
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['username'].replace('vip_', '').title(),
            }
        )
        
        if created:
            user.set_password('test123')
            user.save()
            print(f"✅ Tạo user: {user.username}")
        else:
            print(f"ℹ️  User đã tồn tại: {user.username}")
        
        # Xóa orders cũ của user này (nếu có)
        Order.objects.filter(user=user).delete()
        
        # Tạo orders cho user
        num_orders = user_data['orders']
        total_spend = user_data['total_spend']
        avg_order = total_spend / num_orders
        
        # Tạo orders trong 60 ngày gần đây
        for i in range(num_orders):
            # Random ngày trong 60 ngày qua
            days_ago = random.randint(0, 60)
            order_date = datetime.now() - timedelta(days=days_ago)
            
            # Tính giá trị order (dao động ±30% quanh giá trị trung bình)
            variation = random.uniform(0.7, 1.3)
            order_value = int(avg_order * variation)
            
            # Tạo order
            order = Order.objects.create(
                user=user,
                total_price=Decimal(order_value),
                shipping_name=user.username,
                shipping_address=f"Test Address {i+1}",
                shipping_city="Test City",
                shipping_postal_code="10000",
                phone_number="0123456789",
                payment_status='paid',
                status='delivered',
                notes=f"Test order for analytics - {user.username}"
            )
            order.created_at = order_date
            order.updated_at = order_date
            order.save()
            
            # Thêm 1-3 items vào order
            num_items = random.randint(1, 3)
            remaining_value = order_value
            
            for item_idx in range(num_items):
                product = random.choice(products)
                variant = product.variants.first()
                
                if not variant:
                    continue
                
                # Chia giá trị order cho các items
                if item_idx == num_items - 1:
                    # Item cuối lấy hết phần còn lại
                    item_price = remaining_value
                else:
                    # Item giữa lấy random 20-50% còn lại
                    item_price = int(remaining_value * random.uniform(0.2, 0.5))
                
                quantity = random.randint(1, 2)
                unit_price = int(item_price / quantity)
                
                OrderItem.objects.create(
                    order=order,
                    product_variant=variant,
                    quantity=quantity,
                    price_per_item=Decimal(unit_price)
                )
                
                remaining_value -= item_price
            
            created_count += 1
    
    print(f"\n🎉 HOÀN THÀNH!")
    print(f"✅ Tạo {len(test_users)} users VIP")
    print(f"✅ Tạo {created_count} orders")
    print(f"\n📊 Phân bổ VIP Tiers:")
    print(f"   💎 Diamond: 1 user (≥50M)")
    print(f"   🏆 Platinum: 2 users (≥20M)")
    print(f"   🥇 Gold: 3 users (≥10M)")
    print(f"   🥈 Silver: 3 users (≥5M)")
    print(f"   🥉 Bronze: 3 users (≥2M)")
    print(f"\n🔥 Chạy lại: python test_analytics.py để xem kết quả!")

if __name__ == "__main__":
    create_test_users_and_orders()
