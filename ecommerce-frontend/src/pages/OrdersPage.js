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
      const ordersData = response.data.results || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
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
        dataSource={Array.isArray(orders) ? orders : []}
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
                    <Text type="secondary">Thời gian đặt:</Text>
                  </Space>
                  <Text>{new Date(order.created_at).toLocaleDateString('vi-VN')}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(order.created_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </Text>
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size="small">
                  <Space>
                    <DollarOutlined />
                    <Text type="secondary">Tổng tiền:</Text>
                  </Space>
                  <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                    {parseFloat(order.total_price).toLocaleString('vi-VN')}₫
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ({order.total_items || order.items?.length || 0} sản phẩm)
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

            {/* Products List */}
            {order.items && order.items.length > 0 && (
              <>
                <Divider />
                <Text strong>Sản phẩm đã đặt:</Text>
                <List
                  dataSource={order.items}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0' }}>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text>{item.product_variant?.product_name || 'Sản phẩm'}</Text>
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
                              Đơn giá: {parseFloat(item.price_per_item).toLocaleString('vi-VN')}₫
                            </Text>
                          </Space>
                        }
                      />
                      <Text strong>
                        {(parseFloat(item.price_per_item) * item.quantity).toLocaleString('vi-VN')}₫
                      </Text>
                    </List.Item>
                  )}
                />
                
                {/* Price Breakdown */}
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                  {(() => {
                    const totalPrice = parseFloat(order.total_price);
                    const shippingFee = totalPrice >= 500000 ? 0 : 30000;
                    const subTotal = totalPrice - shippingFee;
                    
                    return (
                      <>
                        <Row justify="space-between" style={{ marginBottom: '4px' }}>
                          <Text>Tạm tính:</Text>
                          <Text>{subTotal.toLocaleString('vi-VN')}₫</Text>
                        </Row>
                        <Row justify="space-between" style={{ marginBottom: '4px' }}>
                          <Text>Phí vận chuyển:</Text>
                          <Text style={{ color: shippingFee === 0 ? '#52c41a' : undefined }}>
                            {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                          </Text>
                        </Row>
                        <Divider style={{ margin: '8px 0' }} />
                        <Row justify="space-between">
                          <Text strong>Tổng cộng:</Text>
                          <Text strong style={{ color: '#ff4d4f' }}>
                            {totalPrice.toLocaleString('vi-VN')}₫
                          </Text>
                        </Row>
                      </>
                    );
                  })()}
                </div>
              </>
            )}

            {/* Order Timeline */}
            <Divider />
            <Text strong>⏰ Thông tin thời gian:</Text>
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '6px', border: '1px solid #adc6ff' }}>
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <Text strong>Đặt hàng:</Text>
                  <br />
                  <Text style={{ fontSize: '13px' }}>
                    {new Date(order.created_at).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Lúc {new Date(order.created_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Text strong>Cập nhật cuối:</Text>
                  <br />
                  <Text style={{ fontSize: '13px' }}>
                    {new Date(order.updated_at).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Lúc {new Date(order.updated_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </Col>
              </Row>
              
              {/* Time since order */}
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d9d9d9' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  🕒 Đã đặt {(() => {
                    const orderTime = new Date(order.created_at);
                    const now = new Date();
                    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
                    const diffInHours = Math.floor(diffInMinutes / 60);
                    const diffInDays = Math.floor(diffInHours / 24);
                    
                    if (diffInDays > 0) {
                      return `${diffInDays} ngày trước`;
                    } else if (diffInHours > 0) {
                      return `${diffInHours} giờ trước`;
                    } else if (diffInMinutes > 0) {
                      return `${diffInMinutes} phút trước`;
                    } else {
                      return 'vừa xong';
                    }
                  })()}
                </Text>
              </div>
            </div>

            {/* Shipping Address */}
            <Divider />
            <Text strong>📍 Thông tin giao hàng:</Text>
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                {order.shipping_name}
              </Text>
              <Text style={{ display: 'block', marginBottom: '4px' }}>
                📞 {order.phone_number}
              </Text>
              <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                {order.shipping_address}
                {order.shipping_city && <><br/>{order.shipping_city}</>}
                {order.shipping_postal_code && <> - {order.shipping_postal_code}</>}
                {order.shipping_country && <><br/>{order.shipping_country}</>}
              </Text>
            </div>

            {/* Estimated Delivery */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <>
                <Divider />
                <Text strong>🚚 Dự kiến giao hàng:</Text>
                <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#fff7e6', borderRadius: '6px', border: '1px solid #ffd591' }}>
                  {(() => {
                    const orderDate = new Date(order.created_at);
                    const estimatedDelivery = new Date(orderDate);
                    
                    // Add estimated delivery days based on status
                    let deliveryDays = 3; // default
                    switch(order.status) {
                      case 'pending':
                        deliveryDays = 3;
                        break;
                      case 'processing':
                        deliveryDays = 2;
                        break;
                      case 'shipped':
                        deliveryDays = 1;
                        break;
                      default:
                        deliveryDays = 3;
                    }
                    
                    estimatedDelivery.setDate(orderDate.getDate() + deliveryDays);
                    
                    return (
                      <>
                        <Text>
                          {estimatedDelivery.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          (Trong vòng {deliveryDays} ngày làm việc từ khi đặt hàng)
                        </Text>
                      </>
                    );
                  })()}
                </div>
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