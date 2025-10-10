import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Badge, 
  Typography, 
  Space, 
  Divider, 
  Empty,
  Spin,
  Tag,
  Row,
  Col,
  message
} from 'antd';
import { 
  ShoppingOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../api/AuthAxios';

const { Title, Text } = Typography;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await authAxios.get('orders/my-orders/');
      setOrders(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'processing': 'blue',
      'shipped': 'cyan',
      'delivered': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'paid': 'green',
      'failed': 'red',
      'refunded': 'purple'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      'pending': 'Chờ thanh toán',
      'paid': 'Đã thanh toán',
      'failed': 'Thanh toán thất bại',
      'refunded': 'Đã hoàn tiền'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Bạn chưa có đơn hàng nào"
        >
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="ant-btn ant-btn-primary"
          >
            Bắt đầu mua sắm
          </button>
        </Empty>
      </Card>
    );
  }

  return (
    <div>
      <Title level={2}>Đơn hàng của bạn</Title>
      
      <List
        itemLayout="vertical"
        dataSource={orders}
        renderItem={(order) => (
          <Card 
            style={{ marginBottom: '16px' }}
            title={
              <Space>
                <ShoppingOutlined />
                <Text strong>Đơn hàng #{order.id}</Text>
              </Space>
            }
            extra={
              <Space>
                <Tag color={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Tag>
                <Tag color={getPaymentStatusColor(order.payment_status)}>
                  {getPaymentStatusText(order.payment_status)}
                </Tag>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size="small">
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">Ngày đặt:</Text>
                  </Space>
                  <Text>{new Date(order.created_at).toLocaleDateString('vi-VN')}</Text>
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size="small">
                  <Space>
                    <DollarOutlined />
                    <Text type="secondary">Tổng tiền:</Text>
                  </Space>
                  <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                    {parseFloat(order.total_price).toLocaleString('vi-VN')}đ
                  </Text>
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size="small">
                  <Space>
                    <UserOutlined />
                    <Text type="secondary">Người nhận:</Text>
                  </Space>
                  <Text>{order.shipping_name}</Text>
                </Space>
              </Col>
            </Row>

            {order.items && order.items.length > 0 && (
              <>
                <Divider />
                <Text strong>Sản phẩm:</Text>
                <List
                  dataSource={order.items}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0' }}>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text>{item.product_variant?.product?.name || 'Sản phẩm'}</Text>
                            <Text type="secondary">
                              ({item.product_variant?.color} - {item.product_variant?.size})
                            </Text>
                          </Space>
                        }
                        description={
                          <Space>
                            <Text>Số lượng: {item.quantity}</Text>
                            <Text>•</Text>
                            <Text>
                              Đơn giá: {parseFloat(item.price_per_item).toLocaleString('vi-VN')}đ
                            </Text>
                          </Space>
                        }
                      />
                      <Text strong>
                        {(parseFloat(item.price_per_item) * item.quantity).toLocaleString('vi-VN')}đ
                      </Text>
                    </List.Item>
                  )}
                />
              </>
            )}

            {order.shipping_address && (
              <>
                <Divider />
                <Text strong>Địa chỉ giao hàng:</Text>
                <br />
                <Text>{order.shipping_address}</Text>
                {order.shipping_city && <Text>, {order.shipping_city}</Text>}
                <br />
                <Text>SĐT: {order.phone_number}</Text>
              </>
            )}

            {order.notes && (
              <>
                <Divider />
                <Text strong>Ghi chú:</Text>
                <br />
                <Text italic>{order.notes}</Text>
              </>
            )}
          </Card>
        )}
      />
    </div>
  );
};

export default OrdersPage;