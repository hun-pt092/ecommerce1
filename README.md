#  PKA Shop E-commerce Platform

Hệ thống thương mại điện tử thời trang hoàn chỉnh với Django REST Framework (Backend) và React (Frontend), bao gồm quản lý sản phẩm, đơn hàng, thanh toán, voucher và phân tích doanh thu.

## 🌟 Tính năng nổi bật

### 👤 Người dùng
- ✅ Đăng ký/đăng nhập với JWT authentication
- ✅ Quản lý profile và địa chỉ giao hàng
- ✅ Lịch sử đơn hàng và theo dõi trạng thái
- ✅ Ví voucher cá nhân với mã giảm giá sinh nhật
- ✅ Wishlist yêu thích
- ✅ Đánh giá và review sản phẩm

### 🛒 Mua sắm
- ✅ Danh mục sản phẩm với bộ lọc nâng cao (giá, thương hiệu, danh mục, tìm kiếm)
- ✅ Chi tiết sản phẩm với biến thể (size, màu sắc)
- ✅ Giỏ hàng thời gian thực với reserved stock
- ✅ Checkout 3 bước (Giỏ hàng → Địa chỉ → Thanh toán)
- ✅ Buy Now (mua nhanh) không làm ảnh hưởng giỏ hàng
- ✅ Áp dụng mã giảm giá với validation

### 💳 Thanh toán
- ✅ COD (Thanh toán khi nhận hàng)
- ✅ Chuyển khoản ngân hàng
- ✅ Ví điện tử MoMo với QR code
- ✅ Miễn phí ship cho đơn ≥ 500k

### 👨‍💼 Admin Dashboard
- ✅ Tổng quan thống kê (doanh thu, đơn hàng, sản phẩm, khách hàng)
- ✅ Quản lý sản phẩm và variants (size, màu, giá, tồn kho)
- ✅ Quản lý đơn hàng với cập nhật trạng thái
- ✅ Quản lý người dùng và coupon
- ✅ Báo cáo tồn kho (sắp hết hàng, cần đặt hàng)
- ✅ Analytics Dashboard:
  - 📊 Doanh thu theo thời gian (biểu đồ area chart)
  - 📈 So sánh tháng này vs tháng trước (bar chart)
  - 🔥 Top sản phẩm bán chạy
  - 💎 Top khách hàng VIP
  - 🏷️ Doanh thu theo danh mục (pie chart)

### 🎫 Hệ thống Voucher
- ✅ Tự động tạo mã sinh nhật cho khách hàng
- ✅ Mã giảm giá theo % hoặc số tiền cố định
- ✅ Điều kiện áp dụng: đơn tối thiểu, giảm tối đa
- ✅ Ví voucher cá nhân với trạng thái sử dụng
- ✅ Tự động validation khi checkout

### 📦 Quản lý Tồn kho
- ✅ Reserved stock khi thêm vào giỏ (tự động release sau 30 phút)
- ✅ Tự động hoàn kho khi hủy đơn (chỉ 1 lần)
- ✅ Báo cáo tồn kho với phân tích:
  - Sản phẩm sắp hết hàng
  - Sản phẩm hết hàng
  - Sản phẩm cần đặt hàng
  - Top sản phẩm giá trị cao

### 🎨 UI/UX
- ✅ Dark mode/Light mode toggle
- ✅ Responsive design (mobile-first)
- ✅ Animation và transitions mượt mà
- ✅ Loading states và error handling
- ✅ Toast notifications (Ant Design Message)

## 🚀 Công nghệ sử dụng

### Backend
- **Python 3.11+**
- **Django 5.2.6** - Web framework
- **Django REST Framework** - RESTful API
- **SQLite** - Database (có thể chuyển PostgreSQL)
- **JWT** - Token-based authentication
- **Django CORS Headers** - Cross-origin requests
- **Pillow** - Image processing

### Frontend
- **React 18.x** - UI Library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Ant Design 5.x** - UI Component library
- **Recharts** - Data visualization
- **date-fns** - Date utilities

## 📁 Cấu trúc dự án

