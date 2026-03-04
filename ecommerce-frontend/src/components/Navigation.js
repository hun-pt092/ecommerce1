import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Button, Space, Dropdown, Avatar, Modal, Descriptions, Tag, Form, Input, message as antMessage, Typography, DatePicker, Drawer } from 'antd';
import { 
  HomeOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HeartOutlined,
  StarFilled,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  GiftOutlined,
  LockOutlined,
  DashboardOutlined,
  SearchOutlined,
  AppstoreOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';
import authAxios from '../api/AuthAxios';
import apiClient from '../api/apiClient';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import dayjs from 'dayjs';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import logoImage from '../logo (2).png';

const { Header } = Layout;
const { Text } = Typography;
const { Search } = Input;

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now()); // For cache busting
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Track selected category
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { theme } = useTheme();

  // Config message để hiển thị trên Modal với z-index cao
  useEffect(() => {
    antMessage.config({
      top: 100,
      maxCount: 3,
      duration: 3,
      prefixCls: 'ant-message',
      getContainer: () => document.body,
    });
  }, []);

  // Track selected category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    setSelectedCategoryId(categoryParam);
  }, [location.search]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    
    // Fetch cart item count and user info if logged in
    if (token) {
      fetchCartCount();
      fetchWishlistCount();
      fetchUserInfo();
    } else {
      setCartItemCount(0);
      setWishlistCount(0);
      setUserInfo(null);
    }

    // Fetch categories
    fetchCategories();
  }, [location]);

  // Separate useEffect for event listener (no dependencies to avoid re-creating)
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log('User updated event received');
      const token = localStorage.getItem('access_token');
      if (token) {
        fetchUserInfo();
      }
    };
    
    window.addEventListener('user-updated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []); // Empty dependency - only setup once

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('categories/');
      const categoriesData = response.data.results || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

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

  const fetchWishlistCount = async () => {
    try {
      const response = await authAxios.get('wishlist/');
      setWishlistCount(response.data?.length || 0);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistCount(0);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await authAxios.get('user/');
      console.log('User info fetched:', response.data);
      console.log('Avatar URL:', response.data.avatar_url);
      setUserInfo(response.data);
      setAvatarTimestamp(Date.now()); // Update timestamp to bust cache
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

  const handleEditProfile = () => {
    setIsEditMode(true);
    form.setFieldsValue({
      first_name: userInfo?.first_name || '',
      last_name: userInfo?.last_name || '',
      email: userInfo?.email || '',
      phone_number: userInfo?.phone_number || '',
      date_of_birth: userInfo?.date_of_birth ? dayjs(userInfo.date_of_birth) : null
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    form.resetFields();
  };

  const handleUpdateProfile = async (values) => {
    setUpdateLoading(true);
    try {
      const updateData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number || '',
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null
      };
      
      const response = await authAxios.put('user/', updateData);
      setUserInfo(response.data);
      antMessage.success('Cập nhật thông tin thành công!');
      setIsEditMode(false);
      form.resetFields();
      
      // Refresh user info để cập nhật trong menu
      fetchUserInfo();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Nếu lỗi 401 (Unauthorized), yêu cầu đăng nhập lại
      if (error.response?.status === 401) {
        antMessage.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        handleLogout();
      } else {
        antMessage.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setPasswordLoading(true);
    try {
      await authAxios.post('user/change-password/', {
        old_password: values.old_password,
        new_password: values.new_password
      });
      
      // Đóng modal và reset form trước
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      
      // Hiển thị thông báo thành công
      Modal.success({
        title: 'Thành công',
        content: 'Đổi mật khẩu thành công!',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        Modal.error({
          title: 'Lỗi',
          content: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
          onOk: handleLogout
        });
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        const errorMsg = errorData?.old_password?.[0] 
          || errorData?.new_password?.[0] 
          || errorData?.error 
          || JSON.stringify(errorData) 
          || 'Mật khẩu cũ không đúng!';
        Modal.error({
          title: 'Lỗi',
          content: errorMsg,
        });
      } else {
        Modal.error({
          title: 'Lỗi',
          content: 'Có lỗi xảy ra khi đổi mật khẩu!',
        });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const userMenuItems = [
     // Chỉ hiển thị Dashboard Admin khi user là staff hoặc superuser
    ...(userInfo?.is_staff || userInfo?.is_superuser ? [{
      key: 'admin-dashboard',
      label: 'Dashboard Admin',
      icon: <DashboardOutlined />,
      onClick: () => {
        navigate('/admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }] : []),
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      onClick: () => {
        navigate('/profile');
      }
    },
    {
      key: 'change-password',
      label: 'Đổi mật khẩu',
      icon: <LockOutlined />,
      onClick: () => {
        setPasswordModalVisible(true);
      }
    },
    {
      key: 'wishlist',
      label: 'Sản phẩm yêu thích',
      icon: <HeartOutlined />,
      onClick: () => {
        navigate('/wishlist');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      key: 'coupons',
      label: 'Ví voucher',
      icon: <GiftOutlined />,
      onClick: () => {
        navigate('/coupons');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      key: 'reviews',
      label: 'Đánh giá của tôi',
      icon: <StarFilled />,
      onClick: () => {
        navigate('/my-reviews');
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

  // Menu dropdown cho categories
  const categoryMenuItems = [
    {
      key: 'all-products',
      label: (
        <span style={{ 
          color: selectedCategoryId === 'all' ? '#1890ff' : 'inherit',
          fontWeight: selectedCategoryId === 'all' ? 600 : 'normal'
        }}>
          Tất cả sản phẩm
        </span>
      ),
      icon: <AppstoreOutlined style={{ color: selectedCategoryId === 'all' ? '#1890ff' : 'inherit' }} />,
      onClick: () => {
        navigate('/?category=all');
        setTimeout(() => {
          const featuredSection = document.getElementById('featured-products');
          if (featuredSection) {
            featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    },
    { type: 'divider' },
    ...categories.map(category => ({
      key: `category-${category.id}`,
      label: (
        <span style={{ 
          color: selectedCategoryId === category.id.toString() ? '#1890ff' : 'inherit',
          fontWeight: selectedCategoryId === category.id.toString() ? 600 : 'normal'
        }}>
          {category.name}
        </span>
      ),
      onClick: () => {
        navigate(`/?category=${category.id}`);
        setTimeout(() => {
          const featuredSection = document.getElementById('featured-products');
          if (featuredSection) {
            featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }))
  ];

  const menuItems = [
    {
      key: '/products',
      label: (
        <Dropdown menu={{ items: categoryMenuItems }} placement="bottomLeft">
          <span style={{ cursor: 'pointer' }}>
            <ShoppingCartOutlined style={{ marginRight: 8 }} />
            Sản phẩm
          </span>
        </Dropdown>
      ),
      icon: null
    },
    {
      key: '/about',
      label: 'Giới thiệu',
      icon: <UserOutlined />,
      onClick: () => {
        navigate('/about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      key: '/contact',
      label: 'Liên hệ',
      icon: <PhoneOutlined />,
      onClick: () => {
        navigate('/contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 16px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        maxWidth: '1400px',
        margin: '0 auto',
        height: '64px'
      }}>
        {/* Logo */}
        <div 
          style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#06131fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
          onClick={() => {
            navigate('/');
            window.scrollTo(0, 0);
          }}
        >
          <img 
            src={logoImage} 
            alt="PKA Shop" 
            style={{ 
              height: '48px', 
              marginRight: '8px',
              verticalAlign: 'middle'
            }} 
          />
          <span className="logo-text">PKA</span>
        </div>

        {/* Desktop Menu */}
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
          className="desktop-menu"
        />

        {/* Right Side Actions */}
        <Space 
          size="small"
          style={{ 
            display: 'flex', 
            alignItems: 'center'
          }}
          className="nav-right-actions"
        >
          {/* Search Box - Desktop only */}
          <Search
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => {
              navigate(`/?search=${encodeURIComponent(value)}`);
              setTimeout(() => {
                const featuredSection = document.getElementById('featured-products');
                if (featuredSection) {
                  featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            style={{ width: 180 }}
            size="middle"
            allowClear
            className="desktop-search"
          />

          {/* Wishlist - Desktop & Tablet */}
          {isLoggedIn && (
            <Button
              type="text"
              icon={
                <HeartOutlined 
                  style={{ 
                    fontSize: '20px',
                    color: '#ff4d4f',
                    transition: 'all 0.3s ease'
                  }} 
                />
              }
              onClick={() => {
                navigate('/wishlist');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Sản phẩm yêu thích"
              className="desktop-wishlist"
            />
          )}

          {/* Cart */}
          <Badge count={cartItemCount} showZero={false}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />}
              onClick={() => navigate('/cart')}
              style={{ display: 'flex', alignItems: 'center' }}
            />
          </Badge>

          {/* Theme Toggle - Desktop only */}
          <div className="desktop-theme">
            <ThemeToggle inNavigation={true} />
          </div>

          {/* User Actions - Desktop */}
          <div className="desktop-user">
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
                  transition: 'background-color 0.3s'
                }}>
                  <Avatar 
                    key={avatarTimestamp}
                    size="small"
                    src={
                      userInfo?.avatar_url
                        ? `http://localhost:8000${userInfo.avatar_url}?t=${avatarTimestamp}`
                        : undefined
                    }
                    icon={!userInfo?.avatar_url && <UserOutlined />}
                  />
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
              <Space size="small">
                <Button
                  type="text"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                  size="small"
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
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px' }} />}
            onClick={() => setMobileDrawerVisible(true)}
            className="mobile-menu-button"
            style={{ display: 'none' }}
          />
        </Space>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logoImage} alt="PKA Shop" style={{ height: '32px', marginRight: '8px' }} />
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#06131fff' }}>PKA Shop</span>
            </div>
            <ThemeToggle inNavigation={true} size="middle" />
          </div>
        }
        placement="right"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={280}
      >
        {/* Mobile Search */}
        <div style={{ marginBottom: '16px' }}>
          <Search
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => {
              navigate(`/?search=${encodeURIComponent(value)}`);
              setMobileDrawerVisible(false);
              setTimeout(() => {
                const featuredSection = document.getElementById('featured-products');
                if (featuredSection) {
                  featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            style={{ width: '100%' }}
            allowClear
          />
        </div>

        {/* Mobile Menu Items */}
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          style={{ border: 'none' }}
        >
          <Menu.Item 
            key="/" 
            icon={<HomeOutlined />}
            onClick={() => {
              navigate('/');
              setMobileDrawerVisible(false);
            }}
          >
            Trang chủ
          </Menu.Item>
          
          <Menu.SubMenu 
            key="products" 
            icon={<ShoppingCartOutlined />}
            title="Sản phẩm"
          >
            {categoryMenuItems.filter(item => item.type !== 'divider').map(item => (
              <Menu.Item 
                key={item.key}
                icon={item.icon}
                onClick={() => {
                  item.onClick();
                  setMobileDrawerVisible(false);
                }}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
          
          {isLoggedIn && (
            <Menu.Item 
              key="/wishlist" 
              icon={<HeartOutlined />}
              onClick={() => {
                navigate('/wishlist');
                setMobileDrawerVisible(false);
              }}
            >
              Yêu thích
            </Menu.Item>
          )}
          
          <Menu.Item 
            key="/about" 
            icon={<UserOutlined />}
            onClick={() => {
              navigate('/about');
              setMobileDrawerVisible(false);
            }}
          >
            Giới thiệu
          </Menu.Item>
          
          <Menu.Item 
            key="/contact" 
            icon={<PhoneOutlined />}
            onClick={() => {
              navigate('/contact');
              setMobileDrawerVisible(false);
            }}
          >
            Liên hệ
          </Menu.Item>
        </Menu>

        {/* Mobile User Section */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          {isLoggedIn ? (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                <Avatar key={avatarTimestamp} icon={<UserOutlined />} src={userInfo?.avatar_url ? `${userInfo.avatar_url}?t=${avatarTimestamp}` : undefined} />
                <span style={{ marginLeft: '12px', fontWeight: '500' }}>
                  {userInfo?.first_name ? 
                    `${userInfo.first_name} ${userInfo.last_name || ''}`.trim() : 
                    userInfo?.username || 'User'
                  }
                </span>
              </div>
              
              {userMenuItems.map(item => {
                if (item.type === 'divider') return null;
                return (
                  <Button
                    key={item.key}
                    type="text"
                    icon={item.icon}
                    onClick={() => {
                      item.onClick();
                      setMobileDrawerVisible(false);
                    }}
                    block
                    style={{ textAlign: 'left' }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Space>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => {
                  navigate('/login');
                  setMobileDrawerVisible(false);
                }}
                block
              >
                Đăng nhập
              </Button>
              <Button
                icon={<UserAddOutlined />}
                onClick={() => {
                  navigate('/register');
                  setMobileDrawerVisible(false);
                }}
                block
              >
                Đăng ký
              </Button>
            </Space>
          )}
        </div>
      </Drawer>

      {/* Profile Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar key={avatarTimestamp} size="large" icon={<UserOutlined />} src={userInfo?.avatar_url ? `${userInfo.avatar_url}?t=${avatarTimestamp}` : undefined} style={{ marginRight: 12 }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {isEditMode ? 'Chỉnh sửa thông tin' : 'Thông tin cá nhân'}
                </div>
                <div style={{ fontSize: '14px', color: '#8c8c8c', fontWeight: 'normal' }}>
                  {userInfo?.first_name ? 
                    `${userInfo.first_name} ${userInfo.last_name || ''}`.trim() : 
                    userInfo?.username || 'User'
                  }
                </div>
              </div>
            </div>
          </div>
        }
        open={profileModalVisible}
        onCancel={() => {
          setProfileModalVisible(false);
          setIsEditMode(false);
          form.resetFields();
        }}
        footer={
          isEditMode ? [
            <Button 
              key="cancel" 
              icon={<CloseOutlined />}
              onClick={handleCancelEdit}
            >
              Hủy
            </Button>,
            <Button 
              key="save" 
              type="primary" 
              icon={<SaveOutlined />}
              loading={updateLoading}
              onClick={() => form.submit()}
            >
              Lưu thay đổi
            </Button>
          ] : [
            <Button 
              key="edit" 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleEditProfile}
            >
              Chỉnh sửa
            </Button>,
            <Button 
              key="close" 
              onClick={() => setProfileModalVisible(false)}
            >
              Đóng
            </Button>
          ]
        }
        width={600}
      >
        {userInfo && (
          isEditMode ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              autoComplete="off"
            >
              <Form.Item
                label="Họ"
                name="first_name"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ!' },
                  { min: 1, message: 'Họ phải có ít nhất 1 ký tự!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Tên"
                name="last_name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên!' },
                  { min: 1, message: 'Tên phải có ít nhất 1 ký tự!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="example@email.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone_number"
                rules={[
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 số)!' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="date_of_birth"
              >
                <DatePicker 
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                  size="large"
                  style={{ width: '100%' }}
                  suffixIcon={<CalendarOutlined />}
                  disabledDate={(current) => {
                    return current && current > dayjs().endOf('day');
                  }}
                />
              </Form.Item>

              <div style={{ 
                background: '#f0f2f5', 
                padding: '12px', 
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Tên đăng nhập:</Text> <Tag color="blue">{userInfo.username}</Tag>
                </div>
                <div>
                  <Text strong>Vai trò:</Text> 
                  <Tag color={userInfo.is_staff ? 'red' : 'green'} style={{ marginLeft: '8px' }}>
                    {userInfo.is_staff ? 'Quản trị viên' : 'Khách hàng'}
                  </Tag>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    💡 Mẹo: Cập nhật ngày sinh để nhận mã giảm giá sinh nhật đặc biệt!
                  </Text>
                </div>
              </div>
            </Form>
          ) : (
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
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    Số điện thoại
                  </span>
                }
              >
                {userInfo.phone_number || <span style={{ color: '#8c8c8c' }}>Chưa cập nhật</span>}
              </Descriptions.Item>

              <Descriptions.Item 
                label={
                  <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Ngày sinh
                  </span>
                }
              >
                {userInfo.date_of_birth ? 
                  format(new Date(userInfo.date_of_birth), 'dd/MM/yyyy', { locale: vi }) :
                  <span style={{ color: '#8c8c8c' }}>Chưa cập nhật</span>
                }
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
          )
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined style={{ color: '#1890ff' }} />
            <span>Đổi mật khẩu</span>
          </Space>
        }
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setPasswordModalVisible(false);
              passwordForm.resetFields();
            }}
          >
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={passwordLoading}
            onClick={() => passwordForm.submit()}
          >
            Đổi mật khẩu
          </Button>
        ]}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          autoComplete="off"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="old_password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu hiện tại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="new_password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirm_password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu mới"
              size="large"
            />
          </Form.Item>

          <div style={{ 
            background: '#f0f2f5', 
            padding: '12px', 
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              <strong>💡 Lưu ý:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Mật khẩu phải có ít nhất 8 ký tự</li>
                <li>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không sử dụng mật khẩu dễ đoán</li>
              </ul>
            </Text>
          </div>
        </Form>
      </Modal>
    </Header>
  );
};

export default Navigation;