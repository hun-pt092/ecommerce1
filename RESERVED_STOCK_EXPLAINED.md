# 🔒 RESERVED STOCK - GIẢI THÍCH CHI TIẾT

## 📖 Khái Niệm

**Reserved Stock** (Giữ hàng) là cơ chế **tạm giữ** một số lượng sản phẩm trong kho khi khách hàng bắt đầu quá trình checkout, để **tránh overselling** (bán quá số lượng tồn kho).

---

## 🎯 Tại Sao Cần Reserved Stock?

### Vấn đề:
```
Tình huống: Còn 1 chiếc áo cuối cùng trong kho

⏰ 10:00:00 - Khách A thêm vào giỏ
⏰ 10:00:05 - Khách B thêm vào giỏ  
⏰ 10:00:10 - Khách A bắt đầu checkout
⏰ 10:00:15 - Khách B bắt đầu checkout
⏰ 10:00:20 - Cả 2 đều thanh toán thành công!

❌ Kết quả: Có 2 đơn hàng nhưng chỉ có 1 sản phẩm!
```

### Giải pháp - Reserved Stock:
```
⏰ 10:00:00 - Khách A thêm vào giỏ
  stock_quantity: 1
  reserved_quantity: 0
  available_quantity: 1 ✅

⏰ 10:00:10 - Khách A checkout → reserve_stock()
  stock_quantity: 1
  reserved_quantity: 1
  available_quantity: 0 🔒

⏰ 10:00:15 - Khách B checkout → reserve_stock()
  ❌ LỖI: "Không đủ hàng trong kho"
  
⏰ 10:00:30 - Khách A thanh toán thành công
  stock_quantity: 0 (đã trừ)
  reserved_quantity: 0 (đã giải phóng)
  ✅ Thành công!
```

---

## ⏱️ THỜI GIAN GIỮ HÀNG

### Cấu hình hiện tại:
```python
# shop/models.py - CartItem.reserve_stock()
self.reservation_expires_at = timezone.now() + timedelta(minutes=30)
```

**⏰ Thời gian giữ hàng: 30 PHÚT**

### Tại sao 30 phút?
- ✅ **Đủ thời gian** cho khách hàng điền thông tin và thanh toán
- ✅ **Không quá lâu** để tránh giữ hàng vô ích
- ✅ **Chuẩn thương mại điện tử** (Amazon: 15-30 phút, Lazada: 30 phút)

### Có thể thay đổi:
```python
# Thay đổi trong shop/models.py

# Option 1: Giữ 15 phút (nhanh hơn)
self.reservation_expires_at = timezone.now() + timedelta(minutes=15)

# Option 2: Giữ 1 giờ (lâu hơn cho thanh toán chuyển khoản)
self.reservation_expires_at = timezone.now() + timedelta(hours=1)

# Option 3: Giữ 10 phút (flash sale, sản phẩm hot)
self.reservation_expires_at = timezone.now() + timedelta(minutes=10)
```

---

## 🔄 QUY TRÌNH HOẠT ĐỘNG

### 1. Khách hàng thêm vào giỏ (CHƯA giữ hàng)
```python
# CartView.put() - shop/views.py
cart_item = CartItem.objects.create(
    cart=cart,
    product_variant=variant,
    quantity=2,
    is_reserved=False  # Chưa giữ hàng
)

# Stock vẫn available cho người khác
```

### 2. Khách hàng bắt đầu checkout (BẮT ĐẦU giữ hàng)
```python
# CheckoutPage.js (Frontend) - Khi vào trang checkout
await axios.post('/api/shop/cart/reserve/', {
    cart_id: cartId
})

# Backend (shop/views.py)
for item in cart.items.all():
    success = item.reserve_stock()
    if not success:
        return Response({"error": "Hết hàng"})

# Kết quả:
# - is_reserved = True
# - reserved_at = 2025-10-28 10:00:00
# - reservation_expires_at = 2025-10-28 10:30:00
# - product_variant.reserved_quantity += item.quantity
```

