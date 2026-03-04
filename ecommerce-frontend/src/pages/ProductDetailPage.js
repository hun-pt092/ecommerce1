import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  ArrowRightOutlined,
  ShareAltOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  MinusOutlined
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
  const [selectedVariant, setSelectedVariant] = useState(null); // ProductVariant (color)
  const [selectedSKU, setSelectedSKU] = useState(null); // ProductSKU (size)
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselRef = useRef(null); // Dùng useRef thay vì useState
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  // Lấy tất cả ảnh của variant đang chọn
  const getCurrentVariantImages = () => {
    if (!selectedVariant) return [];
    
    const images = [];
    
    // Lấy từ images array (ưu tiên)
    if (selectedVariant.images && selectedVariant.images.length > 0) {
      selectedVariant.images.forEach(img => {
        const url = getImageUrl(img.image || img);
        if (url) images.push(url);
      });
    }
    // Fallback: nếu có primary_image
    else if (selectedVariant.primary_image) {
      images.push(getImageUrl(selectedVariant.primary_image));
    }
    // Fallback: nếu có image cũ
    else if (selectedVariant.image) {
      images.push(getImageUrl(selectedVariant.image));
    }
    
    return images;
  };

  // Lấy tất cả màu và ảnh đại diện của chúng
  const getAllColorImages = () => {
    if (!product?.variants) return [];
    const colorImageMap = {};
    
    product.variants.forEach(variant => {
      if (variant.color && !colorImageMap[variant.color]) {
        // Lấy ảnh đại diện
        let imageUrl = null;
        if (variant.primary_image) {
          imageUrl = getImageUrl(variant.primary_image);
        } else if (variant.images && variant.images.length > 0) {
          imageUrl = getImageUrl(variant.images[0].image || variant.images[0]);
        } else if (variant.image) {
          imageUrl = getImageUrl(variant.image);
        }
        
        if (imageUrl) {
          colorImageMap[variant.color] = {
            color: variant.color,
            image: imageUrl
          };
        }
      }
    });
    
    return Object.values(colorImageMap);
  };

  // Di chuyển tới màu trước
  const handlePrevColor = () => {
    const colorImages = getAllColorImages();
    if (colorImages.length === 0) return;
    
    const newIndex = currentColorIndex > 0 ? currentColorIndex - 1 : colorImages.length - 1;
    setCurrentColorIndex(newIndex);
    handleColorChange(colorImages[newIndex].color);
  };

  // Di chuyển tới màu tiếp theo
  const handleNextColor = () => {
    const colorImages = getAllColorImages();
    if (colorImages.length === 0) return;
    
    const newIndex = currentColorIndex < colorImages.length - 1 ? currentColorIndex + 1 : 0;
    setCurrentColorIndex(newIndex);
    handleColorChange(colorImages[newIndex].color);
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
      
      // Tự động chọn màu và size đầu tiên nếu có
      if (response.data.variants && response.data.variants.length > 0) {
        const firstVariant = response.data.variants[0];
        setSelectedColor(firstVariant.color);
        setSelectedVariant(firstVariant);
        
        // Chọn SKU đầu tiên của variant này
        if (firstVariant.skus && firstVariant.skus.length > 0) {
          const firstSKU = firstVariant.skus[0];
          setSelectedSKU(firstSKU);
          setSelectedSize(firstSKU.size);
        }
      }
    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setActiveImageIndex(0); // Reset về ảnh đầu tiên
    
    // Cập nhật index của màu
    const colorImages = getAllColorImages();
    const colorIndex = colorImages.findIndex(item => item.color === color);
    if (colorIndex !== -1) {
      setCurrentColorIndex(colorIndex);
    }
    
    // Tìm variant theo màu và chọn SKU đầu tiên
    const variant = product.variants.find(v => v.color === color);
    if (variant) {
      setSelectedVariant(variant);
      // Chọn SKU đầu tiên của variant này
      if (variant.skus && variant.skus.length > 0) {
        const firstSKU = variant.skus[0];
        setSelectedSKU(firstSKU);
        setSelectedSize(firstSKU.size);
      } else {
        setSelectedSKU(null);
        setSelectedSize(null);
      }
    } else {
      setSelectedVariant(null);
      setSelectedSKU(null);
      setSelectedSize(null);
    }
    setQuantity(1);
    
    // Reset carousel về slide đầu tiên
    if (carouselRef.current) {
      carouselRef.current.goTo(0);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    // Tìm SKU với size đã chọn trong variant hiện tại
    if (selectedVariant && selectedVariant.skus) {
      const sku = selectedVariant.skus.find(s => s.size === size);
      if (sku) {
        setSelectedSKU(sku);
      }
    }
    setQuantity(1);
  };

  const addToCart = async () => {
    if (!selectedSKU) {
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
      // Sử dụng PUT method mới với product_sku_id
      await authAxios.put('cart/', { 
        product_sku_id: selectedSKU.id,
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
    if (!selectedSKU || !selectedVariant) {
      message.warning('Vui lòng chọn kích cỡ và màu sắc');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      message.warning('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    // Tạo temporary cart data với cấu trúc mới (ProductSKU)
    const finalPrice = selectedSKU.final_price || selectedVariant.final_price;
    const tempCartData = {
      items: [{
        id: `temp_${selectedSKU.id}`,
        product_sku: {
          id: selectedSKU.id,
          size: selectedSKU.size,
          sku: selectedSKU.sku,
          stock_quantity: selectedSKU.stock_quantity,
          available_quantity: selectedSKU.available_quantity,
          final_price: parseFloat(finalPrice) || 0,
          variant: {
            id: selectedVariant.id,
            color: selectedVariant.color,
            price: parseFloat(selectedVariant.price) || 0,
            discount_price: selectedVariant.discount_price ? parseFloat(selectedVariant.discount_price) : null,
            images: selectedVariant.images || [],  // Thêm images của variant
            product: {
              id: product.id,
              name: product.name,
              category: product.category,
              brand: product.brand,
              description: product.description
            }
          }
        },
        quantity: parseInt(quantity) || 1,
        price: parseFloat(finalPrice) || 0
      }]
    };
    
    console.log('=== BuyNow Temp Cart Data (SKU) Debug ===');
    console.log('Selected SKU:', selectedSKU);
    console.log('Selected Variant:', selectedVariant);
    console.log('Final price used:', finalPrice);
    console.log('Temp cart data:', tempCartData);

    // Lưu temporary cart data vào sessionStorage
    sessionStorage.setItem('temp_cart_data', JSON.stringify(tempCartData));
    
    // Chuyển thẳng đến trang checkout với flag buyNow
    navigate('/checkout?buyNow=true');
  };

  const getAvailableColors = () => {
    if (!product || !product.variants) return [];
    // Lấy tất cả màu không trùng lặp
    return [...new Set(product.variants.map(v => v.color))];
  };

  const getAvailableSizes = () => {
    if (!product || !product.variants) return [];
    if (!selectedVariant) return [];
    
    // Lấy sizes từ SKUs của variant đang chọn
    if (selectedVariant.skus && selectedVariant.skus.length > 0) {
      return selectedVariant.skus.map(sku => sku.size);
    }
    return [];
  };

  const getCurrentPrice = () => {
    // Get price from selected variant
    if (selectedVariant) {
      return selectedVariant.discount_price || selectedVariant.price;
    }
    // Fallback to first variant if no variant selected
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      return firstVariant.discount_price || firstVariant.price;
    }
    return 0;
  };

  const hasDiscount = () => {
    if (selectedVariant) {
      return selectedVariant.discount_price && selectedVariant.discount_price < selectedVariant.price;
    }
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      return firstVariant.discount_price && firstVariant.discount_price < firstVariant.price;
    }
    return false;
  };

  const getDiscountPercentage = () => {
    if (!hasDiscount()) return 0;
    let originalPrice, discountPrice;
    
    if (selectedVariant) {
      originalPrice = selectedVariant.price;
      discountPrice = selectedVariant.discount_price;
    } else if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      originalPrice = firstVariant.price;
      discountPrice = firstVariant.discount_price;
    } else {
      return 0;
    }
    
    return Math.round((1 - discountPrice / originalPrice) * 100);
  };

  const getStockStatus = () => {
    if (!selectedSKU) return { status: 'unknown', text: 'Chọn phiên bản', color: 'default' };
    const stock = selectedSKU.available_quantity || selectedSKU.stock_quantity || 0;
    if (stock === 0) return { status: 'out', text: 'Hết hàng', color: 'error' };
    if (stock <= 5) return { status: 'low', text: `Còn ${stock} sản phẩm`, color: 'warning' };
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
              {getCurrentVariantImages().length > 0 ? (
                <div>
                  {/* Main Image Carousel */}
                  <Carousel
                    ref={carouselRef}
                    afterChange={(index) => setActiveImageIndex(index)}
                    dotPosition="bottom"
                    style={{ background: theme.mode === 'dark' ? '#1a1a1a' : '#fafafa' }}
                  >
                    {getCurrentVariantImages().map((imageUrl, index) => (
                      <div key={index} style={{ 
                        width: '100%',
                        height: '500px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'
                      }}>
                        <Image
                          width="100%"
                          height="500px"
                          src={imageUrl}
                          alt={`${product.name} - ${selectedColor} - ${index + 1}`}
                          style={{ objectFit: 'cover' }}
                          preview={false}
                          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E"
                        />
                      </div>
                    ))}
                  </Carousel>

                  {/* Thumbnail Gallery cho ảnh của variant hiện tại */}
                  {getCurrentVariantImages().length > 1 && (
                    <div style={{ 
                      padding: '16px',
                      display: 'flex',
                      gap: '12px',
                      overflowX: 'auto',
                      background: theme.mode === 'dark' ? '#1a1a1a' : '#fafafa',
                      borderTop: `1px solid ${theme.borderColor}`
                    }}>
                      {getCurrentVariantImages().map((imageUrl, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setActiveImageIndex(index);
                            if (carouselRef.current) {
                              carouselRef.current.goTo(index);
                            }
                          }}
                          style={{ 
                            minWidth: '80px',
                            width: '80px',
                            height: '80px',
                            border: activeImageIndex === index
                              ? '3px solid #1890ff' 
                              : `2px solid ${theme.borderColor}`,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: activeImageIndex === index ? 1 : 0.6,
                            transform: activeImageIndex === index ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Thumbnail ${index + 1}`}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Color indicator - hiển thị màu đang chọn */}
                  {getAllColorImages().length > 1 && (
                    <div style={{ 
                      padding: '16px',
                      background: theme.mode === 'dark' ? '#141414' : '#fff',
                      borderTop: `1px solid ${theme.borderColor}`
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        marginBottom: '12px',
                        color: theme.textColor
                      }}>
                        Chọn màu sắc: <span style={{ color: '#1890ff' }}>{selectedColor}</span>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        {getAllColorImages().map((item, index) => (
                          <Tooltip key={item.color} title={item.color}>
                            <div
                              style={{ 
                                width: '60px',
                                height: '60px',
                                border: selectedColor === item.color
                                  ? '3px solid #1890ff' 
                                  : `2px solid ${theme.borderColor}`,
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                opacity: selectedColor === item.color ? 1 : 0.7,
                                transform: selectedColor === item.color ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: selectedColor === item.color 
                                  ? '0 4px 12px rgba(24, 144, 255, 0.3)' 
                                  : 'none'
                              }}
                              onClick={() => handleColorChange(item.color)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1.08)';
                              }}
                              onMouseLeave={(e) => {
                                if (selectedColor !== item.color) {
                                  e.currentTarget.style.opacity = '0.7';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            >
                              <img
                                src={item.image}
                                alt={item.color}
                                style={{ 
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          </Tooltip>
                        ))}
                      </div>
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
                    {Number(selectedVariant ? selectedVariant.price : (product?.variants?.[0]?.price || 0)).toLocaleString()}₫
                  </Text>
                  <Space align="center" style={{ marginTop: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                    <Text style={{ fontSize: '14px', color: '#52c41a', fontWeight: 600 }}>
                      Tiết kiệm: {Number(
                        selectedVariant 
                          ? (selectedVariant.price - selectedVariant.discount_price)
                          : (product?.variants?.[0] ? (product.variants[0].price - product.variants[0].discount_price) : 0)
                      ).toLocaleString()}₫
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

            {/* Chọn variant - Modernized */}
            <div style={{ marginBottom: '32px' }}>
              {/* Màu sắc */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <Text strong style={{ fontSize: '16px', color: theme.textColor, fontWeight: 600 }}>
                    Màu sắc
                  </Text>
                  <Tag 
                    color="blue" 
                    style={{ 
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontWeight: 500,
                      fontSize: '13px'
                    }}
                  >
                    {selectedColor || 'Chọn màu'}
                  </Tag>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  {getAvailableColors().map(color => {
                    const isSelected = selectedColor === color;
                    return (
                      <div
                        key={color}
                        onClick={() => handleColorChange(color)}
                        style={{
                          position: 'relative',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          border: isSelected 
                            ? '3px solid #1890ff' 
                            : `2px solid ${theme.borderColor}`,
                          background: isSelected
                            ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                            : theme.cardBackground,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isSelected 
                            ? '0 4px 16px rgba(24, 144, 255, 0.2)' 
                            : '0 2px 8px rgba(0,0,0,0.05)',
                          transform: isSelected ? 'translateY(-2px)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                          }
                        }}
                      >
                        {isSelected && (
                          <CheckCircleOutlined 
                            style={{ 
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              fontSize: '20px',
                              color: '#1890ff',
                              background: '#fff',
                              borderRadius: '50%'
                            }} 
                          />
                        )}
                        <Text 
                          strong 
                          style={{ 
                            fontSize: '15px',
                            color: isSelected ? '#1890ff' : theme.textColor,
                            fontWeight: 600
                          }}
                        >
                          {color}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kích cỡ */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <Text strong style={{ fontSize: '16px', color: theme.textColor, fontWeight: 600 }}>
                    Kích cỡ
                  </Text>
                  <Tag 
                    color="green" 
                    style={{ 
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontWeight: 500,
                      fontSize: '13px'
                    }}
                  >
                    {selectedSize || 'Chọn size'}
                  </Tag>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  {getAvailableSizes().map(size => {
                    const isSelected = selectedSize === size;
                    const isDisabled = !selectedColor;
                    return (
                      <div
                        key={size}
                        onClick={() => !isDisabled && handleSizeChange(size)}
                        style={{
                          position: 'relative',
                          minWidth: '70px',
                          padding: '14px 20px',
                          borderRadius: '12px',
                          border: isSelected 
                            ? '3px solid #52c41a' 
                            : `2px solid ${theme.borderColor}`,
                          background: isDisabled 
                            ? (theme.mode === 'dark' ? '#1f1f1f' : '#f5f5f5')
                            : isSelected
                              ? 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
                              : theme.cardBackground,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isSelected 
                            ? '0 4px 16px rgba(82, 196, 26, 0.2)' 
                            : '0 2px 8px rgba(0,0,0,0.05)',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                          opacity: isDisabled ? 0.4 : 1,
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && !isDisabled) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && !isDisabled) {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                          }
                        }}
                      >
                        {isSelected && (
                          <CheckCircleOutlined 
                            style={{ 
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              fontSize: '20px',
                              color: '#52c41a',
                              background: '#fff',
                              borderRadius: '50%'
                            }} 
                          />
                        )}
                        <Text 
                          strong 
                          style={{ 
                            fontSize: '16px',
                            color: isDisabled 
                              ? (theme.mode === 'dark' ? '#666' : '#999')
                              : isSelected 
                                ? '#52c41a' 
                                : theme.textColor,
                            fontWeight: 700
                          }}
                        >
                          {size}
                        </Text>
                      </div>
                    );
                  })}
                </div>
                {!selectedColor && (
                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: theme.mode === 'dark' ? 'rgba(250, 173, 20, 0.1)' : '#fffbe6',
                    borderRadius: '8px',
                    border: '1px solid #ffe58f',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                    <Text style={{ fontSize: '14px', color: '#faad14' }}>
                      Vui lòng chọn màu sắc trước
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Số lượng - Modernized */}
            <div style={{ 
              marginBottom: '32px',
              padding: '20px',
              background: theme.mode === 'dark' 
                ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '16px',
              border: `1px solid ${theme.borderColor}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <Text strong style={{ fontSize: '16px', color: theme.textColor, fontWeight: 600 }}>
                  Số lượng
                </Text>
                {selectedSKU && (
                  <Tag color="cyan" style={{ borderRadius: '20px', padding: '4px 12px' }}>
                    Còn {selectedSKU.available_quantity || selectedSKU.stock_quantity} sản phẩm
                  </Tag>
                )}
              </div>
              
              <InputNumber
                min={1}
                max={selectedSKU?.available_quantity || selectedSKU?.stock_quantity || 1}
                value={quantity}
                onChange={setQuantity}
                size="large"
                disabled={!selectedSKU || (selectedSKU.available_quantity || selectedSKU.stock_quantity) === 0}
                style={{ 
                  width: '100%',
                  borderRadius: '12px'
                }}
                controls={{
                  upIcon: <PlusOutlined style={{ fontSize: '14px' }} />,
                  downIcon: <MinusOutlined style={{ fontSize: '14px' }} />
                }}
              />
            </div>

            {/* Action Buttons - Modernized */}
            <div style={{ 
              padding: '24px',
              background: theme.mode === 'dark'
                ? 'rgba(24, 144, 255, 0.05)'
                : 'rgba(24, 144, 255, 0.02)',
              borderRadius: '20px',
              border: `2px solid ${theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.2)' : 'rgba(24, 144, 255, 0.1)'}`,
              marginBottom: '32px'
            }}>
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={24} md={10}>
                  <Button
                    size="large"
                    icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />}
                    onClick={addToCart}
                    loading={addingToCart}
                    disabled={!selectedSKU || (selectedSKU.available_quantity || selectedSKU.stock_quantity) === 0}
                    block
                    style={{ 
                      height: '60px', 
                      borderRadius: '14px',
                      fontSize: '16px',
                      fontWeight: 700,
                      border: '3px solid #1890ff',
                      color: '#1890ff',
                      background: theme.cardBackground,
                      boxShadow: '0 4px 16px rgba(24, 144, 255, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.1)';
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </Col>
                <Col xs={24} sm={24} md={10}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingOutlined style={{ fontSize: '18px' }} />}
                    onClick={buyNow}
                    loading={buyingNow}
                    disabled={!selectedSKU || (selectedSKU.available_quantity || selectedSKU.stock_quantity) === 0}
                    block
                    style={{ 
                      height: '60px', 
                      borderRadius: '14px',
                      fontSize: '16px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    Mua ngay
                  </Button>
                </Col>
                <Col xs={12} sm={12} md={2}>
                  <WishlistButton 
                    productId={product.id} 
                    size="large"
                    style={{ 
                      width: '100%', 
                      height: '60px', 
                      borderRadius: '14px',
                      border: '2px solid #ff4d4f'
                    }}
                  />
                </Col>
                <Col xs={12} sm={12} md={2}>
                  <Tooltip title="Chia sẻ">
                    <Button
                      size="large"
                      icon={<ShareAltOutlined style={{ fontSize: '18px' }} />}
                      onClick={handleShare}
                      block
                      style={{ 
                        height: '60px', 
                        borderRadius: '14px',
                        border: `2px solid ${theme.borderColor}`,
                        background: theme.cardBackground
                      }}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </div>

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