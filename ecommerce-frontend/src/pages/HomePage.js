import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../api/apiClient';
import { 
  Card, Row, Col, Button, Typography, Space, 
  Spin, message, Badge, Image, Tag, Carousel,
  Select, Slider, Checkbox, Divider, Input
} from 'antd';
import { 
  EyeOutlined, ShoppingCartOutlined, StarFilled, 
  ShopOutlined, TruckOutlined, SafetyOutlined, CustomerServiceOutlined,
  SearchOutlined, HeartOutlined, FilterOutlined, ClearOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import WishlistButton from '../components/WishlistButton';
import logoImage from '../logo (2).png';

const { Title, Text } = Typography;
const { Option } = Select;

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showAll, setShowAll] = useState(false);

  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get URL params for filtering
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchText(searchParam);
    }
    
    // Reset showAll when filters change
    setShowAll(false);
  }, [location.search]);

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
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        apiClient.get('products/?page_size=100'),
        apiClient.get('categories/?page_size=100').catch(() => ({ data: [] })),
        apiClient.get('brands/?page_size=100').catch(() => ({ data: [] }))
      ]);
      
      // Handle pagination format - extract results if present
      const productsData = productsRes.data.results ? productsRes.data.results : productsRes.data;
      const categoriesData = categoriesRes.data.results ? categoriesRes.data.results : categoriesRes.data;
      const brandsData = brandsRes.data.results ? brandsRes.data.results : brandsRes.data;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      
      // Set max price for slider
      if (Array.isArray(productsData) && productsData.length > 0) {
        const maxPrice = Math.max(...productsData.map(p => p.price || 0));
        setPriceRange([0, maxPrice]);
      }
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

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        product.brand && selectedBrands.includes(product.brand.id)
      );
    }

    // Filter by price range - use price from API (backend returns variant price)
    filtered = filtered.filter(product => {
      const price = product.price || 0; // Backend's get_price() returns first variant's price
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort products - ensure filtered is array before spreading
    if (!Array.isArray(filtered)) {
      filtered = [];
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0); // Backend returns variant price
        case 'price-high':
          return (b.price || 0) - (a.price || 0); // Backend returns variant price
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    return sorted;
  }, [products, searchText, selectedCategory, selectedBrands, priceRange, sortBy]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSortBy('newest');
    if (Array.isArray(products) && products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.price || 0));
      setPriceRange([0, maxPrice]);
    }
  };

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
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(118, 75, 162, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.8), 0 0 60px rgba(118, 75, 162, 0.6);
            transform: scale(1.05);
          }
        }
        
        .buy-now-button {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        /* Override Slider colors to keep consistent in both themes */
        .ant-slider-rail {
          background-color: #f0f0f0 !important;
        }
        
        .ant-slider-track {
          background-color: #1890ff !important;
        }
        
        .ant-slider-handle {
          border-color: #1890ff !important;
        }
        
        .ant-slider-handle:focus {
          border-color: #40a9ff !important;
          box-shadow: 0 0 0 5px rgba(24, 144, 255, 0.2) !important;
        }
        
        .ant-slider-dot-active {
          border-color: #1890ff !important;
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
      {/* Modern Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Shapes */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          top: '-200px',
          right: '-150px',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          bottom: '-150px',
          left: '-100px',
          animation: 'float 8s ease-in-out infinite'
        }} />
        
        {/* Content Container */}
        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* Logo with Animation */}
          <div style={{ 
            marginBottom: '32px',
            animation: 'fadeInDown 1s ease-out'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              marginBottom: '20px'
            }}>
              <img 
                src={logoImage} 
                alt="PKA Shop" 
                style={{ 
                  height: '50px',
                  display: 'block'
                }} 
              />
            </div>
          </div>
          
          {/* Main Heading */}
          <Title 
            level={1} 
            style={{ 
              color: 'white', 
              fontSize: '52px', 
              marginBottom: '24px',
              fontWeight: 800,
              lineHeight: 1.2,
              textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              animation: 'fadeInUp 1s ease-out 0.2s both'
            }}
          >
            Welcome to <span style={{ 
              background: 'linear-gradient(135deg, #FFE082 0%, #FFF9C4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>PKA Shop</span>
          </Title>
          
          {/* Subtitle */}
          <Text style={{ 
            fontSize: '20px', 
            color: 'rgba(255,255,255,0.95)',
            display: 'block',
            marginBottom: '12px',
            lineHeight: 1.6,
            fontWeight: 500,
            textShadow: '0 2px 10px rgba(0,0,0,0.15)',
            animation: 'fadeInUp 1s ease-out 0.4s both'
          }}>
            Khám phá bộ sưu tập thời trang mới nhất
          </Text>
          
          <Text style={{ 
            fontSize: '16px', 
            color: 'rgba(255,255,255,0.85)',
            display: 'block',
            marginBottom: '40px',
            animation: 'fadeInUp 1s ease-out 0.6s both'
          }}>
            Phong cách độc đáo • Chất lượng cao cấp • Xu hướng 2025
          </Text>
          
          {/* Action Buttons */}
          <div style={{ 
            marginTop: '40px',
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 1s ease-out 0.8s both'
          }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<ShoppingCartOutlined />}
              style={{ 
                height: '56px',
                padding: '0 40px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'white',
                borderColor: 'white',
                color: '#667eea',
                borderRadius: '28px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                // Scroll to featured products section
                setTimeout(() => {
                  const featuredSection = document.getElementById('featured-products');
                  if (featuredSection) {
                    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
            >
              Khám phá ngay
            </Button>
            <Button 
              size="large"
              icon={<HeartOutlined />}
              style={{ 
                height: '56px',
                padding: '0 40px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.4)',
                color: 'white',
                borderRadius: '28px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                // Navigate to products page to see full collection
                navigate('/products');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Bộ sưu tập mới
            </Button>
          </div>
          
          {/* Stats/Features Pills */}
          <div style={{
            marginTop: '50px',
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeIn 1s ease-out 1s both'
          }}>
            <div style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '14px',
              fontWeight: 600
            }}>
              ✨ Miễn phí vận chuyển
            </div>
            <div style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '14px',
              fontWeight: 600
            }}>
              🎁 Ưu đãi đặc biệt
            </div>
            <div style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '14px',
              fontWeight: 600
            }}>
              🔒 Thanh toán bảo mật
            </div>
          </div>
        </div>
      </div>

      {/* Modern Slideshow Banner Section */}
      <div style={{ 
        marginBottom: '60px',
        maxWidth: '1400px',
        margin: '0 auto 60px auto',
        padding: '0 20px'
      }}>
        <Carousel 
          autoplay 
          autoplaySpeed={2500}
          dots={{ className: 'custom-carousel-dots' }}
          effect="fade"
        >
          {/* Slide 1 - Men's Fashion (Quần áo nam) */}
          <div>
            <div 
              style={{
                height: '500px',
                background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={() => {
                // Navigate to men's clothing category on homepage
                navigate('/?category=2');
                setTimeout(() => {
                  const featuredSection = document.getElementById('featured-products');
                  if (featuredSection) {
                    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              {/* Decorative circles */}
              <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                top: '-100px',
                right: '-100px'
              }} />
              <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                bottom: '-50px',
                right: '150px'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '80px',
                transform: 'translateY(-50%)',
                color: 'white',
                maxWidth: '600px',
                zIndex: 2
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '30px',
                  marginBottom: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Text style={{ color: 'white', fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>
                    NEW COLLECTION 2025
                  </Text>
                </div>
                <Title level={1} style={{ 
                  color: 'white', 
                  fontSize: '56px', 
                  marginBottom: '20px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                  Quần Áo Nam
                </Title>
                <Text style={{ 
                  fontSize: '20px', 
                  color: 'rgba(255,255,255,0.95)', 
                  display: 'block', 
                  marginBottom: '32px',
                  lineHeight: 1.6,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  Bộ sưu tập thời trang nam cao cấp
                  <br />
                  Phong cách lịch lãm, nam tính và hiện đại
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    height: '56px',
                    padding: '0 40px',
                    background: 'white',
                    borderColor: 'white',
                    color: '#2c3e50',
                    fontWeight: 700,
                    fontSize: '16px',
                    borderRadius: '28px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                  }}
                >
                  XEM BỘ SƯU TẬP NAM →
                </Button>
              </div>
              
              {/* Modern icon/illustration */}
              <div style={{
                position: 'absolute',
                right: '100px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '280px',
                height: '280px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,255,255,0.2)'
              }}>
                <ShopOutlined style={{ fontSize: '120px', color: 'rgba(255,255,255,0.9)' }} />
              </div>
            </div>
          </div>

          {/* Slide 2 - Women's Fashion (Quần áo nữ) */}
          <div>
            <div 
              style={{
                height: '500px',
                background: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={() => {
                // Navigate to women's clothing category on homepage
                navigate('/?category=3');
                setTimeout(() => {
                  const featuredSection = document.getElementById('featured-products');
                  if (featuredSection) {
                    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                top: '-80px',
                right: '-80px'
              }} />
              <div style={{
                position: 'absolute',
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                bottom: '-60px',
                left: '200px'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '80px',
                transform: 'translateY(-50%)',
                color: 'white',
                maxWidth: '600px',
                zIndex: 2
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '30px',
                  marginBottom: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Text style={{ color: 'white', fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>
                    TRENDING NOW
                  </Text>
                </div>
                <Title level={1} style={{ 
                  color: 'white', 
                  fontSize: '56px', 
                  marginBottom: '20px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                  Quần Áo Nữ
                </Title>
                <Text style={{ 
                  fontSize: '20px', 
                  color: 'rgba(255,255,255,0.95)', 
                  display: 'block', 
                  marginBottom: '32px',
                  lineHeight: 1.6,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  Xu hướng thời trang nữ hot nhất 2025
                  <br />
                  Thanh lịch, quyến rũ và đầy phong cách
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    height: '56px',
                    padding: '0 40px',
                    background: 'white',
                    borderColor: 'white',
                    color: '#FF6B9D',
                    fontWeight: 700,
                    fontSize: '16px',
                    borderRadius: '28px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                  }}
                >
                  XEM BỘ SƯU TẬP NỮ →
                </Button>
              </div>
              
              <div style={{
                position: 'absolute',
                right: '100px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '280px',
                height: '280px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,255,255,0.2)'
              }}>
                <ShoppingCartOutlined style={{ fontSize: '120px', color: 'rgba(255,255,255,0.9)' }} />
              </div>
            </div>
          </div>

          {/* Slide 3 - Featured Products (Sản phẩm nổi bật) */}
          <div>
            <div 
              style={{
                height: '500px',
                background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={() => {
                // Scroll to featured products on homepage
                setTimeout(() => {
                  const featuredSection = document.getElementById('featured-products');
                  if (featuredSection) {
                    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              {/* Animated background patterns */}
              <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                top: '-100px',
                left: '-100px',
                animation: 'pulse 3s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                bottom: '-80px',
                right: '100px'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '80px',
                transform: 'translateY(-50%)',
                color: 'white',
                maxWidth: '650px',
                zIndex: 2
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: '30px',
                  marginBottom: '20px',
                  backdropFilter: 'blur(10px)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  <Text style={{ color: 'white', fontSize: '14px', fontWeight: 700, letterSpacing: '2px' }}>
                    ⭐ BEST SELLERS
                  </Text>
                </div>
                <Title level={1} style={{ 
                  color: 'white', 
                  fontSize: '64px', 
                  marginBottom: '16px',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  textShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}>
                  Sản Phẩm
                  <br />
                  <span style={{ fontSize: '56px', color: '#FFE082' }}>
                    NỔI BẬT
                  </span>
                </Title>
                <Text style={{ 
                  fontSize: '20px', 
                  color: 'rgba(255,255,255,0.95)', 
                  display: 'block', 
                  marginBottom: '32px',
                  lineHeight: 1.6,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  fontWeight: 500
                }}>
                  Top sản phẩm bán chạy nhất - Được yêu thích nhất
                  <br />
                  Chất lượng đảm bảo • Giá tốt nhất • Đánh giá 5 sao
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    height: '56px',
                    padding: '0 40px',
                    background: 'white',
                    borderColor: 'white',
                    color: '#FF5722',
                    fontWeight: 700,
                    fontSize: '16px',
                    borderRadius: '28px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                  }}
                >
                  XEM SẢN PHẨM NỔI BẬT →
                </Button>
              </div>
              
              <div style={{
                position: 'absolute',
                right: '100px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '280px',
                height: '280px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,255,255,0.3)'
              }}>
                <StarFilled style={{ fontSize: '120px', color: 'rgba(255,255,255,0.9)' }} />
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
        {/* Products Section */}
        <div id="featured-products" style={{ marginBottom: '60px', scrollMarginTop: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: theme.textColor }}>
              {searchText || selectedCategory !== 'all' || selectedBrands.length > 0 ? 'Kết quả tìm kiếm' : 'Sản phẩm nổi bật'}
            </Title>
            <Text style={{ fontSize: '14px', color: theme.secondaryText }}>
              {searchText || selectedCategory !== 'all' || selectedBrands.length > 0
                ? `Tìm thấy ${filteredAndSortedProducts.length} sản phẩm`
                : 'Những sản phẩm được yêu thích nhất'
              }
            </Text>
          </div>

          {/* Filter Section */}
          <Card 
            style={{
              marginBottom: '32px',
              background: theme.cardBackground,
              borderColor: theme.borderColor,
              boxShadow: theme.mode === 'dark' 
                ? '0 4px 16px rgba(0,0,0,0.3)' 
                : '0 4px 16px rgba(0,0,0,0.08)',
              borderRadius: '12px'
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={24} lg={24}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FilterOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                      <Title level={4} style={{ margin: 0, color: theme.textColor }}>Bộ lọc sản phẩm</Title>
                    </div>
                    <Button 
                      icon={<ClearOutlined />} 
                      onClick={handleResetFilters}
                      size="small"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                  
                  <Row gutter={[16, 16]}>
                    {/* Search */}
                    <Col xs={24} sm={12} md={6}>
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: theme.textColor }}>
                          Tìm kiếm
                        </Text>
                        <Input
                          placeholder="Tìm sản phẩm..."
                          prefix={<SearchOutlined />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                        />
                      </div>
                    </Col>

                    {/* Category */}
                    <Col xs={24} sm={12} md={6}>
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: theme.textColor }}>
                          Danh mục
                        </Text>
                        <Select
                          style={{ width: '100%' }}
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                        >
                          <Option value="all">Tất cả danh mục</Option>
                          {categories.map(cat => (
                            <Option key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </Col>

                    {/* Brand */}
                    <Col xs={24} sm={12} md={6}>
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: theme.textColor }}>
                          Thương hiệu
                        </Text>
                        <Select
                          mode="multiple"
                          style={{ width: '100%' }}
                          placeholder="Chọn thương hiệu"
                          value={selectedBrands}
                          onChange={setSelectedBrands}
                          maxTagCount={1}
                        >
                          {brands.map(brand => (
                            <Option key={brand.id} value={brand.id}>
                              {brand.name}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </Col>

                    {/* Sort */}
                    <Col xs={24} sm={12} md={6}>
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: theme.textColor }}>
                          Sắp xếp
                        </Text>
                        <Select
                          style={{ width: '100%' }}
                          value={sortBy}
                          onChange={setSortBy}
                        >
                          <Option value="newest">Mới nhất</Option>
                          <Option value="price-low">Giá: Thấp đến cao</Option>
                          <Option value="price-high">Giá: Cao đến thấp</Option>
                          <Option value="name">Tên A-Z</Option>
                        </Select>
                      </div>
                    </Col>

                    {/* Price Range */}
                    <Col xs={24}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <Text strong style={{ color: theme.textColor }}>Khoảng giá</Text>
                          <Text style={{ color: theme.secondaryText, fontSize: '13px' }}>
                            {priceRange[0].toLocaleString()}₫ - {priceRange[1].toLocaleString()}₫
                          </Text>
                        </div>
                        <Slider
                          range
                          min={0}
                          max={Math.max(...products.map(p => p.discount_price || p.price || 0), 10000000)}
                          step={100000}
                          value={priceRange}
                          onChange={setPriceRange}
                          marks={{
                            0: <span style={{ color: theme.textColor }}>0₫</span>,
                            [Math.max(...products.map(p => p.discount_price || p.price || 0), 10000000)]: <span style={{ color: theme.textColor }}>{`${(Math.max(...products.map(p => p.discount_price || p.price || 0), 10000000) / 1000000).toFixed(0)}M₫`}</span>
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>
          
          <Row gutter={[16, 16]} justify="start">
            {filteredAndSortedProducts.slice(0, showAll ? filteredAndSortedProducts.length : 12).map(prod => (
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
                      {prod.display_image || (prod.variants && prod.variants.length > 0 && prod.variants[0].image) ? (
                        <div style={{ 
                          height: '200px', 
                          width: '100%',
                          overflow: 'hidden'
                        }}>
                          <Image
                            alt={prod.name}
                            src={getImageUrl(prod.display_image || prod.variants[0].image)}
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
                      
                      {/* Note: Discount badge removed as price is now at variant level */}
                      
                      {/* Featured Badge - Top Right */}
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
                      className="buy-now-button"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: 600
                      }}
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
                      {prod.price_range ? (
                        <Text style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          color: '#1890ff'
                        }}>
                          {prod.price_range}
                        </Text>
                      ) : (
                        <Text style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          color: '#1890ff'
                        }}>
                          {Number(prod.price || 0).toLocaleString()}₫
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
          
          {/* Nút Xem thêm / Thu gọn */}
          {filteredAndSortedProducts.length > 12 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
             
              <Button 
                type="primary" 
                size="large"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Thu gọn' : 'Xem thêm'}
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