```
ecommerce_project/
├── ecommerce_project/          # Django settings
│   ├── settings.py            # Cấu hình chính
│   ├── urls.py                # Root URL config
│   └── wsgi.py
├── shop/                       # Main Django app
│   ├── models.py              # Database models
│   │   ├── Product, ProductVariant
│   │   ├── Cart, CartItem
│   │   ├── Order, OrderItem
│   │   ├── Coupon, UserCoupon
│   │   ├── Review, Wishlist
│   │   └── ShippingAddress, Brand
│   ├── views.py               # API endpoints
│   ├── serializers.py         # DRF serializers
│   ├── urls.py                # URL routing
│   ├── signals.py             # Django signals (stock management)
│   ├── middleware.py          # Custom middleware
│   └── management/commands/   # Custom commands
│       ├── generate_birthday_coupons.py
│       └── cleanup_reserved_stock.py
├── ecommerce-frontend/         # React app
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navigation.js
│   │   │   ├── ThemeToggle.js
│   │   │   ├── ReviewForm.js
│   │   │   ├── WishlistButton.js
│   │   │   ├── admin/         # Admin components
│   │   │   ├── analytics/     # Chart components
│   │   │   └── checkout/      # Checkout flow
│   │   ├── pages/             # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── ProductDetailPage.js
│   │   │   ├── CartPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── OrderHistoryPage.js
│   │   │   ├── admin/         # Admin pages
│   │   │   └── ...
│   │   ├── api/               # API clients
│   │   │   ├── apiClient.js
│   │   │   ├── AuthAxios.js
│   │   │   └── analyticsApi.js
│   │   ├── contexts/          # React contexts
│   │   │   └── ThemeContext.js
│   │   └── App.js
│   └── package.json
├── media/                      # User uploads
│   ├── products/
│   └── brands/
├── manage.py                  # Django CLI
├── requirements.txt           # Python deps
└── README.md

## 🛠️ Cài đặt và Chạy

### Yêu cầu
- Python 3.11+
- Node.js 16+
- pip và npm

### 1️⃣ Backend Setup (Django)

#### Bước 1: Clone repository
```bash
git clone https://github.com/hun-pt092/ecommerce1.git
cd ecommerce1
```

#### Bước 2: Tạo virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

#### Bước 3: Cài đặt dependencies
```bash
pip install -r requirements.txt
```

**requirements.txt:**
```
Django==5.2.6
djangorestframework
django-cors-headers
Pillow
djangorestframework-simplejwt
```

#### Bước 4: Chạy migrations
```bash
python manage.py migrate
```

#### Bước 5: Tạo superuser
```bash
python manage.py createsuperuser
# Nhập username, email, password
```

#### Bước 6: Tạo dữ liệu mẫu (optional)
```bash
python manage.py shell < setup_data.py
python setup_data.py
```

#### Bước 7: Chạy server
```bash
python manage.py runserver
```
Backend: http://localhost:8000  
Admin: http://localhost:8000/admin

---

### 2️⃣ Frontend Setup (React)

#### Bước 1: Di chuyển vào thư mục frontend
```bash
cd ecommerce-frontend
```

#### Bước 2: Cài đặt dependencies
```bash
npm install
```

**Key packages:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "antd": "^5.x",
    "recharts": "^2.x",
    "date-fns": "^2.x"
  }
}
```

#### Bước 3: Chạy development server
```bash
npm start
```
Frontend: http://localhost:3000

---

### 3️⃣ Cron Jobs & Background Tasks

#### Tự động tạo voucher sinh nhật
```bash
# Chạy hàng ngày lúc 00:00
python manage.py generate_birthday_coupons --days-before=0

# Kiểm tra trước 3 ngày
python manage.py generate_birthday_coupons --days-before=3
```

#### Cleanup reserved stock (hết hạn sau 30 phút)
```bash
python manage.py cleanup_reserved_stock
```

**Setup Windows Task Scheduler:**
```powershell
# Tạo task chạy mỗi ngày lúc 00:00
schtasks /create /tn "Birthday Coupons" /tr "python manage.py generate_birthday_coupons" /sc daily /st 00:00

# Cleanup mỗi 30 phút
schtasks /create /tn "Cleanup Stock" /tr "python manage.py cleanup_reserved_stock" /sc minute /mo 30
```

## 📋 API Documentation

### Authentication
```
POST /api/register/           # Đăng ký
POST /api/login/              # Đăng nhập
POST /api/token/refresh/      # Refresh JWT token
GET  /api/profile/            # Thông tin user
```

### Products
```
GET    /api/products/                    # Danh sách sản phẩm
GET    /api/products/{id}/               # Chi tiết sản phẩm
GET    /api/products/{id}/variants/      # Variants của sản phẩm
GET    /api/categories/                  # Danh mục
GET    /api/brands/                      # Thương hiệu
```

### Cart
```
GET    /api/cart/                        # Giỏ hàng hiện tại
POST   /api/cart/                        # Thêm vào giỏ
PATCH  /api/cart/items/{id}/             # Cập nhật số lượng
DELETE /api/cart/items/{id}/             # Xóa item
POST   /api/cart/clear/                  # Xóa toàn bộ giỏ
```

