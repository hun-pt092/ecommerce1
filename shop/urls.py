from django.urls import path
from .views import (
    CartView, RegisterView, ProductListView, ProductDetailView,
    OrderCreateView, OrderListView, OrderDetailView, 
    AdminOrderListView, AdminOrderStatusUpdateView, OrderCancelView,
    CreateOrderFromCartView, UserOrderListView, UserOrderDetailView, OrderStatusUpdateView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair_alt'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
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
]

