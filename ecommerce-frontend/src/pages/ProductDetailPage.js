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
      backgroundColor: theme.backgroundColor === '#001529' ? '#141414' : '#f5f5f5', 
      minHeight: '100vh',
      color: theme.textColor,
      paddingBottom: '60px'
    }}>
      <div style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <Breadcrumb 
          separator={<span style={{ color: theme.mode === 'dark' ? '#666' : '#999', margin: '0 8px' }}>/</span>}
          style={{ marginBottom: '24px', fontSize: '14px' }}
        >
          <Breadcrumb.Item>
            <Button 
              type="link" 
              onClick={() => navigate('/')} 
              style={{ 
                padding: 0, 
                color: '#1890ff',
                height: 'auto',
                fontWeight: 500
              }}
            >
              Trang chủ
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span style={{ 
              color: theme.mode === 'dark' ? '#888' : '#999',
              fontSize: '14px'
            }}>
              {product?.category?.name}
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span style={{ 
              color: theme.mode === 'dark' ? '#fff' : '#262626', 
              fontWeight: 600,
              fontSize: '14px'
            }}>
              {product?.name}
            </span>
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[40, 40]}>
          {/* Hình ảnh sản phẩm */}
          <Col xs={24} lg={11}>
            <Card 
              bodyStyle={{ padding: 0 }}
              style={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                backgroundColor: theme.cardBackground,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: theme.mode === 'dark' 
                  ? '0 4px 24px rgba(0,0,0,0.3)' 
                  : '0 4px 24px rgba(0,0,0,0.08)'
              }}
            >
              {product?.images && product.images.length > 0 ? (
                <div>
                  <Image.PreviewGroup>
                    <Carousel 
                      ref={setCarouselRef}
                      arrows 
                      beforeChange={(from, to) => setActiveImageIndex(to)}
                      style={{ backgroundColor: theme.cardBackground }}
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
                                background: theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
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
                      padding: '20px',
                      display: 'flex',
                      gap: '16px',
                      overflowX: 'auto',
                      scrollbarWidth: 'thin',
                      WebkitOverflowScrolling: 'touch',
                      justifyContent: 'center'
                    }}>
                      {product.images.map((image, index) => (
                        <div
                          key={index}
                          style={{ 
                            minWidth: '80px',
                            height: '80px',
                            border: activeImageIndex === index 
                              ? '3px solid #1890ff' 
                              : `2px solid ${theme.borderColor}`,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: activeImageIndex === index ? 1 : 0.6,
                            transform: activeImageIndex === index ? 'scale(1.05)' : 'scale(1)'
                          }}
                          onClick={() => handleThumbnailClick(index)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            if (activeImageIndex !== index) {
                              e.currentTarget.style.opacity = '0.6';
                              e.currentTarget.style.transform = 'scale(1)';
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
                    background: theme.mode === 'dark' 
                      ? 'linear-gradient(45deg, #2a2a2a, #3a3a3a)'
                      : 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: theme.mode === 'dark' ? '#666' : '#999',
                    flexDirection: 'column'
                  }}
                >
                  👕
                  <Text type="secondary" style={{ marginTop: '16px', fontSize: '14px', color: theme.secondaryText }}>
                    Hình ảnh sẽ được cập nhật sau
                  </Text>
                </div>
              )}
            </Card>
          </Col>

        {/* Thông tin sản phẩm */}
        <Col xs={24} lg={13}>
          <Card style={{ 
            borderRadius: '16px',
            backgroundColor: theme.cardBackground,
            border: `1px solid ${theme.borderColor}`,
            boxShadow: theme.mode === 'dark' 
              ? '0 4px 24px rgba(0,0,0,0.3)' 
              : '0 4px 24px rgba(0,0,0,0.08)',
            padding: '32px'
          }}
          bodyStyle={{ padding: 0 }}
          >
            {/* Tags */}
            <div style={{ marginBottom: '20px' }}>
              <Space wrap>
                {product?.brand && (
                  <Tag 
                    color="blue" 
                    style={{ 
                      padding: '6px 16px', 
                      fontSize: '13px', 
                      borderRadius: '20px',
                      fontWeight: 500
                    }}
                  >
                    {product.brand.name}
                  </Tag>
                )}
                {product?.is_new && (
                  <Tag 
                    color="green"
                    style={{ 
                      padding: '6px 16px', 
                      fontSize: '13px', 
                      borderRadius: '20px',
                      fontWeight: 500
                    }}
                  >
                    🆕 Mới
                  </Tag>
                )}
                {product?.is_featured && (
                  <Tag 
                    color="gold"
                    style={{ 
                      padding: '6px 16px', 
                      fontSize: '13px', 
                      borderRadius: '20px',
                      fontWeight: 500
                    }}
                  >
                    ⭐ Nổi bật
                  </Tag>
                )}
              </Space>
            </div>

            <Title 
              level={2} 
              style={{ 
                marginBottom: '12px', 
                color: theme.textColor,
                fontSize: '32px',
                fontWeight: 700,
                lineHeight: 1.3
              }}
            >
              {product.name}
            </Title>
            
            {product?.sku && (
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '13px', 
                  color: theme.secondaryText,
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                Mã sản phẩm: <strong>{product.sku}</strong>
              </Text>
            )}

            {/* Rating */}
            <div style={{ 
              margin: '16px 0 24px 0',
              padding: '16px',
              background: theme.mode === 'dark'
                ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px',
              border: `1px solid ${theme.borderColor}`
            }}>
              <Space align="center">
                <Rate 
                  disabled 
                  defaultValue={4.5} 
                  allowHalf 
                  style={{ fontSize: '20px', color: '#faad14' }} 
                />
                <Text strong style={{ fontSize: '18px', color: theme.mode === 'dark' ? '#fff' : '#262626' }}>4.5</Text>
                <Divider type="vertical" style={{ height: '20px', margin: '0 8px' }} />
                <Text type="secondary" style={{ color: theme.secondaryText, fontSize: '14px' }}>
                  (0 đánh giá)
                </Text>
              </Space>
            </div>
            
            {/* Giá */}
            <div style={{ 
              marginBottom: '32px', 
              padding: '24px', 
              background: theme.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                : 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '16px',
              border: theme.mode === 'dark'
                ? '2px solid rgba(102, 126, 234, 0.2)'
                : '2px solid #667eea20'
            }}>
              {hasDiscount() ? (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space align="center" size="large">
                    <Text 
                      style={{ 
                        fontSize: '42px', 
                        fontWeight: 800, 
                        color: '#ff4d4f',
                        lineHeight: 1
                      }}
                    >
                      {Number(getCurrentPrice()).toLocaleString()}₫
                    </Text>
                    <Badge 
                      count={`-${getDiscountPercentage()}%`} 
                      style={{ 
                        backgroundColor: '#ff4d4f',
                        fontSize: '16px',
                        padding: '8px 16px',
                        height: 'auto',
                        borderRadius: '20px',
                        fontWeight: 700
                      }} 
                    />
                  </Space>
                  <Text 
                    delete 
                    style={{ 
                      fontSize: '20px', 
                      color: theme.mode === 'dark' ? '#666' : '#999',
                      fontWeight: 500
                    }}
                  >
                    {Number(product.price).toLocaleString()}₫
                  </Text>
                  <Space align="center" style={{ marginTop: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                    <Text style={{ fontSize: '14px', color: '#52c41a', fontWeight: 600 }}>
                      Tiết kiệm: {Number(product.price - product.discount_price).toLocaleString()}₫
                    </Text>
                  </Space>
                </Space>
              ) : (
                <Text 
                  style={{ 
                    fontSize: '42px', 
                    fontWeight: 800, 
                    color: theme.mode === 'dark' ? '#40a9ff' : '#1890ff',
                    lineHeight: 1
                  }}
                >
                  {Number(getCurrentPrice()).toLocaleString()}₫
                </Text>
              )}
              
              {/* Stock status */}
              <Divider style={{ margin: '20px 0' }} />
              <Space size="large">
                {getStockStatus().status === 'available' && (
                  <Space align="center">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                    <Text style={{ fontSize: '15px', color: '#52c41a', fontWeight: 600 }}>
                      {getStockStatus().text}
                    </Text>
                  </Space>
                )}
                {getStockStatus().status === 'low' && (
                  <Space align="center">
                    <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                    <Text style={{ fontSize: '15px', color: '#faad14', fontWeight: 600 }}>
                      {getStockStatus().text}
                    </Text>
                  </Space>
                )}
                {getStockStatus().status === 'out' && (
                  <Space align="center">
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                    <Text style={{ fontSize: '15px', color: '#ff4d4f', fontWeight: 600 }}>
                      {getStockStatus().text}
                    </Text>
                  </Space>
                )}
              </Space>
            </div>

            {/* Chọn variant */}
            <div style={{ marginBottom: '32px' }}>
              <Title level={4} style={{ marginBottom: '20px', color: theme.textColor, fontSize: '18px', fontWeight: 600 }}>
                Tùy chọn sản phẩm
              </Title>
              
              <Row gutter={[16, 20]}>
                <Col span={12}>
                  <Text strong style={{ display: 'block', marginBottom: '12px', color: theme.textColor, fontSize: '15px' }}>
                    Kích cỡ
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
                  <Text strong style={{ display: 'block', marginBottom: '12px', color: theme.textColor, fontSize: '15px' }}>
                    Màu sắc
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
            <div style={{ marginBottom: '32px' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px', color: theme.textColor, fontSize: '15px' }}>
                Số lượng
              </Text>
              
              <Space align="center" size="large">
                <InputNumber
                  min={1}
                  max={selectedVariant?.stock_quantity || 1}
                  value={quantity}
                  onChange={setQuantity}
                  size="large"
                  style={{ width: '140px' }}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                />
                {selectedVariant && (
                  <Text type="secondary" style={{ fontSize: '13px', color: theme.secondaryText }}>
                    Tối đa: {selectedVariant.stock_quantity} sản phẩm
                  </Text>
                )}
              </Space>
            </div>

            {/* Action Buttons */}
            <Row gutter={[12, 16]} style={{ marginBottom: '32px' }}>
              <Col xs={24} sm={10}>
                <Button
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={addToCart}
                  loading={addingToCart}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                  block
                  style={{ 
                    height: '56px', 
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: '2px solid #1890ff',
                    color: '#1890ff'
                  }}
                >
                  Thêm vào giỏ
                </Button>
              </Col>
              <Col xs={24} sm={10}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={buyNow}
                  loading={buyingNow}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                  block
                  style={{ 
                    height: '56px', 
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  Mua ngay
                </Button>
              </Col>
              <Col xs={12} sm={2}>
                <WishlistButton 
                  productId={product.id} 
                  size="large"
                  style={{ 
                    width: '100%', 
                    height: '56px', 
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Col>
              <Col xs={12} sm={2}>
                <Tooltip title="Chia sẻ">
                  <Button
                    size="large"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                    block
                    style={{ 
                      height: '56px', 
                      borderRadius: '12px',
                      border: '2px solid #f0f0f0'
                    }}
                  />
                </Tooltip>
              </Col>
            </Row>

            {/* Product features */}
            <div style={{ 
              background: theme.mode === 'dark'
                ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              padding: '24px', 
              borderRadius: '16px',
              marginBottom: '0',
              border: `1px solid ${theme.borderColor}`
            }}>
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Space size="middle">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TruckOutlined style={{ color: '#fff', fontSize: '24px' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                        Miễn phí vận chuyển
                      </Text>
                      <Text style={{ fontSize: '13px', color: '#666' }}>
                        Cho đơn hàng từ 500.000₫
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col span={24}>
                  <Space size="middle">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <SafetyCertificateOutlined style={{ color: '#fff', fontSize: '24px' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                        Bảo hành chính hãng
                      </Text>
                      <Text style={{ fontSize: '13px', color: '#666' }}>
                        Cam kết 100% hàng chính hãng
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col span={24}>
                  <Space size="middle">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ReloadOutlined style={{ color: '#fff', fontSize: '24px' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                        Đổi trả dễ dàng
                      </Text>
                      <Text style={{ fontSize: '13px', color: '#666' }}>
                        Trong vòng 7 ngày nếu có lỗi
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      <Row style={{ marginTop: '48px' }}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Tabs 
              defaultActiveKey="1" 
              size="large" 
              style={{ 
                backgroundColor: '#fff',
                borderRadius: '16px'
              }}
              tabBarStyle={{
                padding: '0 32px',
                margin: 0,
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                     Mô tả sản phẩm
                  </span>
                } 
                key="1"
              >
                <div style={{ padding: '32px' }}>
                  {product?.description ? (
                    <Paragraph style={{ 
                      fontSize: '16px', 
                      lineHeight: '1.8',
                      color: '#262626'
                    }}>
                      {product.description}
                    </Paragraph>
                  ) : (
                    <Text type="secondary" style={{ fontSize: '15px' }}>
                      Thông tin mô tả sản phẩm sẽ được cập nhật sau.
                    </Text>
                  )}
                  
                  {product?.material && (
                    <div style={{ 
                      marginTop: '24px',
                      padding: '20px',
                      background: '#f8f9fa',
                      borderRadius: '12px'
                    }}>
                      <Text strong style={{ fontSize: '15px', color: '#262626' }}>
                        Chất liệu:{' '}
                      </Text>
                      <Text style={{ fontSize: '15px', color: '#595959' }}>
                        {product.material}
                      </Text>
                    </div>
                  )}
                </div>
              </TabPane>
              
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                     Thông số kỹ thuật
                  </span>
                } 
                key="2"
              >
                <div style={{ padding: '32px' }}>
                  <Row gutter={[32, 24]}>
                    <Col span={12}>
                      <div style={{ 
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px'
                      }}>
                        <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                          Danh mục
                        </Text>
                        <Text strong style={{ fontSize: '15px' }}>
                          {product?.category?.name || 'N/A'}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ 
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px'
                      }}>
                        <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                          Thương hiệu
                        </Text>
                        <Text strong style={{ fontSize: '15px' }}>
                          {product?.brand?.name || 'N/A'}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ 
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px'
                      }}>
                        <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                          Mã sản phẩm
                        </Text>
                        <Text strong style={{ fontSize: '15px' }}>
                          {product?.sku || 'N/A'}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ 
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px'
                      }}>
                        <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                          Chất liệu
                        </Text>
                        <Text strong style={{ fontSize: '15px' }}>
                          {product?.material || 'N/A'}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>
              
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    ⭐ Đánh giá ({0})
                  </span>
                } 
                key="3"
              >
                <div style={{ padding: '32px' }}>
                  <div style={{ marginBottom: '40px' }}>
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
          </Card>
        </Col>
      </Row>
      
      </div>
    </div>
  );
};

export default ProductDetailPage;