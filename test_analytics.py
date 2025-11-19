"""
Test Analytics APIs
Chạy file này để test các API Analytics
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

# Lấy token admin (thay username/password của admin)
def get_admin_token():
    """Lấy token admin để test"""
    login_url = f"{BASE_URL}/login/"
    
    # Thay đổi username/password admin của bạn ở đây
    data = {
        "username": "admin",  # Thay username admin
        "password": "admin12"  # Thay password admin
    }
    
    try:
        response = requests.post(login_url, json=data)
        if response.status_code == 200:
            token = response.json()['access']
            print("✅ Đăng nhập thành công!")
            return token
        else:
            print(f"❌ Đăng nhập thất bại: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return None


def test_api(endpoint, token, params=None):
    """Test một API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            print(f"\n✅ {endpoint}")
            data = response.json()
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return data
        else:
            print(f"\n❌ {endpoint} - Status: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"\n❌ {endpoint} - Lỗi: {e}")
        return None


def main():
    print("=" * 60)
    print("🧪 TEST ANALYTICS APIs")
    print("=" * 60)
    
    # Lấy token
    token = get_admin_token()
    if not token:
        print("\n⚠️ Không thể lấy token. Kiểm tra username/password admin!")
        return
    
    # Test các APIs
    print("\n" + "=" * 60)
    print("1️⃣ DOANH THU TỔNG QUAN")
    print("=" * 60)
    test_api("/admin/analytics/revenue/", token, {"period": "month"})
    
    print("\n" + "=" * 60)
    print("2️⃣ DOANH THU THEO THỜI GIAN (30 ngày)")
    print("=" * 60)
    test_api("/admin/analytics/revenue/timeline/", token, {"days": 30})
    
    print("\n" + "=" * 60)
    print("3️⃣ TOP 10 KHÁCH HÀNG VIP")
    print("=" * 60)
    result = test_api("/admin/analytics/customers/top/", token, {"limit": 10})
    
    # Hiển thị VIP tiers
    if result and 'vip_tiers_count' in result:
        print("\n📊 Thống kê VIP Tiers:")
        for tier, count in result['vip_tiers_count'].items():
            icon = result['vip_tiers_info'][tier]['icon']
            print(f"  {icon} {tier}: {count} khách hàng")
    
    print("\n" + "=" * 60)
    print("4️⃣ KHÁCH HÀNG MỚI (30 ngày)")
    print("=" * 60)
    test_api("/admin/analytics/customers/new/", token, {"days": 30})
    
    print("\n" + "=" * 60)
    print("5️⃣ TOP 10 SẢN PHẨM BÁN CHẠY")
    print("=" * 60)
    test_api("/admin/analytics/products/best-sellers/", token, {"limit": 10})
    
    print("\n" + "=" * 60)
    print("6️⃣ DOANH THU THEO DANH MỤC")
    print("=" * 60)
    test_api("/admin/analytics/categories/revenue/", token)
    
    print("\n" + "=" * 60)
    print("✅ HOÀN THÀNH TEST!")
    print("=" * 60)


if __name__ == "__main__":
    main()
