import React, { useState, useEffect, useCallback } from 'react';
import '../../admin.css';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Descriptions,
  Typography,
  message,
  Input,
  DatePicker,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { format as formatDate } from 'date-fns';
import apiClient from '../../api/apiClient';

const { Title } = Typography;
const { Option } = Select;
    const { Search } = Input;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    search: '',
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [form] = Form.useForm();

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: 'orange' },
    { value: 'processing', label: 'Đã xác nhận', color: 'blue' },
    { value: 'shipped', label: 'Đang giao', color: 'purple' },
    { value: 'delivered', label: 'Đã giao', color: 'green' },
    { value: 'cancelled', label: 'Đã hủy', color: 'red' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Chờ thanh toán', color: 'orange' },
    { value: 'paid', label: 'Đã thanh toán', color: 'green' },
    { value: 'failed', label: 'Thất bại', color: 'red' },
    { value: 'refunded', label: 'Đã hoàn tiền', color: 'blue' },
  ];

  const fetchOrdersCallback = useCallback(() => {
    fetchOrders();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchOrdersCallback();
  }, [fetchOrdersCallback, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.search) params.append('search', filters.search);
      params.append('page_size', '100'); // Đảm bảo lấy đủ tất cả đơn hàng

      const response = await apiClient.get(`/admin/orders/?${params.toString()}`);
      const ordersData = response.data.results || response.data || [];
      console.log('Total orders loaded:', ordersData.length); // Debug log
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/admin/orders/statistics/');
      const data = response.data;
      setStatistics({
        total: data.total_orders || 0,
        pending: data.status_breakdown?.pending || 0,
        confirmed: data.status_breakdown?.processing || 0,
        shipped: data.status_breakdown?.shipped || 0,
        delivered: data.status_breakdown?.delivered || 0,
        cancelled: data.status_breakdown?.cancelled || 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Set default values if API fails
      setStatistics({
        total: 0,
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      });
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      status: order.status,
      payment_status: order.payment_status,
      notes: order.notes || '',
    });
    setStatusModalVisible(true);
  };

  const handleStatusUpdate = async (values) => {
    try {
      await apiClient.patch(`/admin/orders/${selectedOrder.id}/status/`, values);
      message.success('Cập nhật trạng thái thành công');
      setStatusModalVisible(false);
      fetchOrders();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const getPaymentStatusColor = (status) => {
    const statusOption = paymentStatusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const columns = [
    {
      title: 'Đơn hàng #',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`,
      width: 90,
    },
    {
      title: 'Sản phẩm / Mặt hàng',
      key: 'products',
      width: 280,
      render: (_, record) => {
        const items = record.items || [];
        if (!Array.isArray(items) || items.length === 0) {
          return <span style={{ color: '#999' }}>Không có sản phẩm</span>;
        }
        
        return (
          <div>
            {items.slice(0, 2).map((item, index) => (
              <div key={index} style={{ marginBottom: '6px', borderBottom: index === 0 && items.length > 1 ? '1px solid #f0f0f0' : 'none', paddingBottom: '4px' }}>
                <div style={{ fontWeight: 600, color: '#1890ff', fontSize: '13px' }}>
                  {item.product_variant?.product_name || 'Sản phẩm không xác định'}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  <span style={{ background: '#f6f6f6', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                    SL: {item.quantity}
                  </span>
                  {item.product_variant?.size && (
                    <span style={{ background: '#e6f7ff', color: '#1890ff', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '10px' }}>
                      {item.product_variant.size}
                    </span>
                  )}
                  {item.product_variant?.color && (
                    <span style={{ background: '#f6ffed', color: '#52c41a', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '10px' }}>
                      {item.product_variant.color}
                    </span>
                  )}
                  <span style={{ color: '#52c41a', fontWeight: 500 }}>
                    {Number(item.price_per_item || 0).toLocaleString()} VND
                  </span>
                </div>
              </div>
            ))}
            {items.length > 2 && (
              <div style={{ fontSize: '12px', color: '#1890ff', fontStyle: 'italic', marginTop: '4px' }}>
                <Button type="link" size="small" style={{ padding: 0, height: 'auto' }}>
                  +{items.length - 2} sản phẩm khác →
                </Button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1890ff', fontSize: '13px' }}>
            @{record.user?.username || 'N/A'}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            {record.user?.email || 'Không có email'}
          </div>
          {record.user?.first_name || record.user?.last_name ? (
            <div style={{ fontSize: '11px', color: '#52c41a', marginTop: '1px' }}>
              {record.user?.first_name} {record.user?.last_name}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (amount) => {
        if (!amount || isNaN(amount)) return '0 VND';
        return `${Number(amount).toLocaleString()} VND`;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return (
          <Tag color={getStatusColor(status)}>
            {statusOption ? statusOption.label : status}
          </Tag>
        );
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => {
        const statusOption = paymentStatusOptions.find(opt => opt.value === status);
        return (
          <Tag color={getPaymentStatusColor(status)}>
            {statusOption ? statusOption.label : status}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(new Date(date), 'dd/MM/yyyy HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const isCompleted = record.status === 'delivered' || record.status === 'cancelled';
        const isPending = record.status === 'pending';
        const isConfirmed = record.status === 'confirmed';
        
        return (
          <Space size="small" direction="vertical">
            <Space size="small">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewOrder(record)}
                style={{ background: '#1890ff' }}
              >
                Xem
              </Button>
              {!isCompleted && (
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleUpdateStatus(record)}
                  style={{ 
                    background: isPending ? '#faad14' : isConfirmed ? '#52c41a' : '#d9d9d9',
                    borderColor: isPending ? '#faad14' : isConfirmed ? '#52c41a' : '#d9d9d9',
                    color: 'white'
                  }}
                >
                  {isPending ? 'Xử lý' : isConfirmed ? 'Giao hàng' : 'Cập nhật'}
                </Button>
              )}
            </Space>
            {isCompleted && (
              <Tag color={record.status === 'delivered' ? 'green' : 'red'} style={{ margin: 0 }}>
                {record.status === 'delivered' ? 'Hoàn thành' : 'Đã hủy'}
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
        padding: '24px',
        marginBottom: '24px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          <FileTextOutlined /> Quản lý đơn hàng
        </Title>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Theo dõi và xử lý các đơn hàng trong hệ thống
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={statistics.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={statistics.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={statistics.confirmed}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Đang giao"
              value={statistics.shipped}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Đã giao"
              value={statistics.delivered}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={statistics.cancelled}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Select
              placeholder="Trạng thái đơn hàng"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Select
              placeholder="Trạng thái thanh toán"
              style={{ width: '100%' }}
              value={filters.payment_status}
              onChange={(value) => setFilters({ ...filters, payment_status: value })}
              allowClear
            >
              {paymentStatusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={Array.isArray(orders) ? orders : []}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng">
                #{selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {formatDate(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.user?.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.phone || 'Chưa cung cấp'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.address || 'Chưa cung cấp'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {statusOptions.find(opt => opt.value === selectedOrder.status)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color={getPaymentStatusColor(selectedOrder.payment_status)}>
                  {paymentStatusOptions.find(opt => opt.value === selectedOrder.payment_status)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <strong style={{ fontSize: '16px', color: '#f5222d' }}>
                  {selectedOrder.total_price ? Number(selectedOrder.total_price).toLocaleString() : '0'} VND
                </strong>
              </Descriptions.Item>
              {selectedOrder.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedOrder.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Order Items */}
            <Title level={4} style={{ marginTop: 24 }}>
              Danh sách sản phẩm ({(selectedOrder.order_items || []).length} sản phẩm)
            </Title>
            <Table
              dataSource={Array.isArray(selectedOrder.order_items) ? selectedOrder.order_items : []}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Hình ảnh',
                  key: 'image',
                  width: 80,
                  render: (_, record) => (
                    <img
                      src={record.product?.image || '/images/no-image.png'}
                      alt={record.product?.name || 'Product'}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                      onError={(e) => {
                        e.target.src = '/images/no-image.png';
                      }}
                    />
                  ),
                },
                {
                  title: 'Tên sản phẩm',
                  key: 'product_name',
                  render: (_, record) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {record.product?.name || 'Sản phẩm không xác định'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Mã SP: #{record.product?.id || 'N/A'}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'price',
                  key: 'price',
                  width: 120,
                  render: (price) => `${Number(price || 0).toLocaleString()} VND`,
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 80,
                  align: 'center',
                },
                {
                  title: 'Thành tiền',
                  key: 'total',
                  width: 120,
                  align: 'right',
                  render: (_, record) => (
                    <strong style={{ color: '#f5222d' }}>
                      {((Number(record.price) || 0) * (Number(record.quantity) || 0)).toLocaleString()} VND
                    </strong>
                  ),
                },
              ]}
              rowKey={(record, index) => record.id || index}
            />
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title={`Cập nhật trạng thái đơn hàng #${selectedOrder?.id}`}
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
        >
          <Form.Item
            name="status"
            label="Trạng thái đơn hàng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_status"
            label="Trạng thái thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái thanh toán' }]}
          >
            <Select placeholder="Chọn trạng thái thanh toán">
              {paymentStatusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setStatusModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagement;