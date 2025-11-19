import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Tag, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, HistoryOutlined, ReloadOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import StockImportModal from '../../components/admin/StockImportModal';
import StockAdjustModal from '../../components/admin/StockAdjustModal';
import StockAlertBadge from '../../components/admin/StockAlertBadge';

const { Search } = Input;
const { Option } = Select;

const StockManagement = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      // Fetch all variants - Backend cho phép max 200 items/page
      let allVariants = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await apiClient.get('/admin/products/variants/', {
          params: {
            page,
            page_size: 200 // Max allowed by AdminPagination
          }
        });
        
        const data = response.data;
        
        if (data.results) {
          // Response có pagination
          allVariants = [...allVariants, ...data.results];
          hasMore = data.links.next !== null;
          page++;
        } else {
          // Response không có pagination (trường hợp đặc biệt)
          allVariants = data;
          hasMore = false;
        }
      }
      
      setVariants(allVariants);
      console.log(`✅ Loaded ${allVariants.length} product variants`);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = (variant) => {
    setSelectedVariant(variant);
    setImportModalVisible(true);
  };

  const handleAdjustClick = (variant) => {
    setSelectedVariant(variant);
    setAdjustModalVisible(true);
  };

  const handleModalSuccess = () => {
    fetchVariants(); // Refresh data
  };

  const getStockLevel = (variant) => {
    const available = variant.available_quantity || 0;
    const minimumStock = variant.minimum_stock || 5;
    const reorderPoint = variant.reorder_point || 10;

    // Logic giống backend: check theo thứ tự ưu tiên
    if (available === 0) return 'out_of_stock';
    if (available <= minimumStock) return 'low_stock';
    if (available <= reorderPoint) return 'reorder_needed';
    return 'good';
  };

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 300,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.product_name || record.product?.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.size && <span>Size: <strong>{record.size}</strong></span>}
            {record.size && record.color && ' | '}
            {record.color && <span>Màu: <strong>{record.color}</strong></span>}
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.stock_quantity - b.stock_quantity,
      render: (qty) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{qty || 0}</span>,
    },
    {
      title: 'Đang giữ',
      dataIndex: 'reserved_quantity',
      key: 'reserved_quantity',
      width: 100,
      align: 'center',
      render: (qty) => qty > 0 ? <Tag color="orange">{qty}</Tag> : <span style={{ color: '#999' }}>0</span>,
      tooltip: 'Số lượng đang giữ trong đơn hàng chưa hoàn thành',
    },
    {
      title: 'Khả dụng',
      dataIndex: 'available_quantity',
      key: 'available_quantity',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.available_quantity || 0) - (b.available_quantity || 0),
      render: (qty) => (
        <span style={{ 
          fontWeight: 'bold', 
          fontSize: '16px',
          color: qty > 10 ? '#52c41a' : qty > 0 ? '#faad14' : '#ff4d4f' 
        }}>
          {qty || 0}
        </span>
      ),
      tooltip: 'Số lượng có thể bán = Tồn kho - Đang giữ',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      filters: [
        { text: 'Hết hàng', value: 'out_of_stock' },
        { text: 'Tồn kho thấp', value: 'low_stock' },
        { text: 'Cần đặt hàng', value: 'reorder_needed' },
        { text: 'Đủ hàng', value: 'good' },
      ],
      onFilter: (value, record) => getStockLevel(record) === value,
      render: (_, record) => <StockAlertBadge variant={record} />,
    },
    {
      title: 'Giá bán',
      dataIndex: 'product_price',
      key: 'product_price',
      width: 130,
      align: 'right',
      render: (price, record) => {
        const displayPrice = price || record.product?.price;
        return displayPrice ? `${Number(displayPrice).toLocaleString()} ₫` : '-';
      },
    },
    {
      title: 'Giá vốn',
      dataIndex: 'cost_price',
      key: 'cost_price',
      width: 130,
      align: 'right',
      render: (price) => price ? `${Number(price).toLocaleString()} ₫` : <span style={{ color: '#999' }}>Chưa có</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleImportClick(record)}
          >
            Nhập
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleAdjustClick(record)}
          >
            Điều chỉnh
          </Button>
        </Space>
      ),
    },
  ];

  // Filter data
  const filteredData = variants.filter(variant => {
    const matchSearch = !searchText || 
      variant.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
      variant.product?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      variant.product_name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || getStockLevel(variant) === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Statistics
  const stats = {
    total: variants.length,
    outOfStock: variants.filter(v => (v.available_quantity || 0) === 0).length,
    lowStock: variants.filter(v => {
      const available = v.available_quantity || 0;
      const minimumStock = v.minimum_stock || 5;
      return available > 0 && available <= minimumStock;
    }).length,
    totalValue: variants.reduce((sum, v) => {
      const price = v.cost_price || 0;
      const quantity = v.stock_quantity || 0;
      return sum + (quantity * price);
    }, 0),
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 16 }}>📦 Quản lý tồn kho</h2>
        
        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16,
          marginBottom: 16 
        }}>
          <div style={{ padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Tổng SKU</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.total}</div>
          </div>
          <div style={{ padding: 16, background: '#fff1f0', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Hết hàng</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
              {stats.outOfStock}
            </div>
          </div>
          <div style={{ padding: 16, background: '#fffbe6', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Sắp hết</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
              {stats.lowStock}
            </div>
          </div>
          <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Giá trị kho</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
              {stats.totalValue.toLocaleString()} ₫
            </div>
          </div>
        </div>

        {/* Filters */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Search
            placeholder="Tìm theo SKU, tên sản phẩm..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="out_of_stock">🔴 Hết hàng</Option>
            <Option value="low">⚠️ Sắp hết</Option>
            <Option value="warning">📦 Cảnh báo</Option>
            <Option value="good">✅ Đủ hàng</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchVariants}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
        />
      </Card>

      {/* Modals */}
      <StockImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        variant={selectedVariant}
        onSuccess={handleModalSuccess}
      />
      
      <StockAdjustModal
        visible={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        variant={selectedVariant}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default StockManagement;