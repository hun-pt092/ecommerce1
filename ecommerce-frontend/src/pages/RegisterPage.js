import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Typography, Divider, Checkbox, Modal, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, FileTextOutlined, PhoneOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import logoImage from '../logo (2).png';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

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
      
      // Thêm ngày sinh nếu có
      if (values.date_of_birth) {
        registerData.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
      }
      
      // Thêm số điện thoại nếu có
      if (values.phone_number) {
        registerData.phone_number = values.phone_number;
      }
      
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
          <div style={{ marginBottom: '16px' }}>
            <img src={logoImage} alt="PKA Shop" style={{ height: '50px' }} />
          </div>
          <Title level={2} style={{ color: '#06131fff', marginBottom: '8px' }}>
            PKA
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

          <Divider style={{ margin: '16px 0' }}>
            <span style={{ color: '#999', fontSize: '14px' }}>
              <GiftOutlined /> Thông tin tùy chọn (để nhận ưu đãi sinh nhật)
            </span>
          </Divider>

          <Form.Item 
            name="date_of_birth" 
            label={
              <span>
                Ngày sinh 
                <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                  (Nhận mã giảm giá 20% vào sinh nhật! 🎂)
                </span>
              </span>
            }
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Chọn ngày sinh"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item 
            name="phone_number" 
            label="Số điện thoại"
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Nhập số điện thoại (tùy chọn)"
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

          <Form.Item 
            name="agree_terms" 
            valuePropName="checked"
            rules={[
              { 
                required: true, 
                transform: (value) => value || undefined,
                type: 'boolean', 
                message: 'Bạn phải đồng ý với điều khoản để tiếp tục!' 
              }
            ]}
          >
            <Checkbox>
              Tôi đồng ý với{' '}
              <Button 
                type="link" 
                style={{ padding: 0, fontSize: 'inherit' }}
                onClick={() => setIsTermsModalVisible(true)}
              >
                Điều khoản dịch vụ và Chính sách bảo mật
              </Button>
            </Checkbox>
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

      {/* Terms of Service Modal */}
      <Modal
        title={
          <span>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            Điều khoản dịch vụ và Chính sách bảo mật
          </span>
        }
        visible={isTermsModalVisible}
        onOk={() => setIsTermsModalVisible(false)}
        onCancel={() => setIsTermsModalVisible(false)}
        width={800}
        okText="Đã hiểu"
        cancelText="Đóng"
        bodyStyle={{ maxHeight: '500px', overflowY: 'auto' }}
      >
        <div style={{ lineHeight: '1.8' }}>
          <Typography.Title level={4} style={{ color: '#1890ff', marginTop: '20px' }}>
            📋 Điều khoản sử dụng
          </Typography.Title>
          
          <Typography.Paragraph>
            <Typography.Text strong>1. Chấp nhận điều khoản:</Typography.Text><br />
            Khi sử dụng PKA Shop, bạn đồng ý tuân thủ tất cả các điều khoản và điều kiện được nêu trong tài liệu này.
          </Typography.Paragraph>

          <Typography.Paragraph>
            <Typography.Text strong>2. Tài khoản người dùng:</Typography.Text><br />
            • Bạn có trách nhiệm bảo mật thông tin tài khoản<br />
            • Không chia sẻ tài khoản với người khác<br />
            • Thông báo ngay khi phát hiện tài khoản bị xâm phạm
          </Typography.Paragraph>

          <Typography.Paragraph>
            <Typography.Text strong>3. Quyền và nghĩa vụ:</Typography.Text><br />
            • Cung cấp thông tin chính xác khi đăng ký<br />
            • Không sử dụng dịch vụ cho mục đích bất hợp pháp<br />
            • Tôn trọng quyền sở hữu trí tuệ của PKA Shop
          </Typography.Paragraph>

          <Typography.Title level={4} style={{ color: '#52c41a', marginTop: '20px' }}>
            🔒 Chính sách bảo mật
          </Typography.Title>

          <Typography.Paragraph>
            <Typography.Text strong>Thu thập thông tin:</Typography.Text><br />
            Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ tốt nhất cho bạn.
          </Typography.Paragraph>

          <Typography.Paragraph>
            <Typography.Text strong>Bảo vệ dữ liệu:</Typography.Text><br />
            • Mã hóa thông tin cá nhân<br />
            • Không chia sẻ với bên thứ ba không được phép<br />
            • Tuân thủ các quy định bảo mật quốc tế
          </Typography.Paragraph>

          <Typography.Paragraph>
            <Typography.Text strong>Quyền của bạn:</Typography.Text><br />
            • Xem và cập nhật thông tin cá nhân<br />
            • Yêu cầu xóa tài khoản<br />
            • Từ chối nhận email marketing
          </Typography.Paragraph>

          <Typography.Title level={4} style={{ color: '#fa8c16', marginTop: '20px' }}>
            📞 Liên hệ
          </Typography.Title>

          <Typography.Paragraph>
            Nếu có thắc mắc về điều khoản này, vui lòng liên hệ:<br />
            📧 Email: support@fashionstore.com<br />
            📞 Hotline: 1900 xxxx<br />
            📍 Địa chỉ: 123 Đường ABC, Quận 1, TP.HaNoi
          </Typography.Paragraph>

          <Typography.Paragraph style={{ 
            background: '#f0f2f5', 
            padding: '12px', 
            borderRadius: '4px',
            marginTop: '20px'
          }}>
            <Typography.Text type="secondary">
              Điều khoản này có hiệu lực từ ngày 01/01/2025. PKA Shop có quyền cập nhật 
              điều khoản này và sẽ thông báo trước cho người dùng.
            </Typography.Text>
          </Typography.Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;