from django.urls import path
from .views import (
    CartView, RegisterView, ProductListView, ProductDetailView,
    CategoryListView, BrandListView,  # Public views
    OrderCreateView, OrderListView, OrderDetailView, 
    AdminOrderListView, AdminOrderStatusUpdateView, CancelOrderView,
    CreateOrderFromCartView, UserOrderListView, UserOrderDetailView, OrderStatusUpdateView,
    # Admin views
    AdminCategoryListView, AdminCategoryDetailView,
    AdminBrandListView, AdminBrandDetailView,
    AdminProductListView, AdminProductDetailView, AdminCheckView,
    # Admin dashboard and management
    AdminDashboardStatsView, AdminOrderStatsView, AdminUserStatsView,
    AdminUserListView, AdminUserDetailView, AdminUserStatusUpdateView,
    CurrentUserView, ChangePasswordView,
    # Review and Wishlist views
    ProductReviewListView, ReviewCreateView, UserReviewListView, ReviewDetailView,
    WishlistView, WishlistItemView, WishlistCheckView, ProductStatsView,
    # Stock Management views
    AdminStockImportView, AdminStockAdjustView, AdminStockDamagedView,
    AdminStockHistoryView, AdminStockAlertsView, AdminStockAlertResolveView,
    AdminInventoryReportView, AdminVariantStockDetailView,
    AdminStockReturnView, AdminVariantStockHistoryView, AdminVariantListView,
    # Coupon & Birthday views
    UserCouponListView, ApplyCouponView,
    AdminCouponListCreateView, AdminCouponDetailView, AdminUserCouponListView,
    # Analytics views
    RevenueAnalyticsView, RevenueTimelineView,
    TopCustomersView, NewCustomersStatsView,
    BestSellingProductsView, CategoryRevenueView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair_alt'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', CurrentUserView.as_view(), name='current_user'),
    path('user/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Products
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    
    # Categories & Brands (Public API)
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('brands/', BrandListView.as_view(), name='brand_list'),
    
    # Cart
    path('cart/', CartView.as_view(), name='cart'),
    
    # Orders - User endpoints
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('orders/create/', OrderCreateView.as_view(), name='order_create'),
    path('orders/create-from-cart/', CreateOrderFromCartView.as_view(), name='create_order_from_cart'),
    path('orders/my-orders/', UserOrderListView.as_view(), name='user_order_list'),
    path('orders/<int:pk>/', UserOrderDetailView.as_view(), name='user_order_detail'),
    path('orders/<int:pk>/cancel/', CancelOrderView.as_view(), name='order_cancel'),
    
    # Orders - Admin endpoints
    path('admin/orders/', AdminOrderListView.as_view(), name='admin_order_list'),
    path('admin/orders/statistics/', AdminOrderStatsView.as_view(), name='admin_order_stats'),
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
    path('dashboard/statistics/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('orders/statistics/', AdminOrderStatsView.as_view(), name='admin_order_stats'),
    
    # Admin - User Management
    path('users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('users/statistics/', AdminUserStatsView.as_view(), name='admin_user_stats'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('users/<int:pk>/status/', AdminUserStatusUpdateView.as_view(), name='admin_user_status'),
    
    # Admin - Orders Management (using existing AdminOrderListView)
    path('orders/', AdminOrderListView.as_view(), name='admin_orders_api'),
    
    # Reviews
    path('products/<int:product_id>/reviews/', ProductReviewListView.as_view(), name='product_reviews'),
    path('products/<int:product_id>/stats/', ProductStatsView.as_view(), name='product_stats'),
    path('reviews/create/', ReviewCreateView.as_view(), name='review_create'),
    path('reviews/my-reviews/', UserReviewListView.as_view(), name='user_reviews'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),
    
    # Wishlist
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', WishlistItemView.as_view(), name='wishlist_item'),
    path('wishlist/check/<int:product_id>/', WishlistCheckView.as_view(), name='wishlist_check'),
    
    # Stock Management (Admin) - Updated URLs
    path('admin/stock/variants/<int:variant_id>/import/', AdminStockImportView.as_view(), name='admin_stock_import'),
    path('admin/stock/variants/<int:variant_id>/adjust/', AdminStockAdjustView.as_view(), name='admin_stock_adjust'),
    path('admin/stock/variants/<int:variant_id>/damaged/', AdminStockDamagedView.as_view(), name='admin_stock_damaged'),
    path('admin/stock/variants/<int:variant_id>/return/', AdminStockReturnView.as_view(), name='admin_stock_return'),
    path('admin/stock/history/', AdminStockHistoryView.as_view(), name='admin_stock_history'),
    path('admin/stock/variants/<int:variant_id>/history/', AdminVariantStockHistoryView.as_view(), name='admin_variant_stock_history'),
    path('admin/stock/alerts/', AdminStockAlertsView.as_view(), name='admin_stock_alerts'),
    path('admin/stock/alerts/<int:pk>/resolve/', AdminStockAlertResolveView.as_view(), name='admin_stock_alert_resolve'),
    path('admin/inventory/report/', AdminInventoryReportView.as_view(), name='admin_inventory_report'),
    path('admin/inventory/variants/<int:pk>/', AdminVariantStockDetailView.as_view(), name='admin_variant_stock_detail'),
    # Lấy danh sách variants cho Stock Management
    path('admin/products/variants/', AdminVariantListView.as_view(), name='admin_variant_list'),
    
    # Coupon & Birthday Coupons
    path('coupons/', UserCouponListView.as_view(), name='user_coupon_list'),  # Ví voucher
    path('coupons/apply/', ApplyCouponView.as_view(), name='apply_coupon'),  # Áp dụng mã
    # Admin coupon management
    path('admin/coupons/', AdminCouponListCreateView.as_view(), name='admin_coupon_list'),
    path('admin/coupons/<int:pk>/', AdminCouponDetailView.as_view(), name='admin_coupon_detail'),
    path('admin/user-coupons/', AdminUserCouponListView.as_view(), name='admin_user_coupon_list'),
    
    # Analytics APIs
    path('admin/analytics/revenue/', RevenueAnalyticsView.as_view(), name='analytics_revenue'),
    path('admin/analytics/revenue/timeline/', RevenueTimelineView.as_view(), name='analytics_timeline'),
    path('admin/analytics/customers/top/', TopCustomersView.as_view(), name='analytics_top_customers'),
    path('admin/analytics/customers/new/', NewCustomersStatsView.as_view(), name='analytics_new_customers'),
    path('admin/analytics/products/best-sellers/', BestSellingProductsView.as_view(), name='analytics_best_sellers'),
    path('admin/analytics/categories/revenue/', CategoryRevenueView.as_view(), name='analytics_category_revenue'),
]
