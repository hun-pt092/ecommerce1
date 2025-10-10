import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
//import DebugPage from './pages/DebugPage';
//import TestConnectionPage from './pages/TestConnectionPage';


// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import AddProduct from './pages/admin/AddProduct';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
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
            
              

            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
