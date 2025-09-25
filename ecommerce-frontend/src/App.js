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
import DebugPage from './pages/DebugPage';
import TestConnectionPage from './pages/TestConnectionPage';
import QuickRegisterTest from './pages/QuickRegisterTest';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import AddProduct from './pages/admin/AddProduct';

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
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/test" element={<TestConnectionPage />} />
              <Route path="/quicktest" element={<QuickRegisterTest />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
