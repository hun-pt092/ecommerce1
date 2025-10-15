# Order Management APIs Documentation

## Tổng quan
Hệ thống quản lý đơn hàng đã được triển khai với đầy đủ chức năng CRUD và workflow quản lý đơn hàng.

## Các APIs có sẵn

### 1. Tạo đơn hàng từ giỏ hàng
**POST** `/api/orders/create-from-cart/`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shipping_name": "Nguyễn Văn A",
  "shipping_address": "123 Đường ABC, Quận 1",
  "shipping_city": "TP.HaNoi", 
  "shipping_postal_code": "70000",
  "shipping_country": "Vietnam",
  "phone_number": "0909123456",
  "notes": "Giao hàng buổi sáng",
  "payment_method": "cod"
}
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "total_price": "299.98",
  "status": "pending",
  "payment_status": "pending",
  "shipping_name": "Nguyễn Văn A",
  "shipping_address": "123 Đường ABC, Quận 1",
  "shipping_city": "TP.HaNoi",
  "shipping_postal_code": "70000",
  "shipping_country": "Vietnam",
  "phone_number": "0909123456",
  "notes": "Giao hàng buổi sáng",
  "items": [
    {
      "id": 1,
      "product_variant": {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Product Name"
        },
        "size": "M",
        "color": "Red"
      },
      "quantity": 2,
      "price_per_item": "149.99"
    }
  ],
  "created_at": "2025-09-23T17:54:00Z",
  "updated_at": "2025-09-23T17:54:00Z"
}
```

### 2. Xem danh sách đơn hàng của user
**GET** `/api/orders/my-orders/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "total_price": "299.98",
    "status": "pending",
    "payment_status": "pending",
    "shipping_name": "Nguyễn Văn A",
    "created_at": "2025-09-23T17:54:00Z",
    "total_items": 2
  }
]
```

### 3. Xem chi tiết đơn hàng
**GET** `/api/orders/{order_id}/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** (Giống như response của tạo đơn hàng)

### 4. Cập nhật trạng thái đơn hàng (Admin only)
**PUT** `/api/orders/{order_id}/update-status/`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processing",
  "payment_status": "paid"
}
```

**Response:**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "status": "processing",
    "payment_status": "paid"
  }
}
```

## Trạng thái đơn hàng

### Order Status:
- `pending`: Chờ xử lý
- `processing`: Đang xử lý
- `shipped`: Đã gửi hàng
- `delivered`: Đã giao hàng
- `cancelled`: Đã hủy

### Payment Status:
- `pending`: Chờ thanh toán
- `paid`: Đã thanh toán
- `failed`: Thanh toán thất bại
- `refunded`: Đã hoàn tiền

## Hướng dẫn test APIs

### Bước 1: Chuẩn bị dữ liệu test
1. Đảm bảo có user đã đăng nhập (đã có access_token)
2. Tạo một số sản phẩm và thêm vào giỏ hàng

### Bước 2: Test từng API
Sử dụng Postman hoặc curl để test:

```bash
# Test tạo đơn hàng
curl -X POST http://localhost:8000/api/orders/create-from-cart/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_name": "Test User",
    "shipping_address": "123 Test Street",
    "shipping_city": "Test City",
    "phone_number": "0909123456"
  }'

# Test xem đơn hàng
curl -X GET http://localhost:8000/api/orders/my-orders/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Bước 3: Test trong Django Admin
1. Truy cập http://localhost:8000/admin/
2. Đăng nhập bằng admin account
3. Xem và quản lý orders trong Admin interface