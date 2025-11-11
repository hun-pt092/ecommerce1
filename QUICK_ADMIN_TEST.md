# ✅ HƯỚNG DẪN TEST NHANH QUA DJANGO ADMIN

## 🎯 TEST TRONG 5 PHÚT

### ✅ CHUẨN BỊ
1. Start server: `python manage.py runserver`
2. Mở browser: http://localhost:8000/admin/
3. Login: admin / admin123

---

## 📝 TEST 1: XEM STOCK HISTORY CÓ SẴN

### Bước 1: Vào Stock History
```
Menu: Shop → Stock historys
```

### Bước 2: Quan sát
- ✅ Thấy records từ test script
- ✅ Có cột: Variant, Type, Quantity, Order, User, Time
- ✅ Filter sidebar: Transaction type, Order, Created at

### Bước 3: Filter theo Type
- Click **"transaction type"** ở sidebar
- Chọn **"export"** → Xem tất cả exports
- Chọn **"return"** → Xem tất cả returns
- Chọn **"import"** → Xem tất cả imports

### Bước 4: Filter theo Order
- Click **"order"** ở sidebar
- Chọn bất kỳ order nào
- ✅ Sẽ thấy TẤT CẢ stock movements của order đó

**Expected:**
- Mỗi order có ít nhất 1 record (export khi tạo)
- Order đã cancel có 2 records (export + return)

---

## 🛒 TEST 2: TẠO ORDER VÀ XEM STOCK HISTORY

### Bước 1: Check Stock Trước
```
1. Shop → Product variants
2. Chọn variant bất kỳ (ví dụ: áo thun - white/L)
3. Nhớ stock_quantity hiện tại (ví dụ: 117)
```

### Bước 2: Tạo Order Mới
```
1. Shop → Orders
2. Click "ADD ORDER" button (góc trên phải)
3. Điền thông tin:
   - User: Chọn user bất kỳ (không phải admin)
   - Total price: 200000
   - Status: pending
   - Shipping info: Điền tùy ý
4. Scroll xuống "Order items" section
5. Click "Add another Order item"
6. Điền:
   - Product variant: Chọn variant đã check ở bước 1
   - Quantity: 2
   - Price per item: 100000
7. Click SAVE
```

### Bước 3: Verify Stock Giảm
```
1. Quay lại: Shop → Product variants
2. Tìm variant vừa chọn
3. ✅ Stock_quantity đã GIẢM 2 (117 → 115)
```

### Bước 4: Check Stock History
```
1. Shop → Stock historys
2. Refresh page (F5)
3. ✅ Thấy record mới:
   - Transaction type: export
   - Product variant: Variant vừa chọn
   - Quantity: -2
   - Quantity before: 117
   - Quantity after: 115
   - Order: Link đến order vừa tạo
   - Created by: admin
   - Notes: "Order #X - Customer checkout"
```

**Chứng tỏ:** ✅ Stock tự động xuất khi tạo order!

---

## ❌ TEST 3: CANCEL ORDER VÀ VERIFY STOCK TRẢ LẠI

### Bước 1: Cancel Order
```
1. Shop → Orders
2. Click vào order vừa tạo
3. Trong "Status" dropdown → Chọn "cancelled"
4. Click SAVE
```

### Bước 2: Verify Stock Tăng Lại
```
1. Shop → Product variants
2. Tìm variant
3. ✅ Stock_quantity đã TĂNG lại 2 (115 → 117)
```

### Bước 3: Check Stock History
```
1. Shop → Stock historys
2. Filter by Order = order vừa cancel
3. ✅ Thấy 2 records:

   Record 1 (EXPORT - khi tạo):
   - Type: export
   - Quantity: -2
   - Before: 117 → After: 115
   - Notes: "Order #X - Customer checkout"
   
   Record 2 (RETURN - khi cancel):
   - Type: return  
   - Quantity: +2
   - Before: 115 → After: 117
   - Notes: "Order #X cancelled by admin"
```

**Chứng tỏ:** ✅ Stock tự động trả lại khi cancel order!

---

## 📊 TEST 4: XEM STOCK ALERTS

### Bước 1: Vào Stock Alerts
```
Menu: Shop → Stock alerts
```

### Bước 2: Quan sát
- ✅ Có alerts nếu stock < minimum (5)
- ✅ Filter: Alert type, Is resolved

### Bước 3: Tạo Alert (Optional)
```
1. Shop → Product variants
2. Chọn variant bất kỳ
3. Edit: Đặt stock_quantity = 3
4. Save
5. Quay lại Stock alerts
6. ✅ Tự động có alert mới:
   - Type: low_stock
   - Current: 3
   - Threshold: 5
```