### Orders
```
POST   /api/orders/create/               # Tạo đơn hàng
GET    /api/orders/                      # Lịch sử đơn hàng
GET    /api/orders/{id}/                 # Chi tiết đơn
POST   /api/orders/{id}/cancel/          # Hủy đơn hàng
```

### Coupons
```
GET    /api/coupons/                     # Voucher khả dụng
POST   /api/coupons/apply/               # Apply voucher
GET    /api/user-coupons/                # Ví voucher cá nhân
```

### Admin
```
GET    /api/admin/orders/                # Quản lý đơn hàng
PATCH  /api/admin/orders/{id}/status/    # Cập nhật trạng thái
GET    /api/admin/products/              # Quản lý sản phẩm
GET    /api/admin/analytics/revenue/     # Phân tích doanh thu
GET    /api/admin/inventory/report/      # Báo cáo tồn kho
```

### Reviews & Wishlist
```
POST   /api/products/{id}/reviews/       # Đánh giá sản phẩm
GET    /api/wishlist/                    # Danh sách yêu thích
POST   /api/wishlist/toggle/             # Thêm/xóa wishlist
```

## 🗄️ Database Schema

### Core Models
```python
User (Django Auth)
├── Profile (extends User)
├── ShippingAddress
├── Order
├── CartItem
├── Review
├── UserCoupon
└── Wishlist

Product
├── ProductVariant (size, color, stock)
├── Brand
├── Category
└── Review

Order
├── OrderItem
├── ShippingAddress
└── Coupon (optional)

Coupon
├── Type: percentage / fixed / free_shipping
├── Occasion: birthday / promotion / seasonal
└── UserCoupon (issued to users)
```

## 🎯 Use Cases & Workflows

### 1. Checkout Flow
```
1. User adds items to cart → Reserved stock (30 min timeout)
2. Proceed to checkout → 3 steps:
   - Cart Summary (review items)
   - Shipping Address (save/select address)
   - Payment (COD/Bank/MoMo + apply coupon)
3. Place order → Stock deducted, cart cleared
4. Order confirmation page
```

### 2. Admin Order Processing
```
1. Order created → Status: pending
2. Admin confirms → Status: processing
3. Admin ships → Status: shipped
4. Delivered → Status: delivered (payment_status: paid)
5. If cancelled → Stock returned automatically
```

### 3. Birthday Voucher System
```
1. Cron job runs daily (00:00)
2. Check users with birthday today
3. Generate UserCoupon (10% off, valid 7 days)
4. User sees voucher in wallet
5. Apply at checkout → Discount calculated
```

## 🔧 Configuration

### Django settings.py
```python
# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Stock reservation timeout
CART_ITEM_EXPIRY_MINUTES = 30
```

### Frontend .env (if needed)
```
REACT_APP_API_URL=http://localhost:8000/api
```

## 🚀 Deployment

### Backend (Django)
```bash
# Production settings
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']

# Use PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ecommerce_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Collect static files
python manage.py collectstatic

# Run with gunicorn
gunicorn ecommerce_project.wsgi:application
```

### Frontend (React)
```bash
# Build for production
npm run build

# Deploy build/ folder to Netlify/Vercel/S3
```

##  Key Business Metrics

### Revenue Calculation
```python
# Only count PAID orders that are NOT cancelled
revenue = Order.objects.filter(
    payment_status='paid'
).exclude(
    status='cancelled'
).aggregate(Sum('total_price'))
```

### Inventory Status
```python
# Available stock = stock_quantity - reserved_quantity
available = stock_quantity - reserved_quantity

# Low stock: 0 < available <= reorder_point
# Out of stock: available == 0
# Need reorder: available <= reorder_point
```

##  Troubleshooting

### Backend không chạy
```bash
# Kiểm tra port 8000
netstat -ano | findstr :8000
# Kill process nếu cần
taskkill /PID <PID> /F
```

### Frontend không kết nối API
- Kiểm tra CORS settings trong Django
- Verify API URL trong frontend
- Check browser console for errors

### Database migration errors
```bash
# Reset migrations (development only!)
python manage.py migrate --fake shop zero
python manage.py migrate shop
```

### Stock không release
```bash
# Chạy manual cleanup
python manage.py cleanup_reserved_stock
```

## 👥 Team & Contributors

- **Backend Developer**: Django REST API, Database Design, Business Logic
- **Frontend Developer**: React UI/UX, State Management, Integration
- **Full-stack**: Authentication, Payment Integration, Admin Dashboard

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/hun-pt092/ecommerce1/issues
- Email: ndhun036@gmail.com

---

**Made with ❤️ using Django + React**
