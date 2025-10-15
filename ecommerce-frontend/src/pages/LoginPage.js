import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Typography, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    // Check if already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(''); // Clear previous error
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: values.username,
        password: values.password,
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Get user info to check if admin
      try {
        const userResponse = await axios.get('http://localhost:8000/api/user/', {
          headers: {
            Authorization: `Bearer ${response.data.access}`
          }
        });
        localStorage.setItem('user', JSON.stringify(userResponse.data));
        
        message.success('Đăng nhập thành công!');
        
        // Redirect based on user role
        if (userResponse.data.is_admin || userResponse.data.is_superuser) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (userErr) {
        console.error('Error getting user info:', userErr);
        message.success('Đăng nhập thành công!');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      // Hiển thị thông báo lỗi
      let errorMsg = '';
      if (err.response && err.response.status === 401) {
        errorMsg = 'Sai tên đăng nhập hoặc mật khẩu!';
      } else if (err.response && err.response.data && err.response.data.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.request) {
        errorMsg = 'Không thể kết nối đến server. Vui lòng thử lại.';
      } else {
        errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
      
      // Cả hai cách hiển thị lỗi
      setErrorMessage(errorMsg);
      message.error(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 400, 
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            🛍️ Fashion Store
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Chào mừng bạn trở lại!
          </Text>
        </div>

        {errorMessage && (
          <div style={{ 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7', 
            borderRadius: '6px', 
            padding: '12px 16px', 
            marginBottom: '20px',
            color: '#ff4d4f'
          }}>
             {errorMessage}
          </div>
        )}

        <Form 
          form={form}
          onFinish={onFinish} 
          layout="vertical" 
          size="large"
          requiredMark={false}
        >
          <Form.Item 
            name="username" 
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Nhập tên đăng nhập"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item 
            name="password" 
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Nhập mật khẩu"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              <Button type="link" style={{ padding: 0 }}>
                Quên mật khẩu?
              </Button>
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              style={{ 
                height: '50px', 
                fontSize: '16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider plain>
            <Text type="secondary">hoặc</Text>
          </Divider>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text type="secondary">Chưa có tài khoản? </Text>
            <Link 
              to="/register"
              style={{ 
                fontWeight: 'bold',
                color: '#1890ff'
              }}
            >
              Đăng ký ngay
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
