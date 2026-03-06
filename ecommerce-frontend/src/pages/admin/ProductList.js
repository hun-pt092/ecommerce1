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
      render: (name, record) => {
        const variantCount = record.variants?.length || 0;
        const skuCount = record.variants?.reduce((total, variant) => 
          total + (variant.skus?.length || 0), 0) || 0;
        
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              SKU: {record.sku}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {variantCount} variant{variantCount !== 1 ? 's' : ''} • {skuCount} SKU{skuCount !== 1 ? 's' : ''}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (name) => name || <span style={{ color: '#999' }}>Chưa cập nhật</span>,
    },
    {
      title: 'Thương hiệu',
      dataIndex: ['brand', 'name'],
      key: 'brand',
      render: (name) => name || <span style={{ color: '#999' }}>Chưa cập nhật</span>,
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_, record) => {
        // Tính giá hiển thị từ variants
        if (record.variants && record.variants.length > 0) {
          const prices = record.variants.map(v => v.price).filter(p => p);
          const discountPrices = record.variants
            .filter(v => v.discount_price)
            .map(v => v.discount_price);
          
          if (prices.length === 0) {
            return <div style={{ color: '#999' }}>Chưa có giá</div>;
          }
          
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const hasDiscount = discountPrices.length > 0;
          
          // Tính giá cuối cùng (có discount thì lấy discount, không thì lấy price)
          let displayPrice;
          if (hasDiscount) {
            const minDiscount = Math.min(...discountPrices);
            const maxDiscount = Math.max(...discountPrices);
            displayPrice = minDiscount === maxDiscount 
              ? `${minDiscount.toLocaleString()}₫`
              : `${minDiscount.toLocaleString()}₫ - ${maxDiscount.toLocaleString()}₫`;
          } else {
            displayPrice = minPrice === maxPrice 
              ? `${minPrice.toLocaleString()}₫`
              : `${minPrice.toLocaleString()}₫ - ${maxPrice.toLocaleString()}₫`;
          }
          
          return (
            <div>
              {hasDiscount && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#999', 
                  textDecoration: 'line-through',
                  marginBottom: '2px'
                }}>
                  {minPrice === maxPrice 
                    ? `${minPrice.toLocaleString()}₫`
                    : `${minPrice.toLocaleString()}₫ - ${maxPrice.toLocaleString()}₫`
                  }
                </div>
              )}
              <div style={{ fontWeight: 500, color: hasDiscount ? '#ff4d4f' : '#000' }}>
                {displayPrice}
              </div>
              {record.variants.length > 1 && (
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                  {record.variants.length} variants
                </div>
              )}
            </div>
          );
        }
        
        // Fallback cho product không có variants
        return (
          <div style={{ fontWeight: 500 }}>
            {record.price_range || (record.price ? `${parseInt(record.price).toLocaleString()}₫` : 'Chưa có giá')}
          </div>
        );
      },
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
      const response = await authAxios.get('/admin/products/?page_size=200');
      // Handle pagination format
      const productsData = response.data.results || response.data || [];
      
      // Process data để thêm main_image từ structure mới
      const processedData = Array.isArray(productsData) ? productsData.map(product => {
        let mainImage = null;
        
        // Priority 1: display_image từ Product
        if (product.display_image) {
          mainImage = product.display_image;
        }
        // Priority 2: primary_image từ variant đầu tiên
        else if (product.variants && product.variants.length > 0) {
          const firstVariant = product.variants[0];
          if (firstVariant.primary_image) {
            mainImage = firstVariant.primary_image;
          }
          // Priority 3: ảnh đầu tiên trong images array
          else if (firstVariant.images && firstVariant.images.length > 0) {
            mainImage = firstVariant.images[0].image_url || firstVariant.images[0].image;
          }
        }
        
        return {
          ...product,
          main_image: mainImage
        };
      }) : [];
      
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
    const matchesSearch = product.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchText.toLowerCase());
    
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
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '200'],
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