### 3. Khách hàng hoàn tất thanh toán (GIẢI PHÓNG reservation)
```python
# OrderCreateView (shop/views.py)
order = Order.objects.create(...)

for cart_item in cart.items.all():
    # Tạo order item
    OrderItem.objects.create(...)
    
    # Trừ stock thực tế
    cart_item.product_variant.stock_quantity -= cart_item.quantity
    
    # Giải phóng reservation
    cart_item.product_variant.reserved_quantity -= cart_item.quantity
    cart_item.product_variant.save()
    
    # Clear cart item
    cart_item.delete()
```

### 4. Khách hàng hủy/không thanh toán (TỰ ĐỘNG giải phóng)
```python
# Scenario A: Khách tự hủy
# CartView.delete()
cart_item.release_reservation()  # Giải phóng ngay

# Scenario B: Quá 30 phút không thanh toán
# Chạy cleanup_expired_reservations()
StockService.cleanup_expired_reservations()
```

---

## 🧹 `cleanup_expired_reservations()` - GIẢI THÍCH CHI TIẾT

### Mục đích:
Tự động **giải phóng** (unreserve) các sản phẩm đã giữ hàng **quá 30 phút** mà khách chưa thanh toán.

### Code:
```python
# shop/services/stock_service.py

@staticmethod
def cleanup_expired_reservations():
    """
    Dọn dẹp các reservation đã hết hạn
    Chạy định kỳ bằng celery hoặc cron job
    """
    from ..models import CartItem
    
    # Tìm tất cả cart items:
    # - Đang giữ hàng (is_reserved=True)
    # - Đã hết hạn (reservation_expires_at < now)
    expired_items = CartItem.objects.filter(
        is_reserved=True,
        reservation_expires_at__lt=timezone.now()
    )
    
    count = 0
    for item in expired_items:
        # Giải phóng từng item
        item.release_reservation()
        count += 1
    
    return count  # Trả về số lượng đã giải phóng
```

### Ví dụ:
```python
# Giả sử:
# - 10:00 - Khách A reserve 5 áo (expires at 10:30)
# - 10:15 - Khách B reserve 3 áo (expires at 10:45)
# - 10:20 - Khách C reserve 2 áo (expires at 10:50)

# 10:35 - Chạy cleanup_expired_reservations()
# Kết quả:
# ✅ Giải phóng 5 áo của Khách A (đã hết hạn)
# ⏰ Giữ 3 áo của Khách B (còn 10 phút)
# ⏰ Giữ 2 áo của Khách C (còn 15 phút)
# Return: 1 (đã xóa 1 reservation)
```

---

## 🤖 CÁCH CHẠY TỰ ĐỘNG

### Option 1: Django Management Command (Đơn giản)
```python
# shop/management/commands/cleanup_reservations.py

from django.core.management.base import BaseCommand
from shop.services import StockService

class Command(BaseCommand):
    help = 'Cleanup expired stock reservations'
    
    def handle(self, *args, **kwargs):
        count = StockService.cleanup_expired_reservations()
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully cleaned up {count} expired reservations'
            )
        )
```

**Chạy thủ công:**
```bash
python manage.py cleanup_reservations
```

**Chạy tự động với Windows Task Scheduler:**
```powershell
# Tạo task chạy mỗi 5 phút
schtasks /create /tn "Cleanup Stock Reservations" /tr "python D:\eommerce_check\ecommerce_project\manage.py cleanup_reservations" /sc minute /mo 5
```

### Option 2: Celery Beat (Chuyên nghiệp)
```python
# ecommerce_project/celery.py

from celery import Celery
from celery.schedules import crontab

app = Celery('ecommerce_project')

app.conf.beat_schedule = {
    'cleanup-expired-reservations': {
        'task': 'shop.tasks.cleanup_expired_reservations',
        'schedule': crontab(minute='*/5'),  # Mỗi 5 phút
    },
}

# shop/tasks.py
from celery import shared_task
from .services import StockService

@shared_task
def cleanup_expired_reservations():
    return StockService.cleanup_expired_reservations()
```

