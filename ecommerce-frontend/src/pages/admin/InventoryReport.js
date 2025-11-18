import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Space } from 'antd';
import { DollarOutlined, InboxOutlined, WarningOutlined, ShoppingOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import StockAlertBadge from '../../components/admin/StockAlertBadge';

const { RangePicker } = DatePicker;
const { Option } = Select;

const InventoryReport = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('value_desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/products/variants/');
      setVariants(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalItems: variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0),
    totalValue: variants.reduce((sum, v) => sum + (v.stock_quantity || 0) * (v.cost_price || 0), 0),
    outOfStock: variants.filter(v => (v.available_quantity || 0) === 0).length,
    lowStock: variants.filter(v => {
      const available = v.available_quantity || 0;
      const minimumStock = v.minimum_stock || 5;
      const reorderPoint = v.reorder_point || 10;
      // Sắp hết = Hết hàng HOẶC dưới mức tối thiểu HOẶC cần đặt hàng
      return available === 0 || available <= minimumStock || available <= reorderPoint;
    }).length,
  };

  // Top products by value
  const topByValue = [...variants]
    .map(v => ({
      ...v,
      totalValue: (v.stock_quantity || 0) * (v.cost_price || 0)
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  // Products need reorder (including out of stock)
  const needReorder = variants
    .filter(v => {
      const available = v.available_quantity || 0;
      const reorderPoint = v.reorder_point || 10;
      // Cần đặt hàng = Hết hàng HOẶC dưới điểm đặt hàng
      return available <= reorderPoint;
    })
    .sort((a, b) => {
      // Sắp xếp: Hết hàng trước, sau đó theo số lượng tăng dần
      const availableA = a.available_quantity || 0;
      const availableB = b.available_quantity || 0;
      if (availableA === 0 && availableB !== 0) return -1;
      if (availableA !== 0 && availableB === 0) return 1;
      return availableA - availableB;
    })
    .slice(0, 6); // Chỉ lấy 6 sản phẩm cần đặt hàng nhất

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.product?.name || record.product_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.size && `Size: ${record.size}`}
            {record.size && record.color && ' | '}
            {record.color && `Màu: ${record.color}`}
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
    },
    {
      title: 'Giá vốn',
      dataIndex: 'cost_price',
      key: 'cost_price',
      width: 120,
      align: 'right',
      render: (price) => price ? `${Number(price).toLocaleString()} ₫` : '-',
    },
    {
      title: 'Giá trị',
      key: 'value',
      width: 150,
      align: 'right',
      sorter: (a, b) => {
        const valueA = (a.stock_quantity || 0) * (a.cost_price || 0);
        const valueB = (b.stock_quantity || 0) * (b.cost_price || 0);
        return valueA - valueB;
      },
      render: (_, record) => {
        const value = (record.stock_quantity || 0) * (record.cost_price || 0);
        return <strong>{value.toLocaleString()} ₫</strong>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => <StockAlertBadge variant={record} />,
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>📊 Báo cáo tồn kho</h2>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số lượng"
              value={stats.totalItems}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={stats.totalValue}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={stats.lowStock}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top 10 by Value */}
      <Card title="🏆 Top 10 sản phẩm giá trị cao nhất" style={{ marginBottom: 16 }}>
        <Table
          columns={columns}
          dataSource={topByValue}
          loading={loading}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Products need reorder */}
      {needReorder.length > 0 && (
        <Card title="📦 Sản phẩm cần đặt hàng" style={{ marginBottom: 16 }}>
          <Table
            columns={columns}
            dataSource={needReorder}
            loading={loading}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* All Inventory */}
      <Card title="📋 Tổng quan tồn kho">
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 200 }}
          >
            <Option value="value_desc">Giá trị cao → thấp</Option>
            <Option value="value_asc">Giá trị thấp → cao</Option>
            <Option value="qty_desc">Số lượng nhiều → ít</Option>
            <Option value="qty_asc">Số lượng ít → nhiều</Option>
          </Select>
          <Button onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={[...variants].sort((a, b) => {
            const valueA = (a.stock_quantity || 0) * (a.cost_price || 0);
            const valueB = (b.stock_quantity || 0) * (b.cost_price || 0);
            const qtyA = a.stock_quantity || 0;
            const qtyB = b.stock_quantity || 0;

            switch (sortBy) {
              case 'value_desc':
                return valueB - valueA;
              case 'value_asc':
                return valueA - valueB;
              case 'qty_desc':
                return qtyB - qtyA;
              case 'qty_asc':
                return qtyA - qtyB;
              default:
                return valueB - valueA;
            }
          })}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
        />
      </Card>
    </div>
  );
};

export default InventoryReport;