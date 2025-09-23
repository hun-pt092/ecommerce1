import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Button, Space, Dropdown, Avatar } from 'antd';
import { 
  HomeOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import authAxios from '../api/AuthAxios';

const { Header } = Layout;

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    
    // Fetch cart item count if logged in
    if (token) {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [location]);

  const fetchCartCount = async () => {
    try {
      const response = await authAxios.get('cart/');
      const totalItems = response.data.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      setCartItemCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItemCount(0);
    }
  };

  // Expose function để các component khác có thể update cart count
  window.updateCartCount = fetchCartCount;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      onClick: () => {
        // TODO: Navigate to profile page
        console.log('Navigate to profile');
      }
    },
    {
      key: 'orders',
      label: 'Đơn hàng của tôi',
      icon: <ShoppingCartOutlined />,
      onClick: () => {
        navigate('/orders');
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    },
  ];

  const menuItems = [
    {
      key: '/',
      label: 'Trang chủ',
      icon: <HomeOutlined />,
      onClick: () => navigate('/')
    },
    // TODO: Add more menu items like categories
  ];

  return (
    <Header 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        width: '100%',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <div 
          style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1890ff',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          🛍️ Fashion Store
        </div>

        {/* Main Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            border: 'none',
            background: 'transparent',
            flex: 1,
            justifyContent: 'center'
          }}
        />

        {/* Right Side Actions */}
        <Space size="middle">
          {/* Cart */}
          <Badge count={cartItemCount} showZero={false}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />}
              onClick={() => navigate('/cart')}
              style={{ display: 'flex', alignItems: 'center' }}
            />
          </Badge>

          {/* User Actions */}
          {isLoggedIn ? (
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              arrow
            >
              <Button
                type="text"
                icon={<Avatar size="small" icon={<UserOutlined />} />}
                style={{ display: 'flex', alignItems: 'center' }}
              />
            </Dropdown>
          ) : (
            <Space>
              <Button
                type="text"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
                size="small"
              >
                Đăng ký
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default Navigation;