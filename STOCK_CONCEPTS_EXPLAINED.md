# Giải Thích Các Khái Niệm Quản Lý Tồn Kho

## 📊 Các Chỉ Số Tồn Kho

### 1. **Tồn kho (Stock Quantity)**
- **Là gì:** Tổng số lượng hàng thực tế có trong kho
- **Ví dụ:** Có 100 chiếc áo trong kho
- **Thay đổi khi:**
  - ✅ Nhập hàng (+)
  - ✅ Điều chỉnh kho (+/-)
  - ✅ Đánh dấu hỏng (-)
  - ✅ Hoàn tất đơn hàng (-)

### 2. **Đang giữ (Reserved Quantity)**
- **Là gì:** Số lượng đang được "giữ" cho các đơn hàng chưa hoàn thành
- **Ví dụ:** 
  - Khách A đặt 2 chiếc → Reserved +2
  - Khách B đặt 3 chiếc → Reserved +3
  - Tổng đang giữ: 5 chiếc
- **Thay đổi khi:**
  - ✅ Tạo đơn hàng mới → Reserved tăng
  - ✅ Hoàn thành đơn hàng → Reserved giảm, Stock giảm
  - ✅ Hủy đơn hàng → Reserved giảm
- **Lưu ý:** Hàng đang giữ vẫn còn trong kho, chưa xuất đi

### 3. **Khả dụng (Available Quantity)**
- **Công thức:** `Khả dụng = Tồn kho - Đang giữ`
- **Là gì:** Số lượng thực sự có thể bán cho khách hàng mới
- **Ví dụ:**
  ```
  Tồn kho: 100 chiếc
  Đang giữ: 15 chiếc (đơn hàng chưa hoàn thành)
  Khả dụng: 100 - 15 = 85 chiếc
  ```
- **Tại sao quan trọng:** 
  - Khách chỉ được đặt tối đa = số lượng Khả dụng
  - Tránh overselling (bán quá số hàng có)

## 💰 Giá Cả

### 1. **Giá bán (Product Price)**
- **Là gì:** Giá bán ra cho khách hàng
- **Được set ở:** Thông tin sản phẩm (Product)
- **Hiển thị:** Trang web, danh sách sản phẩm
- **Ví dụ:** 500,000 ₫

### 2. **Giá vốn (Cost Price)**
- **Là gì:** Giá nhập hàng từ nhà cung cấp
- **Được set ở:** Mỗi lần nhập hàng (Stock Import)
- **Dùng để:** 
  - Tính giá trị tồn kho
  - Phân tích lợi nhuận
  - Báo cáo tài chính
- **Ví dụ:** 300,000 ₫
- **Lợi nhuận:** 500,000 - 300,000 = 200,000 ₫/sản phẩm

### So Sánh:
| Khái niệm | Giá bán | Giá vốn |
|-----------|---------|---------|
| **Ai thấy** | Khách hàng | Admin |
| **Set ở đâu** | Product Management | Stock Import |
| **Mục đích** | Bán hàng | Quản lý chi phí |
| **Ví dụ** | 500,000 ₫ | 300,000 ₫ |

## 🔴 Trạng Thái Tồn Kho

### 1. ✅ **Đủ hàng (Good Stock)**
- **Điều kiện:** `Khả dụng > Reorder Point`
- **Ví dụ:** Khả dụng = 50, Reorder Point = 10 → ✅ OK
- **Màu:** Xanh lá
- **Hành động:** Không cần làm gì

### 2. 📦 **Cần đặt hàng (Need Reorder)**
- **Điều kiện:** `Minimum Stock < Khả dụng ≤ Reorder Point`
- **Ví dụ:** Khả dụng = 8, Minimum = 5, Reorder = 10 → 📦 Cần đặt
- **Màu:** Xanh dương
- **Hành động:** Nên nhập thêm hàng

### 3. ⚠️ **Sắp hết (Low Stock)**
- **Điều kiện:** `0 < Khả dụng ≤ Minimum Stock`
- **Ví dụ:** Khả dụng = 3, Minimum = 5 → ⚠️ Sắp hết
- **Màu:** Vàng cam
- **Hành động:** Cần nhập gấp!

### 4. 🔴 **Hết hàng (Out of Stock)**
- **Điều kiện:** `Khả dụng = 0`
- **Ví dụ:** Khả dụng = 0 → 🔴 Hết hàng
- **Màu:** Đỏ
- **Hành động:** 
  - Khách không thể đặt hàng
  - Nhập hàng ngay lập tức

### Tại Sao Có Hàng Mà Vẫn "Hết Hàng"?

**Tình huống:**
```
Tồn kho: 10 chiếc
Đang giữ: 10 chiếc (đơn hàng chưa hoàn thành)
Khả dụng: 10 - 10 = 0 chiếc → 🔴 HẾT HÀNG
```

