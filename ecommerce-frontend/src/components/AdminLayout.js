import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  theme,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from 'antd';
import authAxios from '../api/AuthAxios';
import {
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  OrderedListOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  InboxOutlined,
  BarChartOutlined,
  HistoryOutlined,
  WarningOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      const response = await authAxios.get('user/');
      setUserInfo(response.data);
      setAvatarTimestamp(Date.now());
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch user info on mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Listen for avatar update event
  useEffect(() => {
    const handleUserUpdate = () => {
      fetchUserInfo();
    };
    
    window.addEventListener('user-updated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);

  // Menu items cho admin
  const menuItems = [
    {
      key: '/admin',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Quản lý sản phẩm',
      children: [
        {
          key: '/admin/products/list',
          label: 'Danh sách sản phẩm',
        },
        {
          key: '/admin/products/add',
          icon: <PlusOutlined />,
          label: 'Thêm sản phẩm',
        },
      ],
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: 'Danh mục sản phẩm',
    },
    {
      key: '/admin/stock',
      icon: <InboxOutlined />,
      label: 'Quản lý kho',
      children: [
        {
          key: '/admin/stock',
          icon: <InboxOutlined />,
          label: 'Tồn kho',
        },
        {
          key: '/admin/inventory/report',
          icon: <BarChartOutlined />,
          label: 'Báo cáo tồn kho',
        },
        {
          key: '/admin/stock/history',
          icon: <HistoryOutlined />,
          label: 'Lịch sử nhập/xuất',
        },
        {
          key: '/admin/stock/alerts',
          icon: <WarningOutlined />,
          label: 'Cảnh báo',
        },
      ],
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: 'Quản lý đơn hàng',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
  ];

  // Menu dropdown cho user
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      },
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          margin: '16px',
          borderRadius: '8px',
        }}>
          <Text strong style={{ color: 'white', fontSize: collapsed ? 16 : 18 }}>
            {collapsed ? 'EA' : 'E-Admin'}
          </Text>
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {/* Toggle button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          {/* User info */}
          <Space>
            <Text>Xin chào, {userInfo?.first_name || userInfo?.username || 'Admin'}</Text>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Avatar 
                key={avatarTimestamp}
                size="default"
                src={
                  userInfo?.avatar_url
                    ? `http://localhost:8000${userInfo.avatar_url}?t=${avatarTimestamp}`
                    : undefined
                }
                icon={!userInfo?.avatar_url && <UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;