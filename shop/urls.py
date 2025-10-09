from django.urls import path
from .views import (
    CartView, RegisterView, ProductListView, ProductDetailView,
    OrderCreateView, OrderListView, OrderDetailView, 
    AdminOrderListView, AdminOrderStatusUpdateView, OrderCancelView,
    CreateOrderFromCartView, UserOrderListView, UserOrderDetailView, OrderStatusUpdateView,
    # Admin views
    AdminCategoryListView, AdminCategoryDetailView,
    AdminBrandListView, AdminBrandDetailView,
    AdminProductListView, AdminProductDetailView, AdminCheckView,
    # Admin dashboard and management
    AdminDashboardStatsView, AdminOrderStatsView, AdminUserStatsView,
    AdminUserListView, AdminUserDetailView, AdminUserStatusUpdateView,
    CurrentUserView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair_alt'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', CurrentUserView.as_view(), name='current_user'),
    
    # Products
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    
    # Cart
    path('cart/', CartView.as_view(), name='cart'),
    
    # Orders - User endpoints
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('orders/create/', OrderCreateView.as_view(), name='order_create'),
    path('orders/create-from-cart/', CreateOrderFromCartView.as_view(), name='create_order_from_cart'),
    path('orders/my-orders/', UserOrderListView.as_view(), name='user_order_list'),
    path('orders/<int:pk>/', UserOrderDetailView.as_view(), name='user_order_detail'),
    path('orders/<int:pk>/cancel/', OrderCancelView.as_view(), name='order_cancel'),
    
    # Orders - Admin endpoints
    path('admin/orders/', AdminOrderListView.as_view(), name='admin_order_list'),
    path('admin/orders/<int:pk>/status/', AdminOrderStatusUpdateView.as_view(), name='admin_order_status_update'),
    path('orders/<int:pk>/update-status/', OrderStatusUpdateView.as_view(), name='order_status_update'),
    
    # Admin - Categories
    path('admin/categories/', AdminCategoryListView.as_view(), name='admin_category_list'),
    path('admin/categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin_category_detail'),
    
    # Admin - Brands
    path('admin/brands/', AdminBrandListView.as_view(), name='admin_brand_list'),
    path('admin/brands/<int:pk>/', AdminBrandDetailView.as_view(), name='admin_brand_detail'),
    
    # Admin - Products
    path('admin/products/', AdminProductListView.as_view(), name='admin_product_list'),
    path('admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin_product_detail'),
    
    # Admin - Authentication
    path('admin/check-admin/', AdminCheckView.as_view(), name='admin_check'),
    
    # Admin - Dashboard & Statistics
    path('api/dashboard/statistics/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('api/orders/statistics/', AdminOrderStatsView.as_view(), name='admin_order_stats'),
    
    # Admin - User Management
    path('api/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('api/users/statistics/', AdminUserStatsView.as_view(), name='admin_user_stats'),
    path('api/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('api/users/<int:pk>/status/', AdminUserStatusUpdateView.as_view(), name='admin_user_status'),
    
    # Admin - Orders Management (using existing AdminOrderListView)
    path('api/orders/', AdminOrderListView.as_view(), name='admin_orders_api'),
]

