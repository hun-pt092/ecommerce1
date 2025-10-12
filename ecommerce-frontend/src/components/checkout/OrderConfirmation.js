import React from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col, 
  Typography,
  Space,
  Divider,
  Result,
  Timeline,
  Tag
} from 'antd';
import { 
  CheckCircleOutlined, 
  ShoppingOutlined,
  EyeOutlined,
  HomeOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const OrderConfirmation = ({ orderData, onContinueShopping, onViewOrders }) => {
  const getPaymentMethodText = (method) => {
    const methods = {
      'cod': 'Thanh toán khi nhận hàng',
      'bank_transfer': 'Chuyển khoản ngân hàng',
      'momo': 'Ví điện tử MoMo',
      'credit_card': 'Thẻ tín dụng/Ghi nợ'
    };
    return methods[method] || method;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'processing': 'cyan',
      'shipping': 'purple',
      'delivered': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statuses = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'processing': 'Đang xử lý',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statuses[status] || status;
  };

  return (
    <div>
      {/* Success Message */}
      <Result
        status="success"
        title="Đặt hàng thành công!"
        subTitle={
          <div>
            <Text>Mã đơn hàng: </Text>
            <Text strong>#{orderData?.id || orderData?.order_number}</Text>
            <br />
            <Text type="secondary">
              Cảm ơn bạn đã mua sắm tại Fashion Store. Chúng tôi sẽ liên hệ với bạn sớm nhất.
            </Text>
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            key="continue"
            icon={<ShoppingOutlined />}
            onClick={onContinueShopping}
          >
            Tiếp tục mua sắm
          </Button>,
          <Button 
            key="orders"
            icon={<EyeOutlined />}
            onClick={onViewOrders}
          >
            Xem đơn hàng
          </Button>
        ]}
      />

      <Row gutter={[24, 24]}>
        {/* Order Details */}
        <Col xs={24} lg={12}>
          <Card title="Chi tiết đơn hàng">
            <div style={{ marginBottom: '16px' }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
                <Text strong>Mã đơn hàng:</Text>
                <Text>#{orderData?.id || orderData?.order_number}</Text>
              </Row>
              
              <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
                <Text strong>Trạng thái:</Text>
                <Tag color={getStatusColor(orderData?.status)}>
                  {getStatusText(orderData?.status)}
                </Tag>
              </Row>
              
              <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
                <Text strong>Ngày đặt:</Text>
                <Text>
                  {orderData?.created_at ? 
                    new Date(orderData.created_at).toLocaleDateString('vi-VN') : 
                    new Date().toLocaleDateString('vi-VN')
                  }
                </Text>
              </Row>
              
              <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
                <Text strong>Phương thức thanh toán:</Text>
                <Text>{getPaymentMethodText('cod')}</Text>
              </Row>
              
              <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
                <Text strong>Trạng thái thanh toán:</Text>
                <Tag color={orderData?.payment_status === 'paid' ? 'green' : 'orange'}>
                  {orderData?.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Tag>
              </Row>
            </div>

            <Divider />

            <div>
              <Title level={5} style={{ marginBottom: '12px' }}>
                <DollarOutlined /> Thông tin thanh toán
              </Title>
              
              {/* Calculate subtotal and shipping fee */}
              {(() => {
                const totalPrice = orderData?.total_price || 0;
                const shippingFee = totalPrice >= 500000 ? 0 : 30000;
                const subTotal = totalPrice - shippingFee;
                
                return (
                  <>
                    <Row justify="space-between" style={{ marginBottom: '8px' }}>
                      <Text>Tạm tính ({orderData?.items?.length || 0} sản phẩm):</Text>
                      <Text>{subTotal.toLocaleString()}₫</Text>
                    </Row>
                    
                    <Row justify="space-between" style={{ marginBottom: '8px' }}>
                      <Text>Phí vận chuyển:</Text>
                      <Text style={{ color: shippingFee === 0 ? '#52c41a' : undefined }}>
                        {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}₫`}
                      </Text>
                    </Row>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Row justify="space-between">
                      <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
                      <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
                        {totalPrice.toLocaleString()}₫
                      </Title>
                    </Row>
                  </>
                );
              })()}
            </div>

            <Divider />

            {/* Products List */}
            <div>
              <Title level={5} style={{ marginBottom: '12px' }}>
                Sản phẩm đã đặt:
              </Title>
              {orderData?.items?.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < orderData.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div>
                    <Text strong>
                      {item.product_variant?.product_name || 'Sản phẩm'}
                    </Text>
                    <br/>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Size: {item.product_variant?.size} | 
                      Color: {item.product_variant?.color} | 
                      SL: {item.quantity}
                    </Text>
                  </div>
                  <Text strong>
                    {(item.price_per_item * item.quantity).toLocaleString()}₫
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Shipping & Timeline */}
        <Col xs={24} lg={12}>
          <Card title="Thông tin giao hàng">
            <div style={{ marginBottom: '16px' }}>
              <Title level={5} style={{ marginBottom: '8px' }}>
                <HomeOutlined /> Địa chỉ giao hàng:
              </Title>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                {orderData?.shipping_name}
              </Text>
              <Text style={{ display: 'block', marginBottom: '4px' }}>
                <PhoneOutlined /> {orderData?.phone_number}
              </Text>
              <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                {orderData?.shipping_address}
                {orderData?.shipping_city && <><br/>{orderData.shipping_city}</>}
                {orderData?.shipping_country && <><br/>{orderData.shipping_country}</>}
              </Text>
            </div>

            <Divider />

            <div>
              <Title level={5} style={{ marginBottom: '12px' }}>
                <CalendarOutlined /> Tiến trình đơn hàng:
              </Title>
              <Timeline size="small">
                <Timeline.Item 
                  color="green" 
                  dot={<CheckCircleOutlined />}
                >
                  <div>
                    <Text strong>Đặt hàng thành công</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date().toLocaleString('vi-VN')}
                    </Text>
                  </div>
                </Timeline.Item>
                
                <Timeline.Item color="blue">
                  <div>
                    <Text>Chờ xác nhận</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Đơn hàng đang được xem xét
                    </Text>
                  </div>
                </Timeline.Item>
                
                <Timeline.Item color="gray">
                  <div>
                    <Text type="secondary">Đóng gói</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Chuẩn bị sản phẩm
                    </Text>
                  </div>
                </Timeline.Item>
                
                <Timeline.Item color="gray">
                  <div>
                    <Text type="secondary">Giao hàng</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Ước tính 1-3 ngày làm việc
                    </Text>
                  </div>
                </Timeline.Item>
              </Timeline>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Next Steps */}
      <Card 
        title="Thông tin quan trọng"
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <PhoneOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <Title level={5} style={{ margin: '0 0 4px 0' }}>Liên hệ hỗ trợ</Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Hotline: 1900-xxxx<br/>
                Email: support@fashionstore.com
              </Text>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <EyeOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <Title level={5} style={{ margin: '0 0 4px 0' }}>Theo dõi đơn hàng</Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Xem tình trạng đơn hàng<br/>
                trong mục "Đơn hàng của tôi"
              </Text>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
              <Title level={5} style={{ margin: '0 0 4px 0' }}>Chính sách đổi trả</Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Hỗ trợ đổi trả trong 7 ngày<br/>
                kể từ ngày nhận hàng
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OrderConfirmation;