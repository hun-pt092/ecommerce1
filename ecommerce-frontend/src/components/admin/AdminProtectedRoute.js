import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Result } from 'antd';
import authAxios from '../../api/AuthAxios';

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Gọi API để kiểm tra user hiện tại
      const response = await authAxios.get('admin/check-admin/');
      
      if (response.data.is_admin) {
        setIsAdmin(true);
        setIsAuthenticated(true);
      } else {
        setIsAdmin(false);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Chưa đăng nhập -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không phải admin
  if (isAuthenticated && !isAdmin) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập vào trang quản trị."
        extra={
          <a href="/">Về trang chủ</a>
        }
      />
    );
  }

  // Là admin -> cho phép truy cập
  return children;
};

export default AdminProtectedRoute;