### Bước 4: Resolve Alert
```
1. Check ☑ alert vừa tạo
2. Action dropdown → "Mark selected alerts as resolved"
3. Click GO
4. ✅ Alert.is_resolved = True
```

---

## 🔄 TEST 5: TEST ADMIN RETURN ORDER

### Bước 1: Tạo Order Mới (như TEST 2)

### Bước 2: Admin Change Status → "returned"
```
1. Shop → Orders
2. Click order vừa tạo
3. Status → "returned"
4. Save
```

### Bước 3: Verify Stock History
```
1. Stock historys
2. Filter by order
3. ✅ Có 2 records:
   - EXPORT (khi tạo)
   - RETURN (khi admin set returned)
   - Notes: "Order #X returned by admin"
```

**Chứng tỏ:** ✅ Admin return order cũng tự động trả stock!

---

## 📈 TEST 6: XEM TIMELINE CỦA 1 PRODUCT

### Bước 1: Chọn Product Variant
```
1. Shop → Product variants
2. Click vào variant bất kỳ (ví dụ: áo thun - white/L)
3. Nhớ variant ID (ví dụ: #1)
```

### Bước 2: Filter Stock History
```
1. Shop → Stock historys
2. Trong search box, gõ: "áo thun"
3. Hoặc filter by product variant
```

### Bước 3: Quan sát Timeline
- ✅ Thấy TẤT CẢ stock movements:
  - Import (nhập kho)
  - Export (bán hàng)
  - Return (hoàn trả)
  - Adjustment (điều chỉnh)
  - Damaged (hỏng hóc)

**Chứng tỏ:** ✅ Audit trail đầy đủ!

---

## ✅ CHECKLIST

### Functional Tests:
- [ ] Tạo order → Stock giảm + History có record export
- [ ] Cancel order → Stock tăng + History có record return
- [ ] Admin return order → Stock tăng + History có record
- [ ] Stock alerts tự động tạo khi low stock
- [ ] Resolve alerts hoạt động
- [ ] Filter by order trong Stock History hoạt động
- [ ] Filter by transaction type hoạt động

### Data Integrity:
- [ ] Mỗi order export có link order trong history
- [ ] Cancel order có 2 records (export + return)
- [ ] Quantity before/after chính xác
- [ ] User tracking đúng (created_by)
- [ ] Timestamp chính xác

### UI/Admin:
- [ ] Stock History table hiển thị đầy đủ columns
- [ ] Filters hoạt động tốt
- [ ] Stock Alerts có màu sắc rõ ràng
- [ ] Product Variant admin show stock info

---

## 🎯 EXPECTED RESULTS

### Sau khi tạo 1 order:
```
Stock History:
✅ 1 record: export
✅ Link order: #X
✅ Quantity: -2
✅ User: admin
✅ Notes: "Order #X - Customer checkout"

Product Variant:
✅ Stock giảm đúng 2
```

### Sau khi cancel order:
```
Stock History:
✅ 2 records cho order:
   1. export (khi tạo)
   2. return (khi cancel)

Product Variant:
✅ Stock tăng lại đúng 2
```

---

## 🐛 TROUBLESHOOTING

### Không thấy Stock History sau khi tạo order?
**Nguyên nhân:** Views chưa reload
**Giải pháp:** 
1. Stop server (Ctrl+C)
2. Restart: `python manage.py runserver`
3. Tạo order mới

### Stock giảm nhưng không có History?
**Nguyên nhân:** Code chưa dùng StockService
**Giải pháp:** Check xem views.py đã sửa chưa

### Cancel order không trả stock?
**Nguyên nhân:** OrderCancelView chưa update
**Giải pháp:** Verify code trong views.py

---

## 💡 TIPS

1. **Dùng Django Admin filters** - Rất mạnh để query
2. **Mở 2 tabs** - 1 tab Orders, 1 tab Stock History
3. **F5 để refresh** - Sau mỗi action
4. **Check console logs** - Server terminal hiển thị mọi request
5. **Dùng search box** - Tìm theo product name

---

## 🎉 DONE!

Nếu tất cả tests PASS:
- ✅ Integration hoàn chỉnh
- ✅ Audit trail đầy đủ  
- ✅ Data integrity tốt
- ✅ Sẵn sàng production!

**Bắt đầu test ngay!** 🚀

---

**Server:** http://localhost:8000/
**Admin:** http://localhost:8000/admin/
**Stock History:** http://localhost:8000/admin/shop/stockhistory/
