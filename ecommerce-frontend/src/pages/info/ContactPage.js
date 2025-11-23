import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Row, Col, Typography, Space } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Contact form submitted:', values);
            message.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: theme.backgroundColor,
            padding: '40px 20px',
            color: theme.textColor
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <Title level={1} style={{ color: theme.textColor, marginBottom: '16px' }}>
                        Liên hệ với chúng tôi
                    </Title>
                    <Paragraph style={{ fontSize: '16px', color: theme.secondaryText }}>
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                    </Paragraph>
                </div>

                <Row gutter={[32, 32]}>
                    {/* Contact Form */}
                    <Col xs={24} lg={12}>
                        <Card
                            style={{
                                background: theme.cardBackground,
                                borderColor: theme.borderColor,
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            bodyStyle={{ padding: '32px' }}
                        >
                            <Title level={3} style={{ color: theme.textColor, marginBottom: '24px' }}>
                                Gửi tin nhắn cho chúng tôi
                            </Title>
                            
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                autoComplete="off"
                            >
                                <Form.Item
                                    label={<span style={{ color: theme.textColor }}>Họ và tên</span>}
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập họ tên!' },
                                        { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                                    ]}
                                >
                                    <Input 
                                        prefix={<UserOutlined />}
                                        placeholder="Nhập họ và tên của bạn"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: theme.textColor }}>Email</span>}
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
                                    label={<span style={{ color: theme.textColor }}>Số điện thoại</span>}
                                    name="phone"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                    ]}
                                >
                                    <Input 
                                        prefix={<PhoneOutlined />}
                                        placeholder="0123 456 789"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: theme.textColor }}>Nội dung</span>}
                                    name="message"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập nội dung!' },
                                        { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự!' }
                                    ]}
                                >
                                    <TextArea 
                                        rows={6}
                                        placeholder="Nhập nội dung bạn muốn gửi..."
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large"
                                        loading={loading}
                                        block
                                        style={{ 
                                            height: '48px',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Gửi tin nhắn
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>

                    {/* Contact Information */}
                    <Col xs={24} lg={12}>
                        <Card
                            style={{
                                background: theme.cardBackground,
                                borderColor: theme.borderColor,
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                marginBottom: '24px'
                            }}
                            bodyStyle={{ padding: '32px' }}
                        >
                            <Title level={3} style={{ color: theme.textColor, marginBottom: '24px' }}>
                                Thông tin liên hệ
                            </Title>

                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                {/* Address */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff', marginTop: '4px' }} />
                                    <div>
                                        <Text strong style={{ color: theme.textColor, fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                                            Địa chỉ
                                        </Text>
                                        <Text style={{ color: theme.secondaryText }}>
                                            123 Đường ABC, Quận 1, TP.HaNoi
                                        </Text>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <PhoneOutlined style={{ fontSize: '24px', color: '#1890ff', marginTop: '4px' }} />
                                    <div>
                                        <Text strong style={{ color: theme.textColor, fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                                            Điện thoại
                                        </Text>
                                        <Text style={{ color: theme.secondaryText }}>
                                            (028) 1234 5678
                                        </Text>
                                        <br />
                                        <Text style={{ color: theme.secondaryText }}>
                                            0123 456 789
                                        </Text>
                                    </div>
                                </div>

                                {/* Email */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <MailOutlined style={{ fontSize: '24px', color: '#1890ff', marginTop: '4px' }} />
                                    <div>
                                        <Text strong style={{ color: theme.textColor, fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                                            Email
                                        </Text>
                                        <Text style={{ color: theme.secondaryText }}>
                                            support@fashionstore.com
                                        </Text>
                                        <br />
                                        <Text style={{ color: theme.secondaryText }}>
                                            contact@fashionstore.com
                                        </Text>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <ClockCircleOutlined style={{ fontSize: '24px', color: '#1890ff', marginTop: '4px' }} />
                                    <div>
                                        <Text strong style={{ color: theme.textColor, fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                                            Giờ làm việc
                                        </Text>
                                        <Text style={{ color: theme.secondaryText }}>
                                            Thứ 2 - Thứ 7: 8:00 - 18:00
                                        </Text>
                                        <br />
                                        <Text style={{ color: theme.secondaryText }}>
                                            Chủ nhật: 8:00 - 12:00
                                        </Text>
                                    </div>
                                </div>
                            </Space>
                        </Card>

                        {/* Google Maps */}
                        <Card
                            style={{
                                background: theme.cardBackground,
                                borderColor: theme.borderColor,
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            bodyStyle={{ padding: '0' }}
                        >
                            <div style={{ 
                                width: '100%', 
                                height: '300px',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <iframe
                                    title="PKA Shop Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3203899625994!2d106.69999931533397!3d10.786983292313928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0xfd3b6a0e85e12c21!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1635000000000!5m2!1svi!2s"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Additional Info Section */}
                <Card
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderColor: 'transparent',
                        borderRadius: '12px',
                        marginTop: '32px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    bodyStyle={{ padding: '40px', textAlign: 'center' }}
                >
                    <Title level={3} style={{ color: 'white', marginBottom: '16px' }}>
                        Bạn cần hỗ trợ gấp?
                    </Title>
                    <Paragraph style={{ color: 'white', fontSize: '16px', marginBottom: '24px' }}>
                        Hãy gọi ngay cho chúng tôi hoặc chat trực tuyến với đội ngũ hỗ trợ 24/7
                    </Paragraph>
                    <Space size="large">
                        <Button 
                            size="large" 
                            style={{ 
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                height: '48px',
                                paddingLeft: '32px',
                                paddingRight: '32px',
                                fontWeight: '500'
                            }}
                            icon={<PhoneOutlined />}
                        >
                            Gọi ngay: 0123 456 789
                        </Button>
                        <Button 
                            size="large" 
                            style={{ 
                                background: 'transparent',
                                color: 'white',
                                borderColor: 'white',
                                height: '48px',
                                paddingLeft: '32px',
                                paddingRight: '32px',
                                fontWeight: '500'
                            }}
                            icon={<MailOutlined />}
                        >
                            Chat trực tuyến
                        </Button>
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export default ContactPage;
