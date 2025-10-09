# ecommerce1

Một ứng dụng ecommerce hoàn chỉnh được xây dựng với Django (Backend) và React (Frontend).

## 🚀 Công nghệ sử dụng

### Backend
- **Django** - Python web framework
- **Django REST Framework** - API development
- **SQLite** - Database (có thể chuyển sang PostgreSQL cho production)

### Frontend
- **React** - JavaScript UI framework
- **Axios** - HTTP client cho API calls

## 📁 Cấu trúc dự án

```
ecommerce_project/
├── ecommerce_project/          # Django project settings
├── shop/                       # Django app chính
│   ├── models.py              # Database models
│   ├── views.py               # API views
│   ├── serializers.py         # DRF serializers
│   └── urls.py                # URL routing
├── ecommerce-frontend/         # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   └── api/               # API client
│   └── package.json
├── manage.py                  # Django management
└── requirements.txt           # Python dependencies
```

## 🛠️ Cài đặt và chạy

### Backend (Django)

1. Cài đặt dependencies:
```bash
pip install django djangorestframework django-cors-headers
```

2. Chạy migrations:
```bash
python manage.py migrate
```

3. Tạo superuser (tuỳ chọn):
```bash
python manage.py createsuperuser
```

4. Chạy server:
```bash
python manage.py runserver
```

Backend sẽ chạy tại: http://localhost:8000

### Frontend (React)

1. Di chuyển vào thư mục frontend:
```bash
cd ecommerce-frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## 📋 Tính năng

- ✅ Quản lý sản phẩm
- ✅ Giỏ hàng
- ✅ Đặt hàng
- ✅ Xác thực người dùng
- ✅ API RESTful
- ✅ Responsive UI

## 🔧 API Endpoints

- `GET /api/products/` - Lấy danh sách sản phẩm
- `GET /api/products/{id}/` - Chi tiết sản phẩm
- `POST /api/cart/` - Thêm vào giỏ hàng
- `GET /api/cart/` - Xem giỏ hàng
- `POST /api/orders/` - Đặt hàng
- `POST /api/register/` - Đăng ký
- `POST /api/login/` - Đăng nhập

## 👥 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📦 Cài đặt thêm

```bash
npm install date-fns
```
