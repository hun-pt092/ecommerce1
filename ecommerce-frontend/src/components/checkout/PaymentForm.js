import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Radio, 
  Button, 
  Row, 
  Col, 
  Typography,
  Space,
  Divider,
  Input,
  Alert
} from 'antd';
import { 
  CreditCardOutlined, 
  ArrowLeftOutlined, 
  CheckCircleOutlined,
  BankOutlined,
  MobileOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PaymentForm = ({ cartData, shippingAddress, onSubmit, onPrevious, loading }) => {
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Calculate totals
  const calculateSubTotal = () => {
    if (!cartData?.items) return 0;
    return cartData.items.reduce((sum, item) => {
      const price = item.product_variant?.product?.discount_price || 
                    item.product_variant?.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const shippingFee = 30000;
  const subTotal = calculateSubTotal();
  const totalAmount = subTotal + shippingFee;

  const handleSubmit = (values) => {
    console.log('PaymentForm handleSubmit called with:', values);
    console.log('Current paymentMethod:', paymentMethod);
    
    const paymentData = {
      method: paymentMethod,
      details: values,
      notes: values.notes || ''
    };
    
    console.log('Calling onSubmit with:', paymentData);
    onSubmit(paymentData);
  };

  const paymentMethods = [
    {
      key: 'cod',
      title: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận được sản phẩm',
      icon: <DollarOutlined style={{ color: '#52c41a' }} />,
      available: true
    },
    {
      key: 'bank_transfer',
      title: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản trực tiếp qua số tài khoản ngân hàng',
      icon: <BankOutlined style={{ color: '#1890ff' }} />,
      available: true
    },
    {
      key: 'momo',
      title: 'Ví điện tử MoMo',
      description: 'Thanh toán qua ứng dụng MoMo',
      icon: <MobileOutlined style={{ color: '#d63384' }} />,
      available: false
    },
    {
      key: 'credit_card',
      title: 'Thẻ tín dụng/Ghi nợ',
      description: 'Thanh toán qua thẻ Visa, Mastercard, JCB',
      icon: <CreditCardOutlined style={{ color: '#fa8c16' }} />,
      available: false
    }
  ];

  const renderPaymentDetails = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return (
          <Card size="small" style={{ marginTop: '16px', background: '#f6ffed' }}>
            <Title level={5} style={{ marginBottom: '12px' }}>
              Thông tin chuyển khoản:
            </Title>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Ngân hàng: </Text>
              <Text>MBbank</Text>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Số tài khoản: </Text>
              <Text copyable>0342176457</Text>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Chủ tài khoản: </Text>
              <Text>FASHION STORE COMPANY</Text>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Nội dung chuyển khoản: </Text>
              <Text copyable>FASHIONSTORE {Date.now()}</Text>
            </div>
            <Alert
              message="Lưu ý quan trọng"
              description="Vui lòng chuyển khoản đúng nội dung và liên hệ hotline 1900-xxxx sau khi chuyển khoản để xác nhận đơn hàng."
              type="warning"
              showIcon
              size="small"
            />
          </Card>
        );
      
      case 'cod':
        return (
          <Card size="small" style={{ marginTop: '16px', background: '#f6ffed' }}>
            <Alert
              message="Thanh toán khi nhận hàng"
              description="Bạn sẽ thanh toán bằng tiền mặt cho shipper khi nhận được sản phẩm. Vui lòng chuẩn bị đủ tiền lẻ."
              type="success"
              showIcon
              size="small"
            />
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Card 
          title={
            <Space>
              <CreditCardOutlined />
              <span>Phương thức thanh toán</span>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="payment_method"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
            >
              <Radio.Group 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <div style={{ display: 'grid', gap: '12px' }}>
                  {paymentMethods.map(method => (
                    <Card 
                      key={method.key}
                      size="small"
                      style={{
                        border: paymentMethod === method.key ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        opacity: method.available ? 1 : 0.5,
                        cursor: method.available ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => method.available && setPaymentMethod(method.key)}
                    >
                      <Radio 
                        value={method.key} 
                        disabled={!method.available}
                        style={{ width: '100%' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                          <div style={{ marginRight: '12px', fontSize: '20px' }}>
                            {method.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                              {method.title}
                              {!method.available && (
                                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                                  (Sắp ra mắt)
                                </Text>
                              )}
                            </div>
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {method.description}
                            </Text>
                          </div>
                        </div>
                      </Radio>
                    </Card>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>

            {renderPaymentDetails()}

            <Divider />

            <Form.Item
              name="notes"
              label="Ghi chú đơn hàng (không bắt buộc)"
            >
              <TextArea 
                rows={3}
                placeholder="Ghi chú thêm về đơn hàng..."
                maxLength={200}
                showCount
              />
            </Form.Item>

            {/* Form Actions */}
            <div style={{ marginTop: '24px' }}>
              <Space>
                <Button 
                  icon={<ArrowLeftOutlined />}
                  onClick={onPrevious}
                >
                  Quay lại
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<CheckCircleOutlined />}
                  loading={loading}
                  size="large"
                >
                  Đặt hàng ngay
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Col>

      {/* Order Summary */}
      <Col xs={24} lg={8}>
        <Card title="Tóm tắt thanh toán">
          {/* Shipping Address */}
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ marginBottom: '8px' }}>
              📍 Địa chỉ giao hàng:
            </Title>
            <Text strong style={{ display: 'block', marginBottom: '4px' }}>
              {shippingAddress?.full_name}
            </Text>
            <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
              {shippingAddress?.phone_number}<br/>
              {shippingAddress?.full_address}
            </Text>
          </div>

          <Divider />

          {/* Price Breakdown */}
          <div style={{ marginBottom: '16px' }}>
            <Row justify="space-between" style={{ marginBottom: '8px' }}>
              <Text>Tạm tính ({cartData?.items?.length || 0} sản phẩm):</Text>
              <Text strong>{subTotal.toLocaleString()}₫</Text>
            </Row>
            
            <Row justify="space-between" style={{ marginBottom: '8px' }}>
              <Text>Phí vận chuyển:</Text>
              <Text strong>{shippingFee.toLocaleString()}₫</Text>
            </Row>
          </div>
          
          <Divider />
          
          <Row justify="space-between" style={{ marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>Tổng thanh toán:</Title>
            <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
              {totalAmount.toLocaleString()}₫
            </Title>
          </Row>

          <Alert
            message="Cam kết của chúng tôi"
            description="✓ Giao hàng trong 1-3 ngày làm việc ✓ Hỗ trợ đổi trả trong 7 ngày ✓ Bảo hành chính hãng"
            type="info"
            showIcon
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );
};

export default PaymentForm;