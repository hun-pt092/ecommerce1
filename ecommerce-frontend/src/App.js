import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import DebugPage from './pages/DebugPage';
import TestConnectionPage from './pages/TestConnectionPage';
import QuickRegisterTest from './pages/QuickRegisterTest';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes that should NOT have the navigation */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Routes that should have the navigation */}
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
