import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Select, 
  InputNumber, 
  message, 
  Spin, 
  Row, 
  Col, 
  Typography,
  Divider,
  Tag,
  Space
} from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  StarFilled,
  ArrowLeftOutlined
} from '@ant-design/icons';
import apiClient from '../api/apiClient';
import authAxios from '../api/AuthAxios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`products/${id}/`);
      setProduct(response.data);
      
      // Tự động chọn variant đầu tiên nếu có
      if (response.data.variants && response.data.variants.length > 0) {
        const firstVariant = response.data.variants[0];
        setSelectedVariant(firstVariant);
        setSelectedSize(firstVariant.size);
        setSelectedColor(firstVariant.color);
      }
    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (size, color) => {
    const variant = product.variants.find(v => v.size === size && v.color === color);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedSize(size);
      setSelectedColor(color);
      setQuantity(1); // Reset quantity khi đổi variant
    }
  };

  const addToCart = async () => {
    if (!selectedVariant) {
      message.warning('Vui lòng chọn kích cỡ và màu sắc');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      // Sử dụng PUT method mới để thêm item đơn giản
      await authAxios.put('cart/', { 
        product_variant_id: selectedVariant.id,
        quantity: quantity
      });
      message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      
      // Cập nhật cart count trong navigation
      if (window.updateCartCount) {
        window.updateCartCount();
      }
      
    } catch (error) {
      // Hiển thị lỗi cụ thể từ backend
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Có lỗi khi thêm vào giỏ hàng');
      }
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const getAvailableSizes = () => {
    if (!product || !product.variants) return [];
    return [...new Set(product.variants.map(v => v.size))];
  };

  const getAvailableColors = () => {
    if (!product || !product.variants) return [];
    if (!selectedSize) return [...new Set(product.variants.map(v => v.color))];
    
    return [...new Set(product.variants
      .filter(v => v.size === selectedSize)
      .map(v => v.color))];
  };

  const getCurrentPrice = () => {
    return product?.discount_price || product?.price;
  };

  const hasDiscount = () => {
    return product?.discount_price && product?.discount_price < product?.price;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Title level={3}>Không tìm thấy sản phẩm</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px' }}
      >
        Về trang chủ
      </Button>

      <Row gutter={[32, 32]}>
        {/* Hình ảnh sản phẩm */}
        <Col xs={24} md={12}>
          <Card
            cover={
              <div 
                style={{ 
                  height: '400px', 
                  background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: '#999'
                }}
              >
                📷
              </div>
            }
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Hình ảnh sản phẩm sẽ được cập nhật sau</Text>
            </div>
          </Card>
        </Col>

        {/* Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <div>
            <Title level={2}>{product.name}</Title>
            
            {/* Giá */}
            <div style={{ marginBottom: '20px' }}>
              {hasDiscount() ? (
                <Space>
                  <Text 
                    style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold', 
                      color: '#ff4d4f' 
                    }}
                  >
                    {Number(getCurrentPrice()).toLocaleString()}₫
                  </Text>
                  <Text 
                    delete 
                    style={{ 
                      fontSize: '20px', 
                      color: '#999' 
                    }}
                  >
                    {Number(product.price).toLocaleString()}₫
                  </Text>
                  <Tag color="red">
                    -{Math.round((1 - product.discount_price / product.price) * 100)}%
                  </Tag>
                </Space>
              ) : (
                <Text 
                  style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#1890ff' 
                  }}
                >
                  {Number(getCurrentPrice()).toLocaleString()}₫
                </Text>
              )}
            </div>

            {/* Mô tả */}
            {product.description && (
              <>
                <Title level={4}>Mô tả sản phẩm</Title>
                <Paragraph>{product.description}</Paragraph>
                <Divider />
              </>
            )}

            {/* Chọn variant */}
            <div style={{ marginBottom: '20px' }}>
              <Title level={4}>Tùy chọn</Title>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Kích cỡ:</Text>
                <br />
                <Select
                  value={selectedSize}
                  onChange={(size) => handleVariantChange(size, selectedColor)}
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Chọn kích cỡ"
                >
                  {getAvailableSizes().map(size => (
                    <Option key={size} value={size}>{size}</Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Text strong>Màu sắc:</Text>
                <br />
                <Select
                  value={selectedColor}
                  onChange={(color) => handleVariantChange(selectedSize, color)}
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Chọn màu sắc"
                  disabled={!selectedSize}
                >
                  {getAvailableColors().map(color => (
                    <Option key={color} value={color}>{color}</Option>
                  ))}
                </Select>
              </div>

              {selectedVariant && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Tồn kho: </Text>
                  <Text type={selectedVariant.stock_quantity > 0 ? 'success' : 'danger'}>
                    {selectedVariant.stock_quantity > 0 
                      ? `${selectedVariant.stock_quantity} sản phẩm` 
                      : 'Hết hàng'
                    }
                  </Text>
                </div>
              )}
            </div>

            {/* Số lượng */}
            <div style={{ marginBottom: '20px' }}>
              <Text strong>Số lượng:</Text>
              <br />
              
              {/* Stock warning */}
              {selectedVariant && selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 && (
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <Text type="warning" style={{ fontSize: '12px' }}>
                    ⚠️ Chỉ còn {selectedVariant.stock_quantity} sản phẩm
                  </Text>
                </div>
              )}
              
              <InputNumber
                min={1}
                max={selectedVariant?.stock_quantity || 1}
                value={quantity}
                onChange={setQuantity}
                style={{ width: '100px', marginTop: '8px' }}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              />
              
              {selectedVariant && (
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  Tối đa: {selectedVariant.stock_quantity}
                </Text>
              )}
            </div>

            {/* Buttons */}
            <Space style={{ width: '100%' }} direction="vertical" size="large">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={addToCart}
                loading={addingToCart}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                block
                style={{ height: '50px' }}
              >
                Thêm vào giỏ hàng
              </Button>
              
              <Button
                size="large"
                icon={<HeartOutlined />}
                block
                style={{ height: '50px' }}
              >
                Thêm vào yêu thích
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Reviews section - placeholder */}
      <Divider style={{ marginTop: '40px' }} />
      <Title level={3}>Đánh giá sản phẩm</Title>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <StarFilled style={{ fontSize: '48px', marginBottom: '16px' }} />
          <br />
          Tính năng đánh giá sẽ được cập nhật sau
        </div>
      </Card>
    </div>
  );
};

export default ProductDetailPage;