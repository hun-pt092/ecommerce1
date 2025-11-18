import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Button, Space, Dropdown, Avatar, Modal, Descriptions, Tag, Form, Input, message as antMessage, Typography, DatePicker } from 'antd';
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
  DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';
import authAxios from '../api/AuthAxios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import dayjs from 'dayjs';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import logoImage from '../logo (2).png';

const { Header } = Layout;
const { Text } = Typography;

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
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
        setProfileModalVisible(true);
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

  const menuItems = [
    {
      key: '/products',
      label: 'Sản phẩm',
      icon: <ShoppingCartOutlined />,
      onClick: () => {
        navigate('/');
        // Scroll to featured products section
        setTimeout(() => {
          const featuredSection = document.getElementById('featured-products');
          if (featuredSection) {
            featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // If section doesn't exist, scroll to search/filter area
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }
        }, 100);
      }
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
            color: '#06131fff',
            cursor: 'pointer'
          }}
          onClick={() => {
            navigate('/');
            window.scrollTo(0, 0);
          }}
        >
          <img src={logoImage} alt="Fashion Store" style={{ height: '50px', marginRight: '8px', verticalAlign: 'middle' }} /> PKA
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
          {/* Wishlist */}
          {isLoggedIn && (
            <Button
              type="text"
              icon={<HeartOutlined style={{ fontSize: '20px' }} />}
              onClick={() => {
                navigate('/wishlist');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ display: 'flex', alignItems: 'center' }}
              title="Sản phẩm yêu thích"
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

          {/* Theme Toggle */}
          <ThemeToggle />

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size="large" icon={<UserOutlined />} style={{ marginRight: 12 }} />
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