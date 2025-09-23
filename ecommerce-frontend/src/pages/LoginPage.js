import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: values.username,
        password: values.password,
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      message.success('Đăng nhập thành công!');
      navigate('/'); // chuyển về homepage
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // Server trả về response với status code khác 2xx
        if (err.response.status === 401) {
          message.error('Sai tên đăng nhập hoặc mật khẩu!');
        } else if (err.response.data) {
          // Hiển thị lỗi cụ thể từ server
          const errorData = err.response.data;
          if (errorData.detail) {
            message.error(errorData.detail);
          } else if (errorData.non_field_errors) {
            message.error(errorData.non_field_errors[0]);
          } else {
            message.error('Đăng nhập thất bại. Vui lòng thử lại.');
          }
        } else {
          message.error('Lỗi kết nối đến server');
        }
      } else if (err.request) {
        // Request được gửi nhưng không nhận được response
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else {
        // Lỗi khác
        message.error('Có lỗi xảy ra. Vui lòng thử lại.');
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: '10px'
        }}
        title={
          <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            Đăng nhập
          </div>
        }
      >
        <Form onFinish={onFinish} layout="vertical" size="large">
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
            name="password" 
            label="Mật khẩu" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập mật khẩu"
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
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
