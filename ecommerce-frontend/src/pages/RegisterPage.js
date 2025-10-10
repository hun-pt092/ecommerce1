import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

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
    try {
      console.log('Register form values:', values);
      
      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
        password2: values.password2,
        first_name: values.first_name,
        last_name: values.last_name,
      };
      
      console.log('Register data being sent:', registerData);
      
      const response = await axios.post('http://localhost:8000/api/register/', registerData);

      console.log('Register success:', response.data);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        console.log('Error data:', errorData);
        
        // Hiển thị lỗi cụ thể từ backend
        let hasError = false;
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            errorData[key].forEach(error => {
              message.error(`${key}: ${error}`);
              hasError = true;
            });
          } else if (typeof errorData[key] === 'string') {
            message.error(`${key}: ${errorData[key]}`);
            hasError = true;
          }
        });
        
        if (!hasError) {
          message.error('Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.');
        }
      } else if (err.request) {
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else {
        message.error('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
      }
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
          maxWidth: 450, 
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
            Tạo tài khoản mới để bắt đầu mua sắm
          </Text>
        </div>

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
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>

          <Form.Item 
            name="email" 
            label="Email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Nhập email"
            />
          </Form.Item>

          <Form.Item 
            name="first_name" 
            label="Họ" 
            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
          >
            <Input placeholder="Nhập họ" />
          </Form.Item>

          <Form.Item 
            name="last_name" 
            label="Tên" 
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item 
            name="password" 
            label="Mật khẩu" 
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item 
            name="password2" 
            label="Xác nhận mật khẩu" 
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Xác nhận mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              style={{ 
                height: '45px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Đăng ký
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;