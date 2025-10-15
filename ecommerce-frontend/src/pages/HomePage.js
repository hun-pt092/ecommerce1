import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../api/apiClient';
import { 
  Card, Row, Col, Button, Typography, Space, 
  Spin, message, Badge, Image, Tag, Input, Select, Affix, Carousel
} from 'antd';
import { 
  EyeOutlined, ShoppingCartOutlined, StarFilled, 
  ShopOutlined, TruckOutlined, SafetyOutlined, CustomerServiceOutlined,
  SearchOutlined, HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import WishlistButton from '../components/WishlistButton';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { theme } = useTheme();
  const navigate = useNavigate();

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };



  useEffect(() => {
    // Apply theme on mount
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
  }, [theme]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('products/'),
        apiClient.get('categories/').catch(() => ({ data: [] })) // Fallback if categories endpoint doesn't exist
      ]);
      
      // Handle pagination format - extract results if present
      const productsData = productsRes.data.results ? productsRes.data.results : productsRes.data;
      const categoriesData = categoriesRes.data.results ? categoriesRes.data.results : categoriesRes.data;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // Ensure products is an array
    if (!Array.isArray(products)) {
      return [];
    }
    
    let filtered = products;

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category && product.category.id.toString() === selectedCategory
      );
    }

    // Sort products - ensure filtered is array before spreading
    if (!Array.isArray(filtered)) {
      filtered = [];
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discount_price || a.price) - (b.discount_price || b.price);
        case 'price-high':
          return (b.discount_price || b.price) - (a.discount_price || a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    return sorted;
  }, [products, searchText, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .custom-carousel-dots {
          bottom: 20px !important;
        }
        .custom-carousel-dots li button {
          background: rgba(255,255,255,0.5) !important;
          border-radius: 50% !important;
          width: 12px !important;
          height: 12px !important;
        }
        .custom-carousel-dots li.slick-active button {
          background: white !important;
        }
      `}</style>
      
      <div style={{ 
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        minHeight: '100vh'
      }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '40px'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: '36px', marginBottom: '16px' }}>
          🛍️ Fashion Store
        </Title>
        <Text style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
          Khám phá bộ sưu tập thời trang mới nhất với phong cách độc đáo
        </Text>
        <div style={{ marginTop: '30px' }}>
          <Button 
            type="primary" 
            size="large" 
            style={{ 
              marginRight: '16px',
              background: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.3)'
            }}
            onClick={() => navigate('/products')}
          >
            Khám phá ngay
          </Button>
          <Button 
            type="ghost" 
            size="large"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
          >
            Tìm hiểu thêm
          </Button>
        </div>
      </div>

      {/* Slideshow Banner Section */}
      <div style={{ 
        marginBottom: '50px',
        maxWidth: '1400px',
        margin: '0 auto 50px auto',
        padding: '0 16px'
      }}>
        <Carousel 
          autoplay 
          autoplaySpeed={3000}
          dots={{ className: 'custom-carousel-dots' }}
          effect="fade"
        >
          {/* Slide 1 - Quần áo nam */}
          <div>
            <div 
              style={{
                height: '400px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedCategory('1'); // Assuming category ID 1 is for men's clothing
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '60px',
                transform: 'translateY(-50%)',
                color: 'white',
                maxWidth: '500px'
              }}>
                <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
                  👔 Thời trang Nam
                </Title>
                <Text style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: '24px' }}>
                  Bộ sưu tập mới 2025 - Phong cách lịch lãm, sang trọng
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.9)',
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }}
                >
                  Khám phá ngay
                </Button>
              </div>
              <div style={{
                position: 'absolute',
                right: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '120px',
                opacity: '0.3'
              }}>
                👔
              </div>
            </div>
          </div>

          {/* Slide 2 - Quần áo nữ */}
          <div>
            <div 
              style={{
                height: '400px',
                background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%)',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedCategory('2'); // Assuming category ID 2 is for women's clothing
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '60px',
                transform: 'translateY(-50%)',
                color: 'white',
                maxWidth: '500px'
              }}>
                <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
                  👗 Thời trang Nữ
                </Title>
                <Text style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: '24px' }}>
                  Xu hướng hot nhất 2025 - Thanh lịch, quyến rũ
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.9)',
                    color: '#FF6B9D',
                    fontWeight: 'bold'
                  }}
                >
                  Mua sắm ngay
                </Button>
              </div>
              <div style={{
                position: 'absolute',
                right: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '120px',
                opacity: '0.3'
              }}>
                👗
              </div>
            </div>
          </div>

          {/* Slide 3 - Phụ kiện */}
          <div>
            <div 
              style={{
                height: '400px',
                background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedCategory('8'); // Assuming category ID 8 is for accessories
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '60px',
                transform: 'translateY(-50%)',
                color: 'white',
                maxWidth: '500px'
              }}>
                <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
                  👜 Phụ kiện
                </Title>
                <Text style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: '24px' }}>
                  Hoàn thiện phong cách với phụ kiện độc đáo
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.9)',
                    color: '#9C27B0',
                    fontWeight: 'bold'
                  }}
                >
                  Xem ngay
                </Button>
              </div>
              <div style={{
                position: 'absolute',
                right: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '120px',
                opacity: '0.3'
              }}>
                👜
              </div>
            </div>
          </div>

          {/* Slide 4 - Sale/Promotion */}
          <div>
            <div 
              style={{
                height: '400px',
                background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSearchText('sale');
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '60px',
                transform: 'translateY(-50%)',
                color: 'white',
                maxWidth: '500px'
              }}>
                <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
                  🔥 SALE 50%
                </Title>
                <Text style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: '24px' }}>
                  Siêu khuyến mãi cuối năm - Giảm giá cực sốc!
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.9)',
                    color: '#FF5722',
                    fontWeight: 'bold'
                  }}
                >
                  Mua ngay
                </Button>
              </div>
              <div style={{
                position: 'absolute',
                right: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '120px',
                opacity: '0.3'
              }}>
                🏷️
              </div>
            </div>
          </div>
        </Carousel>
      </div>

      {/* Features Section */}
      <div style={{ 
        padding: '0 16px', 
        marginBottom: '50px',
        maxWidth: '1400px',
        margin: '0 auto 50px auto'
      }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <TruckOutlined style={{ fontSize: '36px', color: '#1890ff', marginBottom: '12px' }} />
              <Title level={4} style={{ fontSize: '16px', margin: '0 0 8px 0', color: theme.textColor }}>Giao hàng miễn phí</Title>
              <Text style={{ fontSize: '13px', color: theme.secondaryText }}>Miễn phí vận chuyển cho đơn hàng trên 500k</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <SafetyOutlined style={{ fontSize: '36px', color: '#52c41a', marginBottom: '12px' }} />
              <Title level={4} style={{ fontSize: '16px', margin: '0 0 8px 0', color: theme.textColor }}>Thanh toán bảo mật</Title>
              <Text style={{ fontSize: '13px', color: theme.secondaryText }}>Hệ thống thanh toán an toàn và bảo mật</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <CustomerServiceOutlined style={{ fontSize: '36px', color: '#fa8c16', marginBottom: '12px' }} />
              <Title level={4} style={{ fontSize: '16px', margin: '0 0 8px 0', color: theme.textColor }}>Hỗ trợ 24/7</Title>
              <Text style={{ fontSize: '13px', color: theme.secondaryText }}>Đội ngũ hỗ trợ khách hàng tận tình</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <ShopOutlined style={{ fontSize: '36px', color: '#eb2f96', marginBottom: '12px' }} />
              <Title level={4} style={{ fontSize: '16px', margin: '0 0 8px 0', color: theme.textColor }}>Chất lượng cao</Title>
              <Text style={{ fontSize: '13px', color: theme.secondaryText }}>Sản phẩm chính hãng, chất lượng đảm bảo</Text>
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ 
        padding: '0 16px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Search and Filter Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ marginBottom: '8px', color: theme.textColor }}>Tìm kiếm sản phẩm</Title>
            <Text style={{ fontSize: '14px', color: theme.secondaryText }}>
              Khám phá bộ sưu tập đa dạng của chúng tôi
            </Text>
          </div>
          
          <Affix offsetTop={60}>
            <Card 
              style={{ 
                marginBottom: '24px', 
                borderRadius: '12px',
                boxShadow: `0 2px 8px ${theme.shadowColor}`,
                background: theme.cardBackground,
                border: `1px solid ${theme.borderColor}`,
                zIndex: 100
              }}
              bodyStyle={{ padding: '20px' }}
            >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: '100%' }}
                  size="large"
                  allowClear
                />
              </Col>
              <Col xs={12} md={5}>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Danh mục"
                >
                  <Option value="all">Tất cả danh mục</Option>
                  {Array.isArray(categories) && categories.map(category => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} md={5}>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Sắp xếp"
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="price-low">Giá thấp → cao</Option>
                  <Option value="price-high">Giá cao → thấp</Option>
                  <Option value="name">Tên A → Z</Option>
                </Select>
              </Col>
              <Col xs={24} md={2}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ color: '#1890ff' }}>
                    {filteredAndSortedProducts.length}
                  </Text>
                  <br />
                  <Text style={{ fontSize: '12px', color: theme.secondaryText }}>
                    sản phẩm
                  </Text>
                </div>
              </Col>
            </Row>
            </Card>
          </Affix>
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={3} style={{ marginBottom: '8px', fontSize: '20px', color: theme.textColor }}>
                Danh mục phổ biến
              </Title>
              <Text style={{ fontSize: '14px', color: theme.secondaryText }}>
                Chọn nhanh theo danh mục yêu thích
              </Text>
            </div>
            <Row gutter={[12, 12]}>
              {categories.slice(0, 6).map(category => (
                <Col key={category.id} xs={12} sm={8} md={6} lg={4}>
                  <Card 
                    hoverable
                    size="small"
                    style={{ 
                      textAlign: 'center',
                      background: selectedCategory === category.id.toString() 
                        ? (theme.backgroundColor === '#001529' ? '#1f4788' : '#e6f7ff') 
                        : theme.cardBackground,
                      borderColor: selectedCategory === category.id.toString() ? '#1890ff' : theme.borderColor,
                      height: '100px',
                      cursor: 'pointer'
                    }}
                    bodyStyle={{ 
                      padding: '16px 12px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onClick={() => setSelectedCategory(category.id.toString())}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      📂
                    </div>
                    <Text style={{ 
                      fontSize: '12px',
                      fontWeight: selectedCategory === category.id.toString() ? 'bold' : 'normal',
                      color: selectedCategory === category.id.toString() ? '#1890ff' : theme.textColor
                    }}>
                      {category.name}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Products Section */}
        <div id="featured-products" style={{ marginBottom: '60px', scrollMarginTop: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: theme.textColor }}>
              {searchText || selectedCategory !== 'all' ? 'Kết quả tìm kiếm' : 'Sản phẩm nổi bật'}
            </Title>
            <Text style={{ fontSize: '14px', color: theme.secondaryText }}>
              {searchText || selectedCategory !== 'all' 
                ? `Tìm thấy ${filteredAndSortedProducts.length} sản phẩm`
                : 'Những sản phẩm được yêu thích nhất'
              }
            </Text>
          </div>
          
          <Row gutter={[16, 16]} justify="start">
            {filteredAndSortedProducts.slice(0, 12).map(prod => (
              <Col key={prod.id} xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: theme.cardBackground,
                    borderColor: theme.borderColor,
                    boxShadow: `0 2px 8px ${theme.shadowColor}`
                  }}
                  bodyStyle={{
                    padding: '16px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  cover={
                    <div 
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      {prod.images && prod.images.length > 0 ? (
                        <div style={{ 
                          height: '200px', 
                          width: '100%',
                          overflow: 'hidden'
                        }}>
                          <Image
                            alt={prod.name}
                            src={getImageUrl(prod.images[0].image)}
                            style={{ 
                              height: '100%', 
                              width: '100%',
                              objectFit: 'cover'
                            }}
                            preview={false}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN4BMghMgBBBIHcAFXQIbzaQy4wjEcQLfAAdwAJ3AAF8AJXAAJtFpNFhYEEjAlYGhFRNPm+e4zdvdDO46r7+v7Lr8N1f7yLrjCCEhwdgABelFiFKAU5SgwipKsXhQgTcELXAAE6X9fPjUwQU6RJCdNh1OkjFOkGWfXSA=="
                          />
                        </div>
                      ) : (
                        <div 
                          style={{ 
                            height: '200px', 
                            background: 'linear-gradient(45deg, #f0f2f5, #d9d9d9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            color: '#bfbfbf'
                          }}
                        >
                          👕
                        </div>
                      )}
                      {prod.is_featured && (
                        <Badge.Ribbon text="Nổi bật" color="red" />
                      )}
                    </div>
                  }
                  actions={[
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/products/${prod.id}`)}
                      size="small"
                    >
                      Chi tiết
                    </Button>,
                    <WishlistButton 
                      productId={prod.id}
                      size="small"
                      showText={false}
                    />,
                    <Button 
                      type="primary" 
                      icon={<ShoppingCartOutlined />}
                      onClick={() => navigate(`/products/${prod.id}`)}
                      size="small"
                    >
                      Mua
                    </Button>
                  ]}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '12px' }}>
                      <Title 
                        level={5} 
                        style={{ 
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          color: theme.textColor
                        }}
                        title={prod.name}
                      >
                        {prod.name}
                      </Title>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <Space size="small">
                        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                          <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                          <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                          <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <StarFilled style={{ color: '#d9d9d9', fontSize: '12px' }} />
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '50%',
                              height: '100%',
                              overflow: 'hidden'
                            }}>
                              <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                            </div>
                          </div>
                        </div>
                        <Text style={{ fontSize: '12px', color: theme.secondaryText }}>4.5 (128)</Text>
                      </Space>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      {prod.discount_price ? (
                        <div>
                          <Text style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            color: '#f5222d',
                            display: 'block'
                          }}>
                            {Number(prod.discount_price).toLocaleString()}₫
                          </Text>
                          <Text delete style={{ fontSize: '12px', color: theme.secondaryText }}>
                            {Number(prod.price).toLocaleString()}₫
                          </Text>
                        </div>
                      ) : (
                        <Text style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          color: '#1890ff'
                        }}>
                          {Number(prod.price).toLocaleString()}₫
                        </Text>
                      )}
                    </div>
                    
                    {prod.category && (
                      <div>
                        <Tag color="blue" size="small" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {prod.category.name}
                        </Tag>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          {filteredAndSortedProducts.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {searchText || selectedCategory !== 'all' ? '🔍' : '🛍️'}
              </div>
              <Title level={3} style={{ color: theme.secondaryText }}>
                {searchText || selectedCategory !== 'all' 
                  ? 'Không tìm thấy sản phẩm nào' 
                  : 'Chưa có sản phẩm nào'
                }
              </Title>
              <Text style={{ fontSize: '14px', color: theme.secondaryText }}>
                {searchText || selectedCategory !== 'all'
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc danh mục'
                  : 'Cửa hàng đang cập nhật sản phẩm mới. Vui lòng quay lại sau!'
                }
              </Text>
              {(searchText || selectedCategory !== 'all') && (
                <div style={{ marginTop: '20px' }}>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      setSearchText('');
                      setSelectedCategory('all');
                    }}
                  >
                    Xem tất cả sản phẩm
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {filteredAndSortedProducts.length > 12 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Text style={{ marginRight: '16px', color: theme.secondaryText }}>
                Hiển thị 12/{filteredAndSortedProducts.length} sản phẩm
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/products')}
              >
                Xem tất cả sản phẩm
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default HomePage;
