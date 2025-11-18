# Backend API Cập Nhật - Stock Management

## ✅ Đã Hoàn Thành (11/11/2025)

### 1. Thay Đổi Cấu Trúc API

**Trước đây:**
```
POST /api/shop/admin/stock/import/
Body: {
  "variant_id": 123,
  "quantity": 50,
  ...
}
```

**Bây giờ:**
```
POST /api/shop/admin/stock/variants/123/import/
Body: {
  "quantity": 50,
  ...
}
```

➡️ **Lý do:** RESTful hơn, `variant_id` nằm trong URL path thay vì request body

---

## 📋 Danh Sách API Endpoints

### Stock Operations (Quản lý kho)

| Endpoint | Method | Mục đích | Body Parameters |
|----------|--------|----------|----------------|
| `/api/shop/admin/stock/variants/<id>/import/` | POST | Nhập hàng | `quantity`, `cost_per_item`, `reference_number`, `notes` |
| `/api/shop/admin/stock/variants/<id>/adjust/` | POST | Điều chỉnh kho | `new_quantity`, `reason` |
| `/api/shop/admin/stock/variants/<id>/damaged/` | POST | Báo hỏng | `quantity`, `notes` |
| `/api/shop/admin/stock/variants/<id>/return/` | POST | Hoàn trả | `quantity`, `order_id`, `notes` |
| `/api/shop/admin/stock/variants/<id>/history/` | GET | Lịch sử variant | - |
| `/api/shop/admin/products/variants/` | GET | Danh sách variants | `search`, `category`, `brand`, `low_stock`, `out_of_stock` |

### Product Management (Quản lý sản phẩm)

| Endpoint | Method | Mục đích |
|----------|--------|----------|
| `/api/shop/admin/products/` | GET, POST | Danh sách & tạo sản phẩm |
| `/api/shop/admin/products/<id>/` | GET, PUT, PATCH, DELETE | Chi tiết sản phẩm |

> ⚠️ **Quan trọng:** API Product Management **KHÔNG** cho phép thay đổi stock quantity!

---

## 🔧 Chi Tiết Thay Đổi Code

### 1. `shop/urls.py`

**Thêm routes mới:**
```python
# Stock Management URLs
path('admin/stock/variants/<int:variant_id>/import/', AdminStockImportView.as_view(), name='admin-stock-import'),
path('admin/stock/variants/<int:variant_id>/adjust/', AdminStockAdjustView.as_view(), name='admin-stock-adjust'),
path('admin/stock/variants/<int:variant_id>/damaged/', AdminStockDamagedView.as_view(), name='admin-stock-damaged'),
path('admin/stock/variants/<int:variant_id>/return/', AdminStockReturnView.as_view(), name='admin-stock-return'),
path('admin/stock/variants/<int:variant_id>/history/', AdminVariantStockHistoryView.as_view(), name='admin-variant-history'),
path('admin/products/variants/', AdminVariantListView.as_view(), name='admin-variant-list'),
```

### 2. `shop/views.py`

**Cập nhật views cũ (3 views):**
- ✅ `AdminStockImportView`: Nhận `variant_id` từ URL thay vì body
- ✅ `AdminStockAdjustView`: Nhận `variant_id` từ URL thay vì body  
- ✅ `AdminStockDamagedView`: Nhận `variant_id` từ URL thay vì body

**Thêm views mới (3 views):**
- ✅ `AdminStockReturnView`: Xử lý hoàn trả hàng từ khách
- ✅ `AdminVariantStockHistoryView`: Xem lịch sử stock của 1 variant
- ✅ `AdminVariantListView`: Danh sách variants với filters

**Ví dụ thay đổi:**
```python
# TRƯỚC
def post(self, request):
    variant_id = request.data.get('variant_id')
    # ...

# SAU
def post(self, request, variant_id):
    # variant_id đã có sẵn từ URL
    # ...
```

### 3. `shop/serializers.py`

**Bỏ `variant_id` khỏi serializers:**
```python
# TRƯỚC
class StockTransactionSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField(required=True)  ❌
    quantity = serializers.IntegerField(required=True)
    # ...

# SAU
class StockTransactionSerializer(serializers.Serializer):
    # variant_id bỏ đi vì lấy từ URL
    quantity = serializers.IntegerField(required=True)
    # ...
```

---

## 🧪 Test API

### Test Import Stock (Nhập hàng)

```bash
# Variant ID = 1
curl -X POST http://localhost:8000/api/shop/admin/stock/variants/1/import/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100,
    "cost_per_item": 500000,
    "reference_number": "PO-2025-001",
    "notes": "Nhập lô hàng mùa đông"
  }'
```

**Response:**
```json
{
  "message": "Nhập kho thành công: 100 sản phẩm",
  "variant": {
    "id": 1,
    "sku": "AO-M-RED-001",
    "product_name": "Áo khoác mùa đông",
    "size": "M",
    "color": "Đỏ",
    "stock_quantity": 150,
    "reserved_quantity": 10,
    "available_quantity": 140
  }
}
```

