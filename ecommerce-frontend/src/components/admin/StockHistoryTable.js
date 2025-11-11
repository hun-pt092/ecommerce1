import React, { useState } from 'react';
import { Table, Tag, Select, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Option } = Select;

const StockHistoryTable = ({ history, loading, onRefresh }) => {
  const [typeFilter, setTypeFilter] = useState('all');

  const getTransactionColor = (type) => {
    const colors = {
      'import': 'green',
      'sale': 'blue',
      'return': 'orange',
      'adjustment': 'purple',
      'damaged': 'red',
      'reserved': 'cyan',
      'released': 'geekblue'
    };
    return colors[type] || 'default';
  };

  const getTransactionIcon = (type) => {
    const icons = {
      'import': '📥',
      'sale': '🛒',
      'return': '↩️',
      'adjustment': '⚙️',
      'damaged': '🔴',
      'reserved': '🔒',
      'released': '🔓'
    };
    return icons[type] || '📦';
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      width: 150,
      render: (type, record) => (
        <Tag color={getTransactionColor(type)}>
          {getTransactionIcon(type)} {record.transaction_type_display}
        </Tag>
      ),
      filters: [
        { text: 'Nhập kho', value: 'import' },
        { text: 'Bán hàng', value: 'sale' },
        { text: 'Trả hàng', value: 'return' },
        { text: 'Điều chỉnh', value: 'adjustment' },
        { text: 'Hàng hỏng', value: 'damaged' },
      ],
      onFilter: (value, record) => record.transaction_type === value,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_variant_detail',
      key: 'product',
      render: (detail) => (
        <div>
          <div style={{ fontWeight: 500 }}>{detail?.product_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            SKU: {detail?.sku} | 
            {detail?.size && ` Size: ${detail.size}`}
            {detail?.color && ` | Màu: ${detail.color}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (qty, record) => {
        const isIncrease = ['import', 'return', 'released'].includes(record.transaction_type);
        return (
          <span style={{ 
            color: isIncrease ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold'
          }}>
            {isIncrease ? '+' : '-'}{Math.abs(qty)}
          </span>
        );
      },
    },
    {
      title: 'Trước → Sau',
      key: 'change',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <span>
          {record.quantity_before} → <strong>{record.quantity_after}</strong>
        </span>
      ),
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 100,
      render: (orderId) => orderId ? `#${orderId}` : '-',
    },
    {
      title: 'Mã tham chiếu',
      dataIndex: 'reference_number',
      key: 'reference_number',
      width: 120,
      render: (ref) => ref || '-',
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'created_by_name',
      key: 'created_by',
      width: 120,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes || '-',
    },
  ];

  const filteredHistory = typeFilter === 'all' 
    ? history 
    : history.filter(item => item.transaction_type === typeFilter);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 200 }}
        >
          <Option value="all">Tất cả giao dịch</Option>
          <Option value="import">📥 Nhập kho</Option>
          <Option value="sale">🛒 Bán hàng</Option>
          <Option value="return">↩️ Trả hàng</Option>
          <Option value="adjustment">⚙️ Điều chỉnh</Option>
          <Option value="damaged">🔴 Hàng hỏng</Option>
        </Select>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          loading={loading}
        >
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredHistory}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} giao dịch`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default StockHistoryTable;