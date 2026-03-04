import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  DatePicker
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CameraOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../api/AuthAxios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAxios.get('user/profile/');
      setProfile(response.data);
      setAvatarUrl(response.data.avatar_url);
      
      // Set form values
      form.setFieldsValue({
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number,
        date_of_birth: response.data.date_of_birth ? dayjs(response.data.date_of_birth) : null
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Không thể tải thông tin cá nhân');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'date_of_birth' && values[key]) {
            formData.append(key, values[key].format('YYYY-MM-DD'));
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      const response = await authAxios.patch('user/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
      setAvatarUrl(response.data.avatar_url);
      message.success('Cập nhật thông tin thành công!');
      
      // Trigger reload user info in Navigation
      console.log('Dispatching user-updated event from handleSubmit');
      window.dispatchEvent(new Event('user-updated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await authAxios.patch('user/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAvatarUrl(response.data.avatar_url);
      setProfile(response.data);
      message.success('Cập nhật ảnh đại diện thành công!');
      
      // Trigger reload user info in Navigation
      console.log('Dispatching user-updated event from handleAvatarUpload');
      console.log('New avatar URL:', response.data.avatar_url);
      window.dispatchEvent(new Event('user-updated'));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('Không thể tải lên ảnh đại diện');
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file ảnh!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    return true;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <Title level={2}>
        <UserOutlined /> Thông tin cá nhân
      </Title>

      <Row gutter={[24, 24]}>
        {/* Avatar Section */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={150}
                icon={<UserOutlined />}
                src={avatarUrl}
                style={{ marginBottom: '20px' }}
              />
              <Upload
                beforeUpload={beforeUpload}
                customRequest={({ file }) => handleAvatarUpload(file)}
                showUploadList={false}
              >
                <Button
                  icon={<CameraOutlined />}
                  loading={uploading}
                  block
                >
                  Đổi ảnh đại diện
                </Button>
              </Upload>
              
              <Divider />
              
              <div style={{ textAlign: 'left' }}>
                <Text type="secondary">Tên đăng nhập</Text>
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>{profile?.username}</Text>
                </div>
                
                <Text type="secondary">Ngày tham gia</Text>
                <div>
                  <Text strong>
                    {profile?.date_joined ? dayjs(profile.date_joined).format('DD/MM/YYYY') : '-'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Form Section */}
        <Col xs={24} md={16}>
          <Card title="Chỉnh sửa thông tin">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ"
                    name="first_name"
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập họ"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên"
                    name="last_name"
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập tên"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email"
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone_number"
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="date_of_birth"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '30px' }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    onClick={() => navigate('/orders')}
                    size="large"
                  >
                    Xem đơn hàng
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