### Test Variant List (Danh sách variants)

```bash
# Lọc sản phẩm sắp hết hàng
curl http://localhost:8000/api/shop/admin/products/variants/?low_stock=true \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tìm kiếm theo tên
curl http://localhost:8000/api/shop/admin/products/variants/?search=áo \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lọc theo category
curl http://localhost:8000/api/shop/admin/products/variants/?category=2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Stock History (Lịch sử)

```bash
# Xem lịch sử của variant ID = 5
curl http://localhost:8000/api/shop/admin/stock/variants/5/history/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Models (Không đổi)

Stock tracking vẫn dùng các models hiện có:

- ✅ `ProductVariant`: Chứa `stock_quantity`, `reserved_quantity`
- ✅ `StockHistory`: Ghi nhận mọi giao dịch
- ✅ `StockAlert`: Cảnh báo hết hàng
- ✅ `StockService`: Business logic layer

---

## 🎯 Quy Trình Sử Dụng

### Tạo sản phẩm mới

1. ➡️ **Product Management** → Thêm sản phẩm
2. Nhập thông tin: tên, giá, mô tả, hình ảnh
3. Thêm variants: size, color, SKU
4. ⚠️ **KHÔNG** nhập stock quantity
5. Lưu sản phẩm

### Nhập hàng

1. ➡️ **Inventory Management** → Nhập hàng
2. Chọn variant cần nhập
3. Nhập: số lượng, giá nhập, số PO, ghi chú
4. ✅ Hệ thống tự động:
   - Tăng `stock_quantity`
   - Tạo `StockHistory` (type = IMPORT)
   - Cập nhật giá vốn

### Xuất hàng (Khi khách đặt)

Tự động qua Django signals:
- Order được tạo → `reserved_quantity` tăng
- Order COMPLETED → `stock_quantity` giảm, `reserved_quantity` giảm
- Order CANCELLED → `reserved_quantity` giảm (hàng trả lại available)

### Hoàn trả hàng

1. ➡️ **Inventory Management** → Hoàn trả
2. Chọn variant + nhập số lượng
3. Có thể link với Order ID
4. ✅ Hệ thống tự động tăng `stock_quantity`

---

## 🔒 Phân Quyền

| Tính năng | User Role | Permission |
|-----------|-----------|------------|
| Xem sản phẩm | All | ✅ Public |
| Tạo/sửa sản phẩm | Admin | ✅ IsAdminUser |
| Quản lý kho | Admin | ✅ IsAdminUser |
| Xem lịch sử stock | Admin | ✅ IsAdminUser |

---

## ⚙️ Server Status

✅ **Server đã chạy thành công:**
```
[11/Nov/2025 21:26:10] "GET /admin/shop/product/ HTTP/1.1" 200
[11/Nov/2025 21:26:12] "GET /admin/shop/stockalert/ HTTP/1.1" 200
```

---

## 📝 Files Đã Thay Đổi

1. ✅ `shop/urls.py` - Thêm 6 routes mới
2. ✅ `shop/views.py` - Cập nhật 3 views + thêm 3 views mới
3. ✅ `shop/serializers.py` - Bỏ `variant_id` field
4. ✅ `ecommerce-frontend/src/components/admin/ProductVariantsForm.js` - Bỏ stock fields
5. ✅ `PRODUCT_VS_INVENTORY_GUIDE.md` - Hướng dẫn đầy đủ
6. ✅ `CHANGES_SUMMARY.md` - Tóm tắt thay đổi

---

## 🚀 Bước Tiếp Theo

### Frontend (Chưa làm)

1. **Update API calls trong frontend:**
   - `StockImportModal.js` → POST to `/variants/{id}/import/`
   - `StockAdjustModal.js` → POST to `/variants/{id}/adjust/`
   - Bỏ `variant_id` khỏi request body

2. **Test flows:**
   - Tạo sản phẩm mới (không có stock field)
   - Nhập hàng (stock tăng)
   - Đặt hàng (reserved tăng)
   - Hoàn thành đơn (stock giảm)
   - Hoàn trả (stock tăng lại)

3. **Create new components:**
   - `StockReturnModal.js` (UI cho hoàn trả)
   - `VariantStockHistory.js` (xem lịch sử)
   - `VariantListPage.js` (danh sách variants có filters)

---

## 🆘 Support

Nếu gặp lỗi:

1. Check Django admin: http://localhost:8000/admin/
2. Check API docs: http://localhost:8000/api/schema/swagger-ui/
3. Review logs trong terminal
4. Check PRODUCT_VS_INVENTORY_GUIDE.md

---

**Ngày cập nhật:** 11/11/2025  
**Version:** 1.0  
**Status:** ✅ Backend hoàn thành, Frontend pending
