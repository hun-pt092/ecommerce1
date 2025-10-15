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
  Space,
  Carousel,
  Rate,
  Breadcrumb,
  Tabs,
  Badge,
  Avatar,
  Image,
  Tooltip,
  Grid
} from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  StarFilled,
  ArrowLeftOutlined,
  ShareAltOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import apiClient from '../api/apiClient';
import authAxios from '../api/AuthAxios';
import { useTheme } from '../contexts/ThemeContext';
import WishlistButton from '../components/WishlistButton';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { theme } = useTheme();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselRef, setCarouselRef] = useState(null);
  const [reviewRefresh, setReviewRefresh] = useState(0);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  useEffect(() => {
    // Scroll to top when page loads or product ID changes
    window.scrollTo(0, 0);
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

  const buyNow = async () => {
    if (!selectedVariant) {
      message.warning('Vui lòng chọn kích cỡ và màu sắc');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      message.warning('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    // Tạo temporary cart data với cấu trúc đúng và ensure giá được lưu
    const finalPrice = product.discount_price || product.price;
    const tempCartData = {
      items: [{
        id: `temp_${selectedVariant.id}`,
        product_variant: {
          id: selectedVariant.id,
          size: selectedVariant.size,
          color: selectedVariant.color,
          stock_quantity: selectedVariant.stock_quantity,
          product: {
            ...product,
            // Đảm bảo giá được lưu chính xác với type conversion
            price: parseFloat(product.price) || 0,
            discount_price: product.discount_price ? parseFloat(product.discount_price) : null
          }
        },
        // Thêm product trực tiếp cho trường hợp fallback
        product: {
          ...product,
          price: parseFloat(product.price) || 0,
          discount_price: product.discount_price ? parseFloat(product.discount_price) : null
        },
        quantity: parseInt(quantity) || 1,
        // Thêm price trực tiếp vào item để dễ dàng truy cập
        price: parseFloat(finalPrice) || 0,
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null
      }]
    };
    
    console.log('=== BuyNow Temp Cart Data Debug ===');
    console.log('Original product:', product);
    console.log('Selected variant:', selectedVariant);
    console.log('Final price used:', finalPrice);
    console.log('Temp cart data:', tempCartData);
    console.log('Item price check:', tempCartData.items[0].price);

    // Lưu temporary cart data vào sessionStorage
    sessionStorage.setItem('temp_cart_data', JSON.stringify(tempCartData));
    
    // Chuyển thẳng đến trang checkout với flag buyNow
    navigate('/checkout?buyNow=true');
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

  const getDiscountPercentage = () => {
    if (!hasDiscount()) return 0;
    return Math.round((1 - product.discount_price / product.price) * 100);
  };

  const getStockStatus = () => {
    if (!selectedVariant) return { status: 'unknown', text: 'Chọn phiên bản', color: 'default' };
    if (selectedVariant.stock_quantity === 0) return { status: 'out', text: 'Hết hàng', color: 'error' };
    if (selectedVariant.stock_quantity <= 5) return { status: 'low', text: `Còn ${selectedVariant.stock_quantity} sản phẩm`, color: 'warning' };
    return { status: 'available', text: 'Còn hàng', color: 'success' };
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.short_description || product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép link sản phẩm');
    }
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
    if (carouselRef) {
      carouselRef.goTo(index);
    }
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
    <div style={{ 
      backgroundColor: theme.backgroundColor, 
      minHeight: '100vh',
      color: theme.textColor
    }}>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '20px' }}>
          <Breadcrumb.Item>
            <Button type="link" onClick={() => navigate('/')} style={{ padding: 0, color: theme.textColor }}>
              Trang chủ
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item style={{ color: theme.textColor }}>{product?.category?.name}</Breadcrumb.Item>
          <Breadcrumb.Item style={{ color: theme.textColor }}>{product?.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[32, 32]}>
          {/* Hình ảnh sản phẩm */}
          <Col xs={24} md={12}>
            <Card 
              bodyStyle={{ padding: 0 }}
              style={{ 
                borderRadius: '12px', 
                overflow: 'hidden',
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderColor
              }}
            >
              {product?.images && product.images.length > 0 ? (
                <div>
                  <Image.PreviewGroup>
                    <Carousel 
                      ref={setCarouselRef}
                      arrows 
                      beforeChange={(from, to) => setActiveImageIndex(to)}
                      style={{ backgroundColor: '#fff' }}
                    >
                      {product.images.map((image, index) => (
                        <div key={index}>
                          <Image
                            width="100%"
                            height="500px"
                            src={getImageUrl(image.image)}
                            alt={image.alt_text || product.name}
                            style={{ objectFit: 'cover' }}
                            placeholder={
                              <div style={{ 
                                height: '500px', 
                                background: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Spin size="large" />
                              </div>
                            }
                          />
                        </div>
                      ))}
                    </Carousel>
                  </Image.PreviewGroup>
                  
                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div style={{ 
                      padding: '16px',
                      display: 'flex',
                      gap: '12px',
                      overflowX: 'auto',
                      scrollbarWidth: 'thin',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      {product.images.map((image, index) => (
                        <div
                          key={index}
                          style={{ 
                            minWidth: '70px',
                            height: '70px',
                            border: activeImageIndex === index ? '3px solid #1890ff' : '2px solid #d9d9d9',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: activeImageIndex === index ? 1 : 0.7
                          }}
                          onClick={() => handleThumbnailClick(index)}
                          onMouseEnter={(e) => {
                            if (activeImageIndex !== index) {
                              e.target.style.opacity = '0.9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (activeImageIndex !== index) {
                              e.target.style.opacity = '0.7';
                            }
                          }}
                        >
                          <img
                            src={getImageUrl(image.image)}
                            alt={`${product.name} ${index + 1}`}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  style={{ 
                    height: '500px', 
                    background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#999',
                    flexDirection: 'column'
                  }}
                >
                  👕
                  <Text type="secondary" style={{ marginTop: '16px', fontSize: '14px' }}>
                    Hình ảnh sẽ được cập nhật sau
                  </Text>
                </div>
              )}
            </Card>
          </Col>

        {/* Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <Card style={{ 
            borderRadius: '12px',
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderColor
          }}>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                {product?.brand && (
                  <Tag color="blue">{product.brand.name}</Tag>
                )}
                {product?.is_new && (
                  <Tag color="green">Mới</Tag>
                )}
                {product?.is_featured && (
                  <Tag color="gold">Nổi bật</Tag>
                )}
              </Space>
            </div>

            <Title level={2} style={{ marginBottom: '8px', color: theme.textColor }}>
              {product.name}
            </Title>
            
            {product?.sku && (
              <Text type="secondary" style={{ fontSize: '12px', color: theme.secondaryText }}>
                SKU: {product.sku}
              </Text>
            )}

            {/* Rating placeholder */}
            <div style={{ margin: '12px 0' }}>
              <Space>
                <Rate disabled defaultValue={4.5} allowHalf style={{ fontSize: '16px' }} />
                <Text type="secondary" style={{ color: theme.secondaryText }}>(0 đánh giá)</Text>
              </Space>
            </div>
            
            {/* Giá */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              {hasDiscount() ? (
                <Space direction="vertical" size="small">
                  <Space align="center">
                    <Text 
                      style={{ 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        color: '#ff4d4f' 
                      }}
                    >
                      {Number(getCurrentPrice()).toLocaleString()}₫
                    </Text>
                    <Badge count={`-${getDiscountPercentage()}%`} style={{ backgroundColor: '#ff4d4f' }} />
                  </Space>
                  <Text 
                    delete 
                    style={{ 
                      fontSize: '18px', 
                      color: '#999' 
                    }}
                  >
                    {Number(product.price).toLocaleString()}₫
                  </Text>
                  <Text type="success" style={{ fontSize: '12px' }}>
                    Tiết kiệm: {Number(product.price - product.discount_price).toLocaleString()}₫
                  </Text>
                </Space>
              ) : (
                <Text 
                  style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: '#1890ff' 
                  }}
                >
                  {Number(getCurrentPrice()).toLocaleString()}₫
                </Text>
              )}
              
              {/* Stock status */}
              <div style={{ marginTop: '12px' }}>
                <Space>
                  {getStockStatus().status === 'available' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  {getStockStatus().status === 'low' && <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                  {getStockStatus().status === 'out' && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                  <Text type={getStockStatus().color}>
                    {getStockStatus().text}
                  </Text>
                </Space>
              </div>
            </div>

            {/* Chọn variant */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '16px', color: theme.textColor }}>Tùy chọn sản phẩm</Title>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', color: theme.textColor }}>
                    Kích cỡ:
                  </Text>
                  <Select
                    value={selectedSize}
                    onChange={(size) => handleVariantChange(size, selectedColor)}
                    style={{ width: '100%' }}
                    placeholder="Chọn kích cỡ"
                    size="large"
                  >
                    {getAvailableSizes().map(size => (
                      <Option key={size} value={size}>{size}</Option>
                    ))}
                  </Select>
                </Col>

                <Col span={12}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', color: theme.textColor }}>
                    Màu sắc:
                  </Text>
                  <Select
                    value={selectedColor}
                    onChange={(color) => handleVariantChange(selectedSize, color)}
                    style={{ width: '100%' }}
                    placeholder="Chọn màu sắc"
                    disabled={!selectedSize}
                    size="large"
                  >
                    {getAvailableColors().map(color => (
                      <Option key={color} value={color}>{color}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            {/* Số lượng */}
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px', color: theme.textColor }}>
                Số lượng:
              </Text>
              
              <Space align="center">
                <InputNumber
                  min={1}
                  max={selectedVariant?.stock_quantity || 1}
                  value={quantity}
                  onChange={setQuantity}
                  size="large"
                  style={{ width: '120px' }}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                />
                {selectedVariant && (
                  <Text type="secondary" style={{ fontSize: '12px', color: theme.secondaryText }}>
                    (Tối đa: {selectedVariant.stock_quantity})
                  </Text>
                )}
              </Space>
            </div>

            {/* Action Buttons */}
            <Row gutter={[8, 12]} style={{ marginBottom: '24px' }}>
              <Col xs={12} sm={8}>
                <Button
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={addToCart}
                  loading={addingToCart}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                  block
                  style={{ height: '50px', borderRadius: '8px' }}
                >
                  Thêm vào giỏ
                </Button>
              </Col>
              <Col xs={12} sm={8}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={buyNow}
                  loading={buyingNow}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                  block
                  style={{ height: '50px', borderRadius: '8px' }}
                >
                  Mua ngay
                </Button>
              </Col>
              <Col xs={12} sm={4}>
                <WishlistButton 
                  productId={product.id} 
                  size="large"
                  style={{ 
                    width: '100%', 
                    height: '50px', 
                    borderRadius: '8px'
                  }}
                />
              </Col>
              <Col xs={12} sm={4}>
                <Tooltip title="Chia sẻ">
                  <Button
                    size="large"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                    style={{ height: '50px', borderRadius: '8px' }}
                  />
                </Tooltip>
              </Col>
            </Row>

            {/* Product features */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Space>
                    <TruckOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ fontSize: '12px' }}>Giao hàng miễn phí cho đơn từ 500k</Text>
                  </Space>
                </Col>
                <Col span={24}>
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                    <Text style={{ fontSize: '12px' }}>Bảo hành chính hãng</Text>
                  </Space>
                </Col>
                <Col span={24}>
                  <Space>
                    <ReloadOutlined style={{ color: '#faad14' }} />
                    <Text style={{ fontSize: '12px' }}>Đổi trả trong 7 ngày</Text>
                  </Space>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      <Row style={{ marginTop: '32px' }}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" size="large" style={{ backgroundColor: '#fff', borderRadius: '12px' }}>
            <TabPane tab="Mô tả sản phẩm" key="1">
              <div style={{ padding: '24px' }}>
                {product?.description ? (
                  <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {product.description}
                  </Paragraph>
                ) : (
                  <Text type="secondary">Thông tin mô tả sản phẩm sẽ được cập nhật sau.</Text>
                )}
                
                {product?.material && (
                  <div style={{ marginTop: '16px' }}>
                    <Text strong>Chất liệu: </Text>
                    <Text>{product.material}</Text>
                  </div>
                )}
              </div>
            </TabPane>
            
            <TabPane tab="Thông số kỹ thuật" key="2">
              <div style={{ padding: '24px' }}>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Text strong>Danh mục:</Text> {product?.category?.name || 'N/A'}
                  </Col>
                  <Col span={12}>
                    <Text strong>Thương hiệu:</Text> {product?.brand?.name || 'N/A'}
                  </Col>
                  <Col span={12}>
                    <Text strong>SKU:</Text> {product?.sku || 'N/A'}
                  </Col>
                  <Col span={12}>
                    <Text strong>Chất liệu:</Text> {product?.material || 'N/A'}
                  </Col>
                </Row>
              </div>
            </TabPane>
            
            <TabPane tab="Đánh giá" key="3">
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <ReviewForm 
                    productId={product.id} 
                    onReviewSubmitted={() => setReviewRefresh(prev => prev + 1)}
                  />
                </div>
                <ReviewList 
                  productId={product.id} 
                  refresh={reviewRefresh}
                />
              </div>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
      
      </div>
    </div>
  );
};

export default ProductDetailPage;