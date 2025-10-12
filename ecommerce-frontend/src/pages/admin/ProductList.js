import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Image,
  Tag,
  Popconfirm,
  Typography,
  Card,
  Input,
  Select,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../../api/AuthAxios';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Columns cho table
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'main_image',
      key: 'main_image',
      width: 80,
      render: (image) => (
        <Image
          src={image || 'https://via.placeholder.com/60x60?text=No+Image'}
          alt="Product"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/60x60?text=No+Image"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Thương hiệu',
      dataIndex: ['brand', 'name'],
      key: 'brand',
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {parseInt(record.price).toLocaleString('vi-VN')}đ
          </div>
          {record.discount_price && (
            <div style={{ fontSize: 12, color: '#ff4d4f', textDecoration: 'line-through' }}>
              {parseInt(record.discount_price).toLocaleString('vi-VN')}đ
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.is_active ? 'green' : 'red'}>
            {record.is_active ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
          {record.is_featured && <Tag color="blue">Nổi bật</Tag>}
          {record.is_new && <Tag color="orange">Mới</Tag>}
        </Space>
      ),
    },
    {
      title: 'Variants',
      key: 'variants_count',
      render: (_, record) => (
        <span>{record.variants?.length || 0} variants</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/products/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get('/admin/products/');
      // Handle pagination format
      const productsData = response.data.results || response.data || [];
      
      // Process data để thêm main_image
      const processedData = Array.isArray(productsData) ? productsData.map(product => ({
        ...product,
        main_image: product.images?.find(img => img.is_main)?.image || 
                   product.images?.[0]?.image || null
      })) : [];
      
      setProducts(processedData);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      await authAxios.delete(`/admin/products/${id}/`);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      message.error('Không thể xóa sản phẩm');
      console.error('Error deleting product:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.is_active) ||
                         (statusFilter === 'inactive' && !product.is_active) ||
                         (statusFilter === 'featured' && product.is_featured) ||
                         (statusFilter === 'new' && product.is_new);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Quản lý sản phẩm</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/products/add')}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Tìm kiếm theo tên hoặc SKU..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Không hoạt động</Option>
            <Option value="featured">Nổi bật</Option>
            <Option value="new">Sản phẩm mới</Option>
          </Select>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredProducts.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ProductList;