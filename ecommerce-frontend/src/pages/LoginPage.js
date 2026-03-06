import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Typography, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logoImage from '../logo (2).png';

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
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 420, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
        bordered={false}
      >
        {/* Gradient border effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 3s ease infinite'
        }} />
        <div style={{ textAlign: 'center', marginBottom: '36px', paddingTop: '12px' }}>
          <div style={{ 
            marginBottom: '20px',
            animation: 'fadeInDown 0.6s ease-out'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '16px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              boxShadow: '0 8px 24px rgba(102,126,234,0.15)'
            }}>
              <img src={logoImage} alt="PKA Shop" style={{ height: '80px', display: 'block' }} />
            </div>
          </div>
          <Title level={2} style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            fontWeight: 700,
            fontSize: '32px'
          }}>
            PKA Shop
          </Title>
          <Text type="secondary" style={{ fontSize: '15px', color: '#8c8c8c' }}>
            Chào mừng bạn trở lại! 👋
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
              style={{ 
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '15px'
              }}
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
      
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
