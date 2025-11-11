# 🎨 HƯỚNG DẪN SỬ DỤNG FRONTEND QUẢN LÝ KHO

## 📋 Mục lục
1. [Cài đặt và Khởi chạy](#cài-đặt-và-khởi-chạy)
2. [Các trang chức năng](#các-trang-chức-năng)
3. [Hướng dẫn sử dụng chi tiết](#hướng-dẫn-sử-dụng-chi-tiết)
4. [Components tái sử dụng](#components-tái-sử-dụng)

---

## 🚀 Cài đặt và Khởi chạy

### 1. Cài đặt dependencies
```bash
cd ecommerce-frontend
npm install
```

### 2. Cấu hình API endpoint
Đảm bảo backend Django đang chạy ở `http://localhost:8000`

### 3. Khởi động frontend
```bash
npm start
```
Frontend sẽ chạy tại: `http://localhost:3000`

### 4. Đăng nhập Admin
- URL: `http://localhost:3000/login`
- Tài khoản admin (tạo từ backend):
  - Username: `admin`
  - Password: `admin123`

---

## 📱 Các trang chức năng

### 1. **Quản lý kho** (`/admin/stock`)
**Mục đích:** Trang chính để quản lý tồn kho tất cả sản phẩm

**Tính năng:**
- ✅ Hiển thị danh sách tất cả variants với thông tin stock đầy đủ
- ✅ Statistics cards: Tổng sản phẩm, Hết hàng, Sắp hết, Giá trị kho
- ✅ Filters: Search, Stock status (All/Out/Low/Normal), Sort by (Name/Stock/Available)
- ✅ Actions cho mỗi sản phẩm:
  - 🟢 **Nhập kho** (Import) - Mở modal nhập hàng
  - 🟡 **Điều chỉnh** (Adjust) - Tăng/giảm tồn kho
  - 🔴 **Hàng hỏng** (Damaged) - Đánh dấu hàng hỏng
- ✅ Stock Alert Badge - Hiển thị trạng thái stock bằng màu sắc

**Components sử dụng:**
- `StockImportModal` - Modal nhập kho
- `StockAdjustModal` - Modal điều chỉnh/hàng hỏng
- `StockAlertBadge` - Badge trạng thái

### 2. **Báo cáo tồn kho** (`/admin/inventory/report`)
**Mục đích:** Xem tổng quan và phân tích tồn kho

**Tính năng:**
- ✅ **Summary Statistics:**
  - Tổng sản phẩm (SKU khác nhau)
  - Tổng tồn kho (số lượng)
  - Có thể bán (Available)
  - Giá trị kho (tính theo cost_price)
- ✅ **Alerts Summary:**
  - Hết hàng (Out of stock)
  - Sắp hết (Low stock)
  - Cần đặt hàng (Reorder needed)
- ✅ **Stock Movement:**
  - Tổng nhập kho
  - Tổng xuất kho (bán)
  - Tổng hoàn trả
  - Tổng hàng hỏng
- ✅ **Top Products:**
  - Top 5 sản phẩm tồn kho cao nhất
  - Top 5 sản phẩm tồn kho thấp nhất
- ✅ **Detailed Table:**
  - Bảng chi tiết tất cả variants với stock info
- ✅ **Export to Excel:** Xuất báo cáo ra file CSV
- ✅ **Date Range Filter:** Lọc theo khoảng thời gian

### 3. **Lịch sử nhập/xuất** (`/admin/stock/history`)
**Mục đích:** Xem chi tiết tất cả giao dịch stock

**Tính năng:**
- ✅ **Transaction Statistics:**
  - Tổng giao dịch
  - Đã nhập (Import)
  - Đã xuất (Export/Sell)
  - Hư hỏng (Damaged)
- ✅ **Filters:**
  - Loại giao dịch (All/Import/Export/Return/Adjustment/Damaged)
  - Từ ngày - Đến ngày
  - Variant ID
- ✅ **History Table với:**
  - Thời gian giao dịch
  - Loại giao dịch (với icon và màu sắc)
  - Số lượng thay đổi (+/-)
  - Tồn kho trước/sau
  - Giá trị giao dịch
  - Mã tham chiếu
  - Người thực hiện
  - Ghi chú
- ✅ **Sort & Filter:** Sắp xếp theo thời gian, số lượng
- ✅ **Export to Excel**
- ✅ **Pagination:** Phân trang khi có nhiều records

**Component sử dụng:**
- `StockHistoryTable` - Bảng lịch sử chi tiết

### 4. **Cảnh báo tồn kho** (`/admin/stock/alerts`)
**Mục đích:** Quản lý các cảnh báo về tồn kho thấp

**Tính năng:**
- ✅ **Alert Statistics:**
  - Tổng cảnh báo
  - Hết hàng (Out of stock)
  - Sắp hết (Low stock)
  - Đã giải quyết (Resolved)
- ✅ **Alert Cards hiển thị:**
  - Loại cảnh báo (với icon và màu sắc)
  - Tên sản phẩm + variant
  - Tồn kho hiện tại
  - Ngưỡng tối thiểu
  - Ngày tạo cảnh báo
  - Trạng thái (Chưa giải quyết / Đã giải quyết)
- ✅ **Actions:**
  - Đánh dấu từng alert là đã giải quyết
  - Giải quyết tất cả cảnh báo cùng lúc
- ✅ **Filters:**
  - Chưa giải quyết
  - Tất cả
  - Đã giải quyết

---

## 🎯 Hướng dẫn sử dụng chi tiết

### A. NHẬP KHO (Import Stock)

**Bước 1:** Vào `/admin/stock`

**Bước 2:** Tìm sản phẩm cần nhập kho

**Bước 3:** Click nút **"+"** (màu xanh lá)

**Bước 4:** Điền form trong modal:
```
- Số lượng nhập: VD: 100
- Giá vốn (VNĐ/sp): VD: 150000
- Mã phiếu nhập: VD: NK-001
- Ghi chú: VD: "Nhập lô hàng từ NCC ABC"
```

**Bước 5:** Click **"Xác nhận nhập kho"**

**Kết quả:**
- ✅ Stock quantity tăng
- ✅ Tạo record trong StockHistory (transaction_type: import)
- ✅ Auto-resolve alerts nếu stock đã đủ
- ✅ Hiển thị thông báo thành công

### B. ĐIỀU CHỈNH TỒN KHO (Adjust Stock)

**Khi nào dùng:** Khi cần điều chỉnh số lượng do:
- Kiểm kê phát hiện sai lệch
- Sửa lỗi nhập liệu
- Chuyển kho nội bộ

**Bước 1:** Click nút **"⚙"** (màu vàng)

**Bước 2:** Nhập số lượng điều chỉnh:
```
- Số dương (+10) = Tăng 10 sản phẩm
- Số âm (-5) = Giảm 5 sản phẩm
```

**Bước 3:** Nhập lý do điều chỉnh (bắt buộc)

**Bước 4:** Xác nhận

**Kết quả:**
- ✅ Stock quantity thay đổi theo số điều chỉnh
- ✅ Tạo record StockHistory (transaction_type: adjustment)

### C. ĐÁNH DẤU HÀNG HỎNG (Mark Damaged)

**Khi nào dùng:** Khi hàng bị:
- Hỏng trong quá trình vận chuyển
- Hỏng do lỗi sản xuất
- Quá hạn sử dụng

**Bước 1:** Click nút **"✕"** (màu đỏ)

**Bước 2:** Nhập số lượng hàng hỏng

**Bước 3:** Nhập lý do (bắt buộc)

**Bước 4:** Xác nhận

**Kết quả:**
- ✅ Stock quantity giảm
- ✅ Tạo record StockHistory (transaction_type: damaged)
- ⚠️ **Không thể hoàn tác!**

### D. XEM BÁO CÁO (View Reports)

**1. Báo cáo tổng quan:**
- Vào `/admin/inventory/report`
- Xem statistics cards
- Xem top products

**2. Lọc theo thời gian:**
```javascript
Từ ngày: 01/01/2025
Đến ngày: 31/01/2025
=> Click "Áp dụng"
```

**3. Xuất Excel:**
- Click nút **"Xuất Excel"**
- File CSV sẽ tự động download

### E. QUẢN LÝ CẢNH BÁO (Manage Alerts)

**1. Xem cảnh báo chưa giải quyết:**
- Vào `/admin/stock/alerts`
- Mặc định hiển thị tab "Chưa giải quyết"

**2. Giải quyết từng cảnh báo:**
- Click **"Đánh dấu đã giải quyết"** trên card cảnh báo
- Alert chuyển sang trạng thái Resolved

**3. Giải quyết tất cả:**
- Click **"Giải quyết tất cả"** ở header
- Confirm hộp thoại
- Tất cả alerts được đánh dấu resolved

---

## 🧩 Components tái sử dụng

### 1. StockAlertBadge
**Mục đích:** Hiển thị trạng thái stock bằng badge màu

**Props:**
```javascript
<StockAlertBadge 
  variant={variantObject}  // ProductVariant object
  showText={true}          // Hiển thị text hay chỉ icon
/>
```

**Hiển thị:**
- 🔴 Hết hàng (available = 0)
- ⚠️ Sắp hết (available < minimum_stock)
- 📦 Cần đặt hàng (available < reorder_point)
- ✅ Đủ hàng (available >= reorder_point)

### 2. StockHistoryTable
**Mục đích:** Hiển thị bảng lịch sử stock

**Props:**
```javascript
<StockHistoryTable 
  history={historyArray}    // Array of StockHistory objects
  loading={false}           // Loading state
  onRefresh={() => {}}      // Callback khi click refresh
/>
```

**Features:**
- Sort by time/quantity
- Filter by transaction type
- Color-coded transactions
- Transaction summary

### 3. StockImportModal
**Mục đích:** Modal form nhập kho

**Props:**
```javascript
<StockImportModal 
  show={true}                   // Show/hide modal
  onHide={() => {}}             // Close callback
  variant={variantObject}       // ProductVariant to import
  onSuccess={(data) => {}}      // Success callback
/>
```

**Validation:**
- Số lượng > 0
- Giá vốn >= 0
- Mã phiếu nhập không rỗng

### 4. StockAdjustModal
**Mục đích:** Modal điều chỉnh stock hoặc mark damaged

**Props:**
```javascript
<StockAdjustModal 
  show={true}
  onHide={() => {}}
  variant={variantObject}
  adjustmentType="adjust"    // "adjust" or "damaged"
  onSuccess={(data) => {}}
/>
```

**2 Modes:**
- `adjust`: Điều chỉnh tồn kho (+ hoặc -)
- `damaged`: Đánh dấu hàng hỏng (chỉ -)

---

## 🎨 UI/UX Features

### Màu sắc theo trạng thái
```
🟢 Xanh lá (Success) - Nhập kho, Đủ hàng
🟡 Vàng (Warning) - Sắp hết, Cảnh báo
🔴 Đỏ (Danger) - Hết hàng, Hàng hỏng
🔵 Xanh dương (Info) - Cần đặt hàng, Hoàn trả
⚫ Xám (Secondary) - Giữ hàng, Hủy giữ
```

### Icons
```
📥 Import (Nhập kho)
📤 Export (Xuất kho)
↩️ Return (Hoàn trả)
⚙️ Adjustment (Điều chỉnh)
❌ Damaged (Hư hỏng)
🔒 Reserved (Giữ hàng)
🔓 Unreserved (Hủy giữ)
```

### Responsive
- ✅ Desktop: Full features
- ✅ Tablet: Optimized layout
- ✅ Mobile: Scrollable tables

---

## 🔗 Navigation

### Admin Menu Structure
```
Dashboard (/)
├── Quản lý sản phẩm
│   ├── Danh sách sản phẩm
│   └── Thêm sản phẩm
├── Quản lý kho 📦 (NEW!)
│   ├── Tồn kho
│   ├── Báo cáo tồn kho
│   ├── Lịch sử nhập/xuất
│   └── Cảnh báo
├── Quản lý đơn hàng
└── Quản lý người dùng
```

### URLs
```
/admin/stock                → Quản lý kho
/admin/inventory/report     → Báo cáo tồn kho
/admin/stock/history        → Lịch sử nhập/xuất
/admin/stock/alerts         → Cảnh báo tồn kho
```

---

## 🐛 Troubleshooting

### 1. API không hoạt động
**Nguyên nhân:** Backend chưa chạy hoặc CORS issue

**Giải pháp:**
```bash
# Kiểm tra backend
python manage.py runserver

# Check API endpoint
curl http://localhost:8000/api/shop/admin/inventory/variants/
```

### 2. Không thấy menu "Quản lý kho"
**Nguyên nhân:** User không phải admin

**Giải pháp:**
```bash
# Tạo superuser
python manage.py createsuperuser

# Hoặc set is_staff = True trong Django Admin
```

### 3. Modal không mở
**Nguyên nhân:** React state issue

**Giải pháp:**
```bash
# Clear cache và restart
rm -rf node_modules/.cache
npm start
```

### 4. Data không update sau action
**Nguyên nhân:** fetchVariants() không được gọi

**Giải pháp:**
- Check `onSuccess` callback trong modals
- Đảm bảo `fetchVariants()` được gọi sau success

---

## 📊 Performance Tips

### 1. Lazy Loading
```javascript
// Import components chỉ khi cần
const StockManagement = lazy(() => import('./pages/admin/StockManagement'));
```

### 2. Memoization
```javascript
// Sử dụng useMemo cho filtered/sorted data
const filteredVariants = useMemo(() => {
  return variants.filter(/* ... */);
}, [variants, filters]);
```

### 3. Pagination
- StockHistory có pagination tích hợp
- Limit 20 records/page mặc định

---

## 🚀 Next Steps

### Tính năng có thể thêm:
1. **Real-time updates** với WebSocket
2. **Bulk import** từ Excel
3. **Barcode scanning** cho nhập/xuất kho
4. **Stock transfer** giữa các kho
5. **Advanced analytics** với charts
6. **Print labels** cho sản phẩm
7. **Mobile app** cho warehouse staff
8. **Automated reordering** khi stock thấp

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Browser Console (F12) - Xem lỗi JavaScript
2. Network tab - Xem API requests/responses
3. Backend logs - Django terminal output

---

**Chúc bạn quản lý kho thành công! 🎉**