**Giải thích:**
- Kho vẫn còn 10 chiếc ✅
- Nhưng 10 chiếc đó đã được "giữ" cho khách đã đặt trước
- Khách mới KHÔNG THỂ đặt được
- Hệ thống hiển thị "Hết hàng" là ĐÚNG

**Giải pháp:**
- Chờ đơn hàng hoàn thành (Reserved giảm, Stock giảm)
- Hoặc nhập thêm hàng mới

## 🔄 Quy Trình Đặt Hàng

### Bước 1: Khách đặt hàng
```
TRƯỚC:
Tồn kho: 100
Đang giữ: 10
Khả dụng: 90

Khách đặt 5 chiếc

SAU:
Tồn kho: 100 (không đổi)
Đang giữ: 15 (+5)
Khả dụng: 85 (-5)
```

### Bước 2: Admin xác nhận & giao hàng
```
TRƯỚC:
Tồn kho: 100
Đang giữ: 15
Khả dụng: 85

Admin đánh dấu "COMPLETED"

SAU:
Tồn kho: 95 (-5) ← Hàng xuất kho
Đang giữ: 10 (-5) ← Bỏ giữ
Khả dụng: 85 (không đổi)
```

### Nếu khách hủy đơn:
```
TRƯỚC:
Tồn kho: 100
Đang giữ: 15
Khả dụng: 85

Khách hủy 5 chiếc

SAU:
Tồn kho: 100 (không đổi)
Đang giữ: 10 (-5)
Khả dụng: 90 (+5) ← Hàng trả về available
```

## 📈 Ví Dụ Thực Tế

### Case 1: Tình huống bình thường
```
Sản phẩm: Áo thun xanh size M

Tồn kho: 50 chiếc
Đang giữ: 5 chiếc (2 đơn hàng chưa giao)
Khả dụng: 45 chiếc
Minimum: 10
Reorder: 20

Trạng thái: 📦 Cần đặt hàng (45 > 10 nhưng < 20)
```

### Case 2: Sắp hết hàng
```
Sản phẩm: Quần jean đen size 30

Tồn kho: 8 chiếc
Đang giữ: 0 chiếc
Khả dụng: 8 chiếc
Minimum: 10
Reorder: 20

Trạng thái: ⚠️ Sắp hết (8 < 10)
Hành động: Nhập gấp!
```

### Case 3: Hết hàng do đơn giữ
```
Sản phẩm: Váy hoa size S

Tồn kho: 15 chiếc ← Vẫn còn hàng trong kho
Đang giữ: 15 chiếc ← Nhưng tất cả đang giữ
Khả dụng: 0 chiếc
Minimum: 5
Reorder: 10

Trạng thái: 🔴 Hết hàng
Giải thích: Không thể bán cho khách mới vì hết hàng khả dụng
```

### Case 4: Sau khi nhập hàng
```
TRƯỚC NHẬP:
Tồn kho: 3 chiếc
Đang giữ: 2 chiếc
Khả dụng: 1 chiếc
Trạng thái: ⚠️ Sắp hết

Nhập 50 chiếc mới

SAU NHẬP:
Tồn kho: 53 chiếc (+50)
Đang giữ: 2 chiếc (không đổi)
Khả dụng: 51 chiếc (+50)
Trạng thái: ✅ Đủ hàng
```

## 💡 Mẹo Quản Lý

### 1. Setting Minimum & Reorder Point
```
Bán trung bình: 10 chiếc/ngày
Thời gian nhập hàng: 5 ngày

Minimum Stock = 10 × 5 = 50 chiếc (đủ 5 ngày)
Reorder Point = 10 × 8 = 80 chiếc (đủ 8 ngày, có buffer)
```

### 2. Kiểm tra Reserved cao
- Nếu Reserved cao → Nhiều đơn chưa hoàn thành
- Cần xử lý đơn hàng nhanh hơn
- Tránh tình trạng khách chờ lâu

### 3. Theo dõi Giá vốn
- Giá vốn thay đổi theo từng lần nhập
- Dùng để tính lợi nhuận thực tế
- So sánh giữa các đợt nhập khác nhau

### 4. Cảnh báo tự động
- Hệ thống tự tạo StockAlert khi:
  - Khả dụng ≤ Minimum → LOW_STOCK alert
  - Khả dụng = 0 → OUT_OF_STOCK alert
  - Check ở trang "Cảnh báo tồn kho"

## 🎯 Tóm Tắt Nhanh

| Khái niệm | Ý nghĩa | Công thức |
|-----------|---------|-----------|
| **Tồn kho** | Tổng hàng trong kho | Nhập - Xuất |
| **Đang giữ** | Hàng đã có chủ (chưa xuất) | Tổng đơn hàng pending |
| **Khả dụng** | Hàng có thể bán | Tồn kho - Đang giữ |
| **Giá bán** | Giá cho khách | Set ở Product |
| **Giá vốn** | Giá nhập hàng | Set khi Import |

---

**Cập nhật:** 11/11/2025  
**Version:** 1.0
