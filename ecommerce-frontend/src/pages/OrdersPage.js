import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table,
  Typography, 
  Space, 
  Divider, 
  Empty,
  Spin,
  Tag,
  Row,
  Col,
  message,
  Button,
  Modal,
  List,
  Descriptions
} from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ShoppingOutlined,
  CalendarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../api/AuthAxios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Title, Text } = Typography;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
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
      'pending': 'Chưa thanh toán',
      'paid': 'Đã thanh toán',
      'failed': 'Thanh toán thất bại',
      'refunded': 'Đã hoàn tiền'
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'COD': 'Thanh toán khi nhận hàng',
      'bank_transfer': 'Chuyển khoản',
      'credit_card': 'Thẻ tín dụng',
      'e_wallet': 'Ví điện tử'
    };
    return methods[method] || method;
  };

  const formatRelativeTime = (dateString) => {
    const orderTime = new Date(dateString);
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
      return 'Vừa xong';
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setCancelModalVisible(true);
  };

  const confirmCancelOrder = async () => {
    try {
      const response = await authAxios.post(`orders/${orderToCancel}/cancel/`);
      message.success(response.data.message || 'Hủy đơn hàng thành công');
      
      // Cập nhật lại danh sách đơn hàng
      fetchOrders();
      
      // Nếu đang xem chi tiết đơn hàng này, cập nhật lại
      if (selectedOrder && selectedOrder.id === orderToCancel) {
        setSelectedOrder(response.data.order);
      }
      
      // Đóng modal
      setCancelModalVisible(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Error canceling order:', error);
      message.error(error.response?.data?.error || 'Không thể hủy đơn hàng');
    }
  };

  // Kiểm tra xem đơn hàng có thể hủy không (trong vòng 48 giờ và status phù hợp)
  const canCancelOrder = (order) => {
    // Chỉ cho phép hủy đơn pending hoặc processing
    if (order.status !== 'pending' && order.status !== 'processing') {
      return false;
    }
    
    // Kiểm tra thời gian đặt hàng (trong vòng 48 giờ)
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const hoursDiff = (now - orderTime) / (1000 * 60 * 60);
    
    // Cho phép hủy trong vòng 48 giờ
    return hoursDiff <= 48;
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <Text strong style={{ color: '#1890ff' }}>
          ORD-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}-{id.toString().padStart(6, '0').substring(0, 6).toUpperCase()}
        </Text>
      ),
      width: 180,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <div>
          <div>{format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatRelativeTime(date)}
          </Text>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => (
        <Text strong style={{ color: '#ff4d4f', fontSize: '15px' }}>
          {parseFloat(price).toLocaleString('vi-VN')}₫
        </Text>
      ),
      width: 130,
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      render: (_, record) => (
        <div>
          <div>{getPaymentMethodText(record.payment_method)}</div>
          <Tag 
            color={getPaymentStatusColor(record.payment_status)}
            style={{ marginTop: '4px' }}
          >
            {getPaymentStatusText(record.payment_status)}
          </Tag>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: '13px' }}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        return (
          <Space>
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size="small"
            >
              Xem
            </Button>
            {canCancelOrder(record) && (
              <Button 
                danger
                icon={<CloseCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelOrder(record.id);
                }}
                size="small"
              >
                Hủy
              </Button>
            )}
          </Space>
        );
      },
      width: 150,
      fixed: 'right',
    },
  ];

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
    <div style={{ 
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      minHeight: '100vh',
      padding: '24px'
    }}>
      <Title level={2} style={{ color: theme.textColor, marginBottom: '24px' }}>
        <ShoppingOutlined /> Đơn hàng của tôi
      </Title>
      
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết đơn hàng</span>
            {selectedOrder && (
              <Text strong style={{ color: '#1890ff' }}>
                ORD-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}-{selectedOrder.id.toString().padStart(6, '0').substring(0, 6).toUpperCase()}
              </Text>
            )}
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={[
          selectedOrder && canCancelOrder(selectedOrder) && (
            <Button 
              key="cancel"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                console.log('Cancel button in modal clicked for order:', selectedOrder.id);
                setDetailModalVisible(false);
                handleCancelOrder(selectedOrder.id);
              }}
            >
              Hủy đơn hàng
            </Button>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            {/* Order Status */}
            <Card 
              size="small" 
              style={{ marginBottom: '16px', backgroundColor: '#f0f5ff' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Trạng thái đơn hàng</Text>
                    <Tag color={getStatusColor(selectedOrder.status)} style={{ fontSize: '14px' }}>
                      {getStatusText(selectedOrder.status)}
                    </Tag>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Trạng thái thanh toán</Text>
                    <Tag color={getPaymentStatusColor(selectedOrder.payment_status)} style={{ fontSize: '14px' }}>
                      {getPaymentStatusText(selectedOrder.payment_status)}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Order Info */}
            <Descriptions bordered column={2} size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label={<><CalendarOutlined /> Ngày đặt</>} span={2}>
                {format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                  ({formatRelativeTime(selectedOrder.created_at)})
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label={<><CreditCardOutlined /> Phương thức thanh toán</>} span={2}>
                {getPaymentMethodText(selectedOrder.payment_method)}
              </Descriptions.Item>
            </Descriptions>

            {/* Shipping Info */}
            <Card 
              title={<><EnvironmentOutlined /> Thông tin giao hàng</>}
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>{selectedOrder.shipping_name}</Text>
                </div>
                <div>
                  <PhoneOutlined /> <Text>{selectedOrder.phone_number}</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {selectedOrder.shipping_address}
                    {selectedOrder.shipping_city && <>, {selectedOrder.shipping_city}</>}
                    {selectedOrder.shipping_postal_code && <>, {selectedOrder.shipping_postal_code}</>}
                    {selectedOrder.shipping_country && <>, {selectedOrder.shipping_country}</>}
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Products List */}
            <Card 
              title="Sản phẩm đã đặt"
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <List
                dataSource={selectedOrder.items || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <img 
                          src={item.product_variant?.image || '/placeholder-image.png'} 
                          alt={item.product_variant?.product_name || 'Sản phẩm'}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                          }}
                        />
                      }
                      title={
                        <div>
                          <Text strong>{item.product_variant?.product_name || 'Sản phẩm'}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            Màu: {item.product_variant?.color} | Size: {item.product_variant?.size}
                          </Text>
                        </div>
                      }
                      description={
                        <Space>
                          <Text>Số lượng: {item.quantity}</Text>
                          <Text>•</Text>
                          <Text>Đơn giá: {parseFloat(item.price_per_item).toLocaleString('vi-VN')}₫</Text>
                        </Space>
                      }
                    />
                    <Text strong style={{ color: '#ff4d4f' }}>
                      {(parseFloat(item.price_per_item) * item.quantity).toLocaleString('vi-VN')}₫
                    </Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* Price Summary */}
            <Card size="small" style={{ backgroundColor: '#fafafa' }}>
              {(() => {
                const totalPrice = parseFloat(selectedOrder.total_price);
                const discountAmount = parseFloat(selectedOrder.discount_amount || 0);
                const shippingFee = totalPrice >= 500000 ? 0 : 30000;
                const subTotal = totalPrice - shippingFee + discountAmount;
                
                return (
                  <>
                    <Row justify="space-between" style={{ marginBottom: '8px' }}>
                      <Text>Tạm tính:</Text>
                      <Text>{subTotal.toLocaleString('vi-VN')}₫</Text>
                    </Row>
                    
                    {discountAmount > 0 && (
                      <Row justify="space-between" style={{ marginBottom: '8px' }}>
                        <Text>Giảm giá voucher:</Text>
                        <Text style={{ color: '#52c41a' }}>
                          -{discountAmount.toLocaleString('vi-VN')}₫
                        </Text>
                      </Row>
                    )}
                    
                    <Row justify="space-between" style={{ marginBottom: '8px' }}>
                      <Text>Phí vận chuyển:</Text>
                      <Text style={{ color: shippingFee === 0 ? '#52c41a' : undefined }}>
                        {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                      </Text>
                    </Row>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Row justify="space-between">
                      <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                      <Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
                        {totalPrice.toLocaleString('vi-VN')}₫
                      </Text>
                    </Row>
                  </>
                );
              })()}
            </Card>

            {/* Notes */}
            {selectedOrder.notes && (
              <Card 
                size="small" 
                style={{ marginTop: '16px', backgroundColor: '#fffbe6' }}
              >
                <Text strong>Ghi chú:</Text>
                <br />
                <Text italic>{selectedOrder.notes}</Text>
              </Card>
            )}

            {/* Estimated Delivery */}
            {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
              <Card 
                size="small" 
                style={{ marginTop: '16px', backgroundColor: '#fff7e6' }}
              >
                <Space direction="vertical">
                  <Text strong><ClockCircleOutlined /> Dự kiến giao hàng:</Text>
                  <Text>
                    {(() => {
                      const orderDate = new Date(selectedOrder.created_at);
                      const estimatedDelivery = new Date(orderDate);
                      let deliveryDays = 3;
                      
                      switch(selectedOrder.status) {
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
                      
                      return format(estimatedDelivery, 'dd/MM/yyyy', { locale: vi });
                    })()}
                  </Text>
                </Space>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Xác nhận hủy đơn hàng</span>
          </Space>
        }
        open={cancelModalVisible}
        onOk={confirmCancelOrder}
        onCancel={() => {
          setCancelModalVisible(false);
          setOrderToCancel(null);
        }}
        okText="Hủy đơn hàng"
        cancelText="Không"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
        <p style={{ color: '#8c8c8c', fontSize: '14px' }}>
          Hành động này không thể hoàn tác. Số lượng sản phẩm sẽ được hoàn trả vào kho.
        </p>
      </Modal>
    </div>
  );
};

export default OrdersPage;
