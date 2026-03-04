# Testing Guide - ProductSKU Architecture

## 📋 Overview

Hướng dẫn test toàn bộ hệ thống với cấu trúc ProductSKU mới.

---

## 🚀 Quick Start

### 1. Setup Test Data

```bash
# Reset database và tạo migrations
python reset_database.py

# Tạo test data (products, variants, images, SKUs)
python setup_test_data_sku.py
```

**Kết quả:**
- ✓ 3 Products
- ✓ 7 Variants (colors)
- ✓ 20 Images
- ✓ 24 SKUs (sizes với stock)
- ✓ 1 Test user: `testuser / testpass123`

---

### 2. Test Full Flow (Database)

```bash
# Test Cart → Order → Stock flow
python test_full_flow.py
```

**Test này verify:**
- ✅ Tạo cart và add items với ProductSKU
- ✅ Checkout tạo order
- ✅ Stock export tự động (via signals)
- ✅ StockHistory tracking
- ✅ Cancel order
- ✅ Stock return tự động (via signals)

**Kết quả mong đợi:**
```
✓ Cart creation and item addition
✓ Order creation from cart
✓ Stock export on order creation (via signals)
✓ StockHistory tracking
✓ Order cancellation
✓ Stock return on cancellation (via signals)
✓ All stock quantities verified
```

---

### 3. Test API Endpoints

```bash
# Terminal 1: Start server
python manage.py runserver

# Terminal 2: Test APIs
python test_api_endpoints.py
```

**Test này verify:**
- ✅ Authentication (JWT)
- ✅ GET /api/products/ - List với nested data
- ✅ GET /api/products/{id}/ - Detail với variants, images, SKUs
- ✅ GET /api/cart/ - Cart với ProductSKU info
- ✅ PUT /api/cart/ - Add item với `product_sku_id`
- ✅ GET /api/orders/ - Orders với ProductSKU

---

## 📊 Test Data Structure

### Sample Product: "Áo thun Nike Basic"

```json
{
  "id": 1,
  "name": "Áo thun Nike Basic",
  "variants": [
    {
      "id": 1,
      "color": "Black",
      "price": "450000.00",
      "discount_price": "399000.00",
      "images": [
        {"id": 1, "is_primary": true, "order": 0},
        {"id": 2, "is_primary": false, "order": 1},
        {"id": 3, "is_primary": false, "order": 2}
      ],
      "skus": [
        {"id": 1, "size": "S", "stock_quantity": 20, "available_quantity": 20},
        {"id": 2, "size": "M", "stock_quantity": 30, "available_quantity": 30},
        {"id": 3, "size": "L", "stock_quantity": 25, "available_quantity": 25},
        {"id": 4, "size": "XL", "stock_quantity": 15, "available_quantity": 15}
      ]
    },
    {
      "id": 2,
      "color": "White",
      "price": "450000.00",
      "discount_price": "399000.00",
      "images": [...],
      "skus": [...]
    }
  ]
}
```

---

## 🧪 Manual Testing

### Test Cart Flow

```bash
# 1. Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# Save token
TOKEN="your_access_token_here"

# 2. Get Products
curl http://localhost:8000/api/products/ \
  -H "Authorization: Bearer $TOKEN"

# 3. Add to Cart (use SKU ID from products response)
curl -X PUT http://localhost:8000/api/cart/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_sku_id": 1, "quantity": 2}'

# 4. View Cart
curl http://localhost:8000/api/cart/ \
  -H "Authorization: Bearer $TOKEN"

# 5. Checkout
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_name": "Test User",
    "shipping_address": "123 Test St",
    "shipping_city": "HCM",
    "phone_number": "0123456789"
  }'
```

---

## 🔍 Verify Stock Management

### Check Stock Changes in Admin

1. Login to admin: http://localhost:8000/admin/
   - Username: `admin` (hoặc tạo superuser)
   
2. Navigate to:
   - **Shop → Product SKUs** - Xem stock của từng size
   - **Shop → Stock Histories** - Xem lịch sử xuất/nhập kho
   - **Shop → Stock Alerts** - Xem cảnh báo tồn kho
   - **Shop → Orders** - Xem đơn hàng và items

### Check Database

```bash
python manage.py shell
```

```python
from shop.models import ProductSKU, StockHistory, Order

# Check SKU stock
sku = ProductSKU.objects.get(id=1)
print(f"SKU: {sku}")
print(f"Stock: {sku.stock_quantity}")
print(f"Reserved: {sku.reserved_quantity}")
print(f"Available: {sku.available_quantity}")

# Check stock history
for h in StockHistory.objects.filter(product_sku=sku).order_by('-created_at')[:5]:
    print(f"{h.created_at}: {h.get_transaction_type_display()} - Qty: {h.quantity}")
    print(f"  Before: {h.quantity_before} → After: {h.quantity_after}")

# Check order items
order = Order.objects.first()
for item in order.items.all():
    print(f"{item.product_sku} - Qty: {item.quantity}")
```

---

## ✅ Test Checklist

### Backend Tests

- [ ] **Models**
  - [ ] ProductVariant với color, price
  - [ ] ProductVariantImage với multiple images
  - [ ] ProductSKU với size, stock
  - [ ] CartItem dùng ProductSKU
  - [ ] OrderItem dùng ProductSKU

- [ ] **Serializers**
  - [ ] Nested variants, images, SKUs
  - [ ] ProductSKU trong cart items
  - [ ] ProductSKU trong order items

- [ ] **APIs**
  - [ ] GET /api/products/ - List products
  - [ ] GET /api/products/{id}/ - Product detail
  - [ ] PUT /api/cart/ - Add with product_sku_id
  - [ ] GET /api/cart/ - View cart
  - [ ] POST /api/orders/ - Checkout
  - [ ] GET /api/orders/ - List orders

- [ ] **Stock Management**
  - [ ] Export stock khi tạo order
  - [ ] Return stock khi cancel order
  - [ ] StockHistory tracking
  - [ ] StockAlert khi low stock

- [ ] **Signals**
  - [ ] OrderItem created → export stock
  - [ ] Order cancelled → return stock
  - [ ] OrderItem deleted → return stock

### Frontend Tests (TODO)

- [ ] ProductDetailPage - Chọn color & size
- [ ] CartPage - Hiển thị ProductSKU info
- [ ] Checkout - Tạo order với ProductSKU
- [ ] Admin - Upload multiple images
- [ ] Admin - Manage SKUs per variant

---

## 🐛 Common Issues

### Issue: "product_sku_id field required"
**Solution:** Frontend cần dùng `product_sku_id` thay vì `product_variant_id`

### Issue: Stock không giảm khi order
**Solution:** Kiểm tra signals đã được connect chưa (check `shop/apps.py`)

### Issue: Images không hiển thị
**Solution:** 
1. Check MEDIA_URL và MEDIA_ROOT trong settings
2. Serve static files: `python manage.py runserver`
3. Check image paths trong response

---

## 📝 Next Steps

1. ✅ Backend migration complete
2. ✅ Test data created
3. ✅ Full flow tested
4. ⏳ Update frontend to use new structure
5. ⏳ Deploy and test in production

---

## 🔗 Related Files

- `setup_test_data_sku.py` - Tạo test data
- `test_full_flow.py` - Test database flow
- `test_api_endpoints.py` - Test API endpoints
- `BACKEND_MIGRATION_COMPLETE.md` - Migration summary