### Option 3: Cron Job (Linux/Mac)
```bash
# crontab -e
*/5 * * * * cd /path/to/project && python manage.py cleanup_reservations
```

---

## 📊 GIÁM SÁT & BÁO CÁO

### Xem các reservation hiện tại:
```python
# Django shell
python manage.py shell

from shop.models import CartItem
from django.utils import timezone

# Tất cả reservations đang active
active_reservations = CartItem.objects.filter(is_reserved=True)
print(f"Active reservations: {active_reservations.count()}")

# Reservations sắp hết hạn (< 5 phút)
from datetime import timedelta
expiring_soon = CartItem.objects.filter(
    is_reserved=True,
    reservation_expires_at__lt=timezone.now() + timedelta(minutes=5)
)
print(f"Expiring soon: {expiring_soon.count()}")

# Reservations đã hết hạn (cần cleanup)
expired = CartItem.objects.filter(
    is_reserved=True,
    reservation_expires_at__lt=timezone.now()
)
print(f"Expired: {expired.count()}")
```

### API để check reservation status:
```python
# shop/views.py

class CartReservationStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart = Cart.objects.get(user=request.user)
        
        reserved_items = []
        for item in cart.items.filter(is_reserved=True):
            time_left = (item.reservation_expires_at - timezone.now()).total_seconds()
            reserved_items.append({
                'product': item.product_variant.product.name,
                'quantity': item.quantity,
                'reserved_at': item.reserved_at,
                'expires_at': item.reservation_expires_at,
                'time_left_seconds': int(time_left),
                'time_left_minutes': int(time_left / 60)
            })
        
        return Response({
            'has_reservations': len(reserved_items) > 0,
            'total_reserved': len(reserved_items),
            'items': reserved_items
        })
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Race Condition
```python
# VẤN ĐỀ: 2 khách cùng lúc mua sản phẩm cuối cùng

# GIẢI PHÁP: Sử dụng select_for_update()
from django.db import transaction

@transaction.atomic
def reserve_stock(self):
    # Lock variant để tránh race condition
    variant = ProductVariant.objects.select_for_update().get(id=self.product_variant.id)
    
    if variant.available_quantity >= self.quantity:
        variant.reserved_quantity += self.quantity
        variant.save()
        return True
    return False
```

### 2. Cleanup Frequency
```
⏱️ Chạy quá thường xuyên (mỗi 1 phút):
   ✅ Giải phóng nhanh
   ❌ Tốn tài nguyên database

⏱️ Chạy vừa phải (mỗi 5-10 phút):
   ✅ Cân bằng tốt
   ✅ Khuyến nghị

⏱️ Chạy quá ít (mỗi 1 giờ):
   ❌ Giữ hàng lâu không cần thiết
   ❌ Ảnh hưởng trải nghiệm khách khác
```

### 3. Notification cho khách hàng
```javascript
// Frontend - Hiển thị timer
const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 0) {
                // Hết thời gian
                alert('Hết thời gian giữ hàng!');
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    
    return () => clearInterval(timer);
}, []);

// Hiển thị: "Còn 25:30 để hoàn tất đơn hàng"
```

---

## 🎯 KẾT LUẬN

### Reserved Stock giúp:
✅ **Tránh overselling** - Không bán quá số lượng tồn kho
✅ **Công bằng** - Ai checkout trước được mua trước
✅ **Tự động hóa** - Giải phóng hàng nếu không thanh toán
✅ **Trải nghiệm tốt** - Khách biết chắc chắn có hàng khi checkout

### Thời gian 30 phút:
⏰ **Hợp lý** cho hầu hết trường hợp
⏰ **Có thể điều chỉnh** theo nhu cầu
⏰ **Cần cleanup tự động** để giải phóng

### Cleanup tự động:
🤖 **Chạy mỗi 5-10 phút**
🤖 **Giải phóng reservations hết hạn**
🤖 **Giữ hệ thống hoạt động tốt**

---