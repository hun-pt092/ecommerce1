import React, { useState, useEffect } from 'react';
import '../../admin.css';
import { Card, Row, Col, Statistic, Typography, Space, Button, List, Tag, Table } from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  OrderedListOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import apiClient from '../../api/apiClient';

const { Title } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    ordersToday: 0,
    usersToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const [statsResponse, ordersResponse, usersResponse] = await Promise.all([
        apiClient.get('/dashboard/statistics/'),
        apiClient.get('/admin/orders/?limit=4&ordering=-created_at'),
        apiClient.get('/users/?limit=4&ordering=-date_joined'),
      ]);

      const data = statsResponse.data;
      setStatistics({
        products: data.total_products || 0,  // Tổng sản phẩm (variants)
        productTypes: data.total_product_types || 0,  // Tổng loại sản phẩm
        orders: data.total_orders || 0,
        users: data.total_users || 0,
        revenue: data.total_revenue || 0,
        monthlyRevenue: data.monthly_revenue || 0,
        monthlyOrders: data.monthly_orders || 0,
        ordersToday: data.today_orders || 0,
        usersToday: data.today_users || 0,
      });
      // Ensure arrays for Table components
      const ordersData = ordersResponse.data.results || ordersResponse.data || [];
      const usersData = usersResponse.data.results || usersResponse.data || [];
      
      console.log('Orders data length:', ordersData.length);
      console.log('Users data length:', usersData.length);
      
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 6) : []);
      setRecentUsers(Array.isArray(usersData) ? usersData.slice(0, 3) : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API calls fail
      setStatistics({
        products: 0,
        productTypes: 0,
        orders: 0,
        users: 0,
        revenue: 0,
        monthlyRevenue: 0,
        monthlyOrders: 0,
        ordersToday: 0,
        usersToday: 0,
      });
      // Eupnsure empty arrays for Tables
      setRecentOrders([]);
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const recentOrderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`,
      width: 100,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'username'],
      key: 'customer',
      width: 120,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (amount) => `${Number(amount).toLocaleString()} VND`,
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusLabels = {
          pending: 'Chờ xử lý',
          confirmed: 'Đã xác nhận',
          shipped: 'Đang giao',
          delivered: 'Đã giao',
          cancelled: 'Đã hủy',
        };
        return (
          <Tag color={getStatusColor(status)}>
            {statusLabels[status] || status}
          </Tag>
        );
      },
      width: 100,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => format(new Date(date), 'dd/MM HH:mm'),
      width: 100,
    },
  ];

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        padding: '32px',
        marginBottom: '24px',
        borderRadius: '12px',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', margin: 0, fontSize: '32px' }}>
          Dashboard Quản Trị
        </Title>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
          Tổng quan hoạt động kinh doanh và quản lý hệ thống
        </p>
      </div>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <Card 
            hoverable
            onClick={() => navigate('/admin/products/list')}
            style={{ 
              cursor: 'pointer',
              borderLeft: '4px solid #3f8600',
              background: 'linear-gradient(135deg, #f6ffed 0%, #f6ffed 100%)'
            }}
          >
            <Statistic
              title="Tổng sản phẩm"
              value={statistics.products}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            hoverable
            onClick={() => navigate('/admin/products/list')}
            style={{ 
              cursor: 'pointer',
              borderLeft: '4px solid #722ed1',
              background: 'linear-gradient(135deg, #f9f0ff 0%, #f9f0ff 100%)'
            }}
          >
            <Statistic
              title="Loại sản phẩm"
              value={statistics.productTypes}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={5}>
          <Card 
            hoverable
            onClick={() => navigate('/admin/orders')}
            style={{ 
              cursor: 'pointer',
              borderLeft: '4px solid #1890ff',
              background: 'linear-gradient(135deg, #e6f7ff 0%, #e6f7ff 100%)'
            }}
          >
            <Statistic
              title="Tổng đơn hàng"
              value={statistics.orders}
              prefix={<OrderedListOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Hôm nay: {statistics.ordersToday}
                </span>
                <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              </Space>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={5}>
          <Card 
            hoverable
            onClick={() => navigate('/admin/users')}
            style={{ 
              cursor: 'pointer',
              borderLeft: '4px solid #ff7a45',
              background: 'linear-gradient(135deg, #fff2e8 0%, #fff2e8 100%)'
            }}
          >
            <Statistic
              title="Tổng khách hàng"
              value={statistics.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#ff7a45' }}
              loading={loading}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Hôm nay: {statistics.usersToday}
                </span>
                <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              </Space>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ 
              borderLeft: '4px solid #52c41a',
              background: 'linear-gradient(135deg, #f6ffed 0%, #f6ffed 100%)'
            }}
          >
            <Statistic
              title="Doanh thu tháng này"
              value={statistics.monthlyRevenue}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Tổng: {Number(statistics.revenue).toLocaleString()} VND
                </span>
                <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card 
            title="Đơn hàng gần đây"
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/admin/orders')}
                icon={<EyeOutlined />}
              >
                Xem tất cả
              </Button>
            }
          >
            <Table
              columns={recentOrderColumns}
              dataSource={recentOrders.slice(0, 5)}
              loading={loading}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: 'Chưa có đơn hàng nào' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Card 
            title="Khách hàng mới"
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/admin/users')}
                icon={<EyeOutlined />}
              >
                Xem tất cả
              </Button>
            }
          >
            <List
              loading={loading}
              dataSource={recentUsers.slice(0, 3)}
              locale={{ emptyText: 'Chưa có khách hàng mới' }}
              renderItem={user => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        backgroundColor: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {user.username?.charAt(0)?.toUpperCase()}
                      </div>
                    }
                    title={user.username}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{user.email}</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {format(new Date(user.date_joined), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </Space>
                    }
                  />
                  <Tag color={user.is_active ? 'green' : 'red'}>
                    {user.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
     
    </div>
  );
};

export default AdminDashboard;