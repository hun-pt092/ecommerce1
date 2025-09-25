import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from shop.models import User

# Set admin user
try:
    admin_user = User.objects.get(username='admin')
    admin_user.is_admin = True
    admin_user.save()
    print(f"✅ User '{admin_user.username}' đã được set làm admin!")
    print(f"   - is_admin: {admin_user.is_admin}")
    print(f"   - is_superuser: {admin_user.is_superuser}")
except User.DoesNotExist:
    print("❌ User 'admin' không tồn tại!")
    print("Tạo user admin mới...")
    
    admin_user = User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='admin12',
        is_admin=True,
        is_superuser=True
    )
    print(f"✅ Đã tạo user admin: {admin_user.username}")

print("\n🎯 Bây giờ bạn có thể:")
print("1. Khởi động server: python manage.py runserver")
print("2. Truy cập: http://localhost:3000/admin")
print("3. Đăng nhập: admin / admin12")
print("4. Test upload ảnh sản phẩm")