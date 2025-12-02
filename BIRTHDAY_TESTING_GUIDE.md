# 🧪 HƯỚNG DẪN TEST TÍNH NĂNG SINH NHẬT

## ✅ Backend và Frontend đang chạy

- **Backend**: http://127.0.0.1:8000 ✅
- **Frontend**: http://localhost:3000 ✅

---

## 🎯 Test Case 1: Đăng ký với ngày sinh

### Bước 1: Vào trang đăng ký
```
http://localhost:3000/register
```

### Bước 2: Điền form
- **Username**: test_birthday_user
- **Email**: testbirthday@example.com
- **Họ**: Nguyễn
- **Tên**: Văn Test
- **Ngày sinh**: Chọn ngày sinh của bạn (VD: 18/11/1995) 🎂
- **Số điện thoại**: 0901234567 (tùy chọn)
- **Mật khẩu**: test123456
- **Xác nhận mật khẩu**: test123456
- ✅ Đồng ý điều khoản

### Bước 3: Kiểm tra
- ✅ Form submit thành công
- ✅ Redirect về trang login
- ✅ Message: "Đăng ký thành công!"

---

## 🎯 Test Case 2: Xem voucher sinh nhật

### Đăng nhập với user có sinh nhật hôm nay
```
Username: user_birthday_today
Password: test123456
```

### Vào trang Ví Voucher
```
http://localhost:3000/coupons
```

### Kiểm tra UI:
- ✅ Hiển thị thống kê:
  - Có thể sử dụng: 1
  - Đã sử dụng: 0
  - Đã hết hạn: 0

- ✅ Hiển thị voucher card:
  - 🎂 Icon sinh nhật
  - Tên: "Mã giảm giá sinh nhật"
  - Giảm: **20%** (màu đỏ)
  - Tối đa: 200,000đ
  - Mã: **BIRTHDAY2025** (border xanh dashed)
  - Button copy mã
  - 💰 Đơn tối thiểu: 500,000đ
  - 📅 Thời gian: Từ 18/11/2025 - Đến 03/12/2025
  - ⏰ Còn X ngày (nếu chưa hết hạn)
  - Tag: "Có thể dùng" (màu xanh)

### Test copy mã:
- Click button copy 📋
- ✅ Message: "Đã sao chép mã: BIRTHDAY2025"

---

## 🎯 Test Case 3: Navigation menu

### Kiểm tra menu User (click avatar)
```
Menu dropdown phải có:
- 👤 Thông tin cá nhân
- ❤️ Sản phẩm yêu thích
- 🎁 Ví voucher        ← MỚI!
- 🛒 Đơn hàng của tôi
- ⭐ Đánh giá của tôi
- 🚪 Đăng xuất
```

### Click vào "Ví voucher":
- ✅ Navigate đến /coupons
- ✅ Hiển thị danh sách voucher

---

## 🎯 Test Case 4: Admin - Quản lý Coupon

### Đăng nhập Admin
```
http://127.0.0.1:8000/admin/
Username: admin (hoặc tài khoản admin của bạn)
Password: ********
```

### Vào quản lý Coupon
```
Admin > Coupons
```

### Kiểm tra:
- ✅ Thấy mã BIRTHDAY2025
- ✅ Xem chi tiết:
  - Code: BIRTHDAY2025
  - Name: Mã giảm giá sinh nhật
  - Type: Percentage
  - Occasion: Birthday
  - Discount: 20%
  - Max discount: 200,000
  - Min purchase: 500,000
  - Max uses per user: 1
  - Active: ✅

### Vào User Coupons
```
Admin > User coupons
```

### Kiểm tra:
- ✅ Thấy UserCoupon của user_birthday_today
- ✅ Valid from: 18/11/2025
- ✅ Valid to: 03/12/2025
- ✅ Is used: ❌
- ✅ Notified: ✅

---

## 🎯 Test Case 5: API Testing

### 1. Lấy danh sách voucher
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/coupons/
```

### 2. Filter voucher có thể dùng
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/coupons/?status=available
```

### 3. Áp dụng mã giảm giá
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"coupon_code": "BIRTHDAY2025", "order_amount": 800000}' \
  http://localhost:8000/api/coupons/apply/
