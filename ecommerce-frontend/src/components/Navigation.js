import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Button, Space, Dropdown, Avatar, Modal, Descriptions, Tag } from 'antd';
import { 
  HomeOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import authAxios from '../api/AuthAxios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Header } = Layout;

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    
    // Fetch cart item count and user info if logged in
    if (token) {
      fetchCartCount();
      fetchUserInfo();
    } else {
      setCartItemCount(0);
      setUserInfo(null);
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

  const fetchUserInfo = async () => {
    try {
      const response = await authAxios.get('user/');
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUserInfo(null);
    }
  };

  // Expose function để các component khác có thể update cart count
  window.updateCartCount = fetchCartCount;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      onClick: () => {
        setProfileModalVisible(true);
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
      onClick: () => {
        navigate('/');
        window.scrollTo(0, 0);
      }
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
          onClick={() => {
            navigate('/');
            window.scrollTo(0, 0);
          }}
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background-color 0.3s',
                ':hover': { backgroundColor: '#f0f0f0' }
              }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ 
                  marginLeft: '8px',
                  color: '#595959',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {userInfo?.first_name ? 
                    `${userInfo.first_name} ${userInfo.last_name || ''}`.trim() : 
                    userInfo?.username || 'User'
                  }
                </span>
              </div>
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

      {/* Profile Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="large" icon={<UserOutlined />} style={{ marginRight: 12 }} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Thông tin cá nhân
              </div>
              <div style={{ fontSize: '14px', color: '#8c8c8c', fontWeight: 'normal' }}>
                {userInfo?.first_name ? 
                  `${userInfo.first_name} ${userInfo.last_name || ''}`.trim() : 
                  userInfo?.username || 'User'
                }
              </div>
            </div>
          </div>
        }
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setProfileModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {userInfo && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item 
              label={
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Tên đăng nhập
                </span>
              }
            >
              <Tag color="blue">{userInfo.username}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Họ tên
                </span>
              }
            >
              {userInfo.first_name || userInfo.last_name ? 
                `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() : 
                <span style={{ color: '#8c8c8c' }}>Chưa cập nhật</span>
              }
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <span>
                  <MailOutlined style={{ marginRight: 8 }} />
                  Email
                </span>
              }
            >
              {userInfo.email || <span style={{ color: '#8c8c8c' }}>Chưa cập nhật</span>}
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Vai trò
                </span>
              }
            >
              <Tag color={userInfo.is_staff ? 'red' : 'green'}>
                {userInfo.is_staff ? 'Quản trị viên' : 'Khách hàng'}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Ngày tham gia
                </span>
              }
            >
              {userInfo.date_joined ? 
                format(new Date(userInfo.date_joined), 'dd/MM/yyyy HH:mm', { locale: vi }) :
                <span style={{ color: '#8c8c8c' }}>Không xác định</span>
              }
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Trạng thái tài khoản
                </span>
              }
            >
              <Tag color={userInfo.is_active ? 'success' : 'error'}>
                {userInfo.is_active ? 'Hoạt động' : 'Bị khóa'}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Đăng nhập lần cuối
                </span>
              }
            >
              {userInfo.last_login ? 
                format(new Date(userInfo.last_login), 'dd/MM/yyyy HH:mm', { locale: vi }) :
                <span style={{ color: '#8c8c8c' }}>Chưa có thông tin</span>
              }
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Header>
  );
};

export default Navigation;