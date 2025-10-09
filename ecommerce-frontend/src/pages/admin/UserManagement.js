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
  Input,
  Select,
  Switch,
  Typography,
  message,
  Avatar,
  Row,
  Col,
  Statistic,
  Descriptions,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { format as formatDate } from 'date-fns';
import apiClient from '../../api/apiClient';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    is_active: '',
    is_staff: '',
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    staff: 0,
    customers: 0,
  });

  const [form] = Form.useForm();

  const fetchUsersCallback = useCallback(() => {
    fetchUsers();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchUsersCallback();
  }, [fetchUsersCallback, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.is_active !== '') params.append('is_active', filters.is_active);
      if (filters.is_staff !== '') params.append('is_staff', filters.is_staff);

      const response = await apiClient.get(`/api/users/?${params.toString()}`);
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/api/users/statistics/');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
      is_staff: user.is_staff,
    });
    setModalVisible(true);
  };



  const handleSave = async (values) => {
    try {
      if (editingUser) {
        await apiClient.put(`/api/users/${editingUser.id}/`, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await apiClient.post('/api/users/', values);
        message.success('Thêm người dùng thành công');
      }
      setModalVisible(false);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Lỗi khi lưu thông tin người dùng');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await apiClient.patch(`/api/users/${userId}/`, {
        is_active: !currentStatus
      });
      message.success(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error('Lỗi khi thay đổi trạng thái người dùng');
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Thông tin người dùng',
      key: 'userInfo',
      width: 300,
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size={48}
            style={{ 
              backgroundColor: record.is_admin ? '#722ed1' : record.is_staff ? '#fa8c16' : '#1890ff',
              fontSize: '18px'
            }}
            icon={<UserOutlined />}
          >
            {record.username.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
              {record.first_name || record.last_name 
                ? `${record.first_name || ''} ${record.last_name || ''}`.trim()
                : record.username
              }
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
              @{record.username}
            </div>
            <div style={{ color: '#999', fontSize: '11px' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò & Trạng thái',
      key: 'roleStatus',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag 
            color={record.is_admin ? 'red' : record.is_staff ? 'purple' : 'blue'}
            style={{ marginBottom: '4px' }}
          >
            {record.is_admin ? 'Super Admin' : record.is_staff ? 'Quản trị' : 'Khách hàng'}
          </Tag>
          <Tag color={record.is_active ? 'green' : 'volcano'}>
            {record.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      key: 'timeInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            <strong>Tham gia:</strong> {formatDate(new Date(record.date_joined), 'dd/MM/yyyy')}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            <strong>Đăng nhập:</strong> {record.last_login ? formatDate(new Date(record.last_login), 'dd/MM/yyyy') : 'Chưa bao giờ'}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title={`Bạn có chắc muốn ${record.is_active ? 'khóa' : 'mở khóa'} tài khoản này?`}
            onConfirm={() => handleToggleStatus(record.id, record.is_active)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button
              size="small"
              type={record.is_active ? 'primary' : 'default'}
              danger={record.is_active}
              icon={record.is_active ? <LockOutlined /> : <UnlockOutlined />}
            >
              {record.is_active ? 'Khóa' : 'Mở'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        marginBottom: '24px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          <UserOutlined /> Quản lý người dùng
        </Title>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Quản lý tài khoản người dùng và phân quyền trong hệ thống
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderLeft: '4px solid #1890ff' }}>
            <Statistic
              title="Tổng người dùng"
              value={statistics.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderLeft: '4px solid #52c41a' }}>
            <Statistic
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderLeft: '4px solid #f5222d' }}>
            <Statistic
              title="Bị khóa"
              value={statistics.inactive}
              prefix={<LockOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderLeft: '4px solid #722ed1' }}>
            <Statistic
              title="Quản trị viên"
              value={statistics.staff}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Add Button */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} lg={18}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} lg={8}>
                <Input
                  placeholder="Tìm kiếm theo tên, email..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </Col>
              <Col xs={24} sm={8} lg={6}>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: '100%' }}
                  value={filters.is_active}
                  onChange={(value) => setFilters({ ...filters, is_active: value })}
                  allowClear
                >
                  <Option value="true">Hoạt động</Option>
                  <Option value="false">Vô hiệu hóa</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8} lg={6}>
                <Select
                  placeholder="Vai trò"
                  style={{ width: '100%' }}
                  value={filters.is_staff}
                  onChange={(value) => setFilters({ ...filters, is_staff: value })}
                  allowClear
                >
                  <Option value="true">Quản trị viên</Option>
                  <Option value="false">Khách hàng</Option>
                </Select>
              </Col>
            </Row>
          </Col>
          <Col xs={24} lg={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm người dùng
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card 
        title={
          <Space>
            <UserOutlined />
            <span>Danh sách người dùng ({users.length})</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="middle"
          >
            Thêm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          size="middle"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} người dùng`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
                ]}
              >
                <Input placeholder="Nhập tên đăng nhập" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Tên"
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Họ"
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="Trạng thái"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Vô hiệu hóa"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_staff"
                label="Vai trò"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch
                  checkedChildren="Quản trị viên"
                  unCheckedChildren="Khách hàng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        title={`Thông tin chi tiết - ${selectedUser?.username}`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Avatar
                  size={100}
                  src={selectedUser.avatar}
                  icon={<UserOutlined />}
                />
              </Col>
              <Col span={18}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Tên đăng nhập">
                    {selectedUser.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ tên">
                    {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Chưa cập nhật'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedUser.email}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Descriptions bordered style={{ marginTop: 24 }} column={2}>
              <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={selectedUser.is_staff ? 'purple' : 'blue'}>
                  {selectedUser.is_staff ? 'Quản trị viên' : 'Khách hàng'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedUser.is_active ? 'green' : 'red'}>
                  {selectedUser.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {formatDate(new Date(selectedUser.date_joined), 'dd/MM/yyyy HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Lần cuối đăng nhập" span={2}>
                {selectedUser.last_login
                  ? formatDate(new Date(selectedUser.last_login), 'dd/MM/yyyy HH:mm')
                  : 'Chưa đăng nhập'
                }
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;