```

**Expected Response:**
```json
{
  "success": true,
  "coupon_code": "BIRTHDAY2025",
  "discount_amount": 160000.0,
  "final_amount": 640000.0,
  "message": "Áp dụng mã giảm giá thành công!"
}
```

### 4. Test với đơn hàng < 500,000đ (fail)
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"coupon_code": "BIRTHDAY2025", "order_amount": 300000}' \
  http://localhost:8000/api/coupons/apply/
```

**Expected Response:**
```json
{
  "success": false,
  "errors": {
    "order_amount": "Đơn hàng tối thiểu 500,000đ"
  }
}
```

---

## 🎯 Test Case 6: Management Commands

### Test tạo mã cho user có sinh nhật 5 ngày nữa
```bash
cd d:\eommerce_check\ecommerce_project
python manage.py generate_birthday_coupons --days-before=5
```

**Expected Output:**
```
🎂 Tìm khách hàng có sinh nhật vào 23/11...
  ✅ Tạo mã sinh nhật cho user_birthday_in_5days (...)
============================================================
✨ Hoàn thành!
  • Tạo mới: 1 mã
  • Bỏ qua: 0 mã (đã tồn tại)
  • Tổng: 1 khách hàng
============================================================
```

### Đăng nhập với user này để kiểm tra
```
Username: user_birthday_in_5days
Password: test123456
```

Vào /coupons → ✅ Thấy mã BIRTHDAY2025

---

## 🎯 Test Case 7: Edge Cases

### 1. User không có ngày sinh
- Đăng ký mà không điền ngày sinh
- ✅ Vẫn đăng ký thành công
- ✅ Không nhận mã sinh nhật

### 2. Dùng mã 2 lần
- Áp dụng mã BIRTHDAY2025 lần 1: ✅ Thành công
- Đánh dấu is_used = True
- Áp dụng mã BIRTHDAY2025 lần 2: ❌ "Mã đã được sử dụng"

### 3. Mã hết hạn
- Đợi đến valid_to
- Áp dụng mã: ❌ "Mã đã hết hạn"
- Trong /coupons: Chuyển sang tab "Đã hết hạn"

### 4. User khác dùng mã của user A
- Login với user B
- POST /api/coupons/apply/ với mã của user A
- ❌ "Bạn không có mã sinh nhật này trong ví voucher"

---

## 📊 Database Check

### Kiểm tra User model
```python
python manage.py shell

from shop.models import User
user = User.objects.get(username='user_birthday_today')
print(f"Date of birth: {user.date_of_birth}")
print(f"Phone: {user.phone_number}")
```

### Kiểm tra UserCoupon
```python
from shop.models import UserCoupon
coupons = UserCoupon.objects.filter(user=user)
for c in coupons:
    print(f"Coupon: {c.coupon.code}")
    print(f"Valid: {c.valid_from} - {c.valid_to}")
    print(f"Used: {c.is_used}")
    print(f"Notified: {c.notified}")
```

---

## ✅ Checklist hoàn thành

### Backend
- [x] Migration thành công
- [x] User model có date_of_birth, phone_number
- [x] Coupon model hoạt động
- [x] UserCoupon model hoạt động
- [x] API /api/coupons/ work
- [x] API /api/coupons/apply/ work
- [x] Management commands work
- [x] Django Admin hiển thị đầy đủ

### Frontend
- [x] RegisterPage có DatePicker ngày sinh
- [x] RegisterPage có Input số điện thoại
- [x] CouponsPage hiển thị voucher
- [x] CouponsPage có 3 tabs (Available/Used/Expired)
- [x] Copy mã voucher work
- [x] Navigation menu có link "Ví voucher"
- [x] Route /coupons work

### Commands
- [x] generate_birthday_coupons chạy OK
- [x] notify_birthday_coupons chạy OK
- [x] Test data tạo thành công

---

##  Kết luận

Tính năng mã giảm giá sinh nhật đã hoàn thành! 

### Các bước tiếp theo:
1. ✅ Test tất cả các test cases trên
2. 📧 Tích hợp email (tùy chọn)
3. 🛒 Thêm apply coupon trong Checkout (tùy chọn)
4. ⏰ Setup Cron Job để tự động chạy hàng ngày
5. 📊 Thêm analytics dashboard (tùy chọn)

### Để chạy production:
```bash
# Setup cron job
0 6 * * * cd /path/to/project && python manage.py generate_birthday_coupons
0 6 * * * cd /path/to/project && python manage.py notify_birthday_coupons
```

