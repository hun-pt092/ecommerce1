import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import MyReviewsPage from './pages/MyReviewsPage';
//import DebugPage from './pages/DebugPage';
//import TestConnectionPage from './pages/TestConnectionPage';

// Information pages
import AboutPage from './pages/info/AboutPage';
import ContactPage from './pages/info/ContactPage';
import ShippingPolicy from './pages/info/ShippingPolicy';
import ReturnPolicy from './pages/info/ReturnPolicy';
import PrivacyPolicy from './pages/info/PrivacyPolicy';
import TermsOfService from './pages/info/TermsOfService';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import AddProduct from './pages/admin/AddProduct';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import StockManagement from './pages/admin/StockManagement';
import InventoryReport from './pages/admin/InventoryReport';
import StockHistory from './pages/admin/StockHistory';
import StockAlerts from './pages/admin/StockAlerts';

function App() {
  return (
    <ThemeProvider>
      <Router>
      <Routes>
        {/* Routes that should NOT have the navigation */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Admin routes with AdminLayout and protection */}
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/products/list" element={<ProductList />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products/edit/:id" element={<AddProduct />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/stock" element={<StockManagement />} />
                <Route path="/inventory/report" element={<InventoryReport />} />
                <Route path="/stock/history" element={<StockHistory />} />
                <Route path="/stock/alerts" element={<StockAlerts />} />
              </Routes>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        {/* User routes with regular Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/my-reviews" element={<MyReviewsPage />} />
              
              {/* Information pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
