import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Select, message, Modal } from 'antd';
import { CheckOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import apiClient from '../../api/apiClient';
import StockAlertBadge from '../../components/admin/StockAlertBadge';

const { Option } = Select;
const { confirm } = Modal;

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.is_resolved = statusFilter === 'resolved';
      }

      const response = await apiClient.get('/admin/stock/alerts/', { params });
      setAlerts(response.data.results || response.data);
    } catch (error) {
      message.error('Không thể tải danh sách cảnh báo');
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (alertId) => {
    confirm({
      title: 'Xác nhận giải quyết cảnh báo',
      icon: <ExclamationCircleOutlined />,
      content: 'Đánh dấu cảnh báo này đã được xử lý?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.post(`/admin/stock/alerts/${alertId}/resolve/`);
          message.success('Đã đánh dấu cảnh báo đã giải quyết');
          fetchAlerts();
        } catch (error) {
          message.error('Không thể cập nhật cảnh báo');
          console.error('Error resolving alert:', error);
        }
      },
    });
  };

  const getAlertTypeColor = (type) => {
    const colors = {
      'out_of_stock': 'red',
      'low_stock': 'orange',
      'reorder_needed': 'gold',
    };
    return colors[type] || 'default';
  };

  const getAlertTypeIcon = (type) => {
    const icons = {
      'out_of_stock': '🔴',
      'low_stock': '⚠️',
      'reorder_needed': '📦',
    };
    return icons[type] || '⚠️';
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
      sorter: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Loại cảnh báo',
      dataIndex: 'alert_type',
      key: 'alert_type',
      width: 150,
      render: (type, record) => (
        <Tag color={getAlertTypeColor(type)}>
          {getAlertTypeIcon(type)} {record.alert_type_display}
        </Tag>
      ),
      filters: [
        { text: '🔴 Hết hàng', value: 'out_of_stock' },
        { text: '⚠️ Tồn kho thấp', value: 'low_stock' },
        { text: '📦 Cần đặt hàng', value: 'reorder_needed' },
      ],
      onFilter: (value, record) => record.alert_type === value,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_variant_detail',
      key: 'product',
      render: (detail) => (
        <div>
          <div style={{ fontWeight: 500 }}>{detail?.product_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            SKU: {detail?.sku}
            {detail?.size && ` | Size: ${detail.size}`}
            {detail?.color && ` | Màu: ${detail.color}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'current_quantity',
      key: 'current_quantity',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.current_quantity - b.current_quantity,
      render: (qty) => (
        <span style={{ 
          fontWeight: 'bold',
          color: qty === 0 ? '#ff4d4f' : qty < 10 ? '#faad14' : '#000'
        }}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Ngưỡng tối thiểu',
      dataIndex: 'threshold_quantity',
      key: 'threshold_quantity',
      width: 120,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_resolved',
      key: 'is_resolved',
      width: 120,
      align: 'center',
      render: (resolved, record) => (
        <div>
          {resolved ? (
            <Tag color="success">✅ Đã giải quyết</Tag>
          ) : (
            <Tag color="error">⏳ Chưa xử lý</Tag>
          )}
          {resolved && record.resolved_at && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
              {format(new Date(record.resolved_at), 'dd/MM HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Người xử lý',
      dataIndex: 'resolved_by_name',
      key: 'resolved_by',
      width: 120,
      render: (name) => name || '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {!record.is_resolved && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleResolve(record.id)}
            >
              Giải quyết
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredAlerts = alerts;

  // Statistics
  const stats = {
    total: alerts.length,
    pending: alerts.filter(a => !a.is_resolved).length,
    outOfStock: alerts.filter(a => a.alert_type === 'out_of_stock' && !a.is_resolved).length,
    lowStock: alerts.filter(a => a.alert_type === 'low_stock' && !a.is_resolved).length,
  };

  return (
    <div>
      <Card>
        <h2 style={{ marginBottom: 16 }}>⚠️ Cảnh báo tồn kho</h2>

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16,
          marginBottom: 16 
        }}>
          <div style={{ padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Tổng cảnh báo</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.total}</div>
          </div>
          <div style={{ padding: 16, background: '#fff1f0', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Chưa xử lý</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
              {stats.pending}
            </div>
          </div>
          <div style={{ padding: 16, background: '#fff1f0', borderRadius: 8, border: '2px solid #ff4d4f' }}>
            <div style={{ fontSize: 12, color: '#666' }}>🔴 Hết hàng</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#cf1322' }}>
              {stats.outOfStock}
            </div>
          </div>
          <div style={{ padding: 16, background: '#fffbe6', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>⚠️ Tồn kho thấp</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
              {stats.lowStock}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
          >
            <Option value="pending">⏳ Chưa xử lý</Option>
            <Option value="resolved">✅ Đã giải quyết</Option>
            <Option value="all">Tất cả</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchAlerts}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredAlerts}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} cảnh báo`,
          }}
          rowClassName={(record) => !record.is_resolved ? 'alert-pending-row' : ''}
        />
      </Card>

      <style jsx>{`
        .alert-pending-row {
          background-color: #fff7e6;
        }
        .alert-pending-row:hover td {
          background-color: #ffe7ba !important;
        }
      `}</style>
    </div>
  );
};

export default StockAlerts;