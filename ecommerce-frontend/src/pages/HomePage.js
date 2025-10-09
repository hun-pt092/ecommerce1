import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { 
  Card, Row, Col, Button, Typography, Space, 
  Spin, message, Badge, Image, Tag
} from 'antd';
import { 
  EyeOutlined, ShoppingCartOutlined, StarFilled, 
  ShopOutlined, TruckOutlined, SafetyOutlined, CustomerServiceOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('products/'),
        apiClient.get('categories/').catch(() => ({ data: [] })) // Fallback if categories endpoint doesn't exist
      ]);
      
      setProducts(productsRes.data.slice(0, 8)); // Show only first 8 products
      setCategories(categoriesRes.data.slice(0, 6)); // Show only first 6 categories
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
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
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '40px'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
          🛍️ Fashion Store
        </Title>
        <Text style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)' }}>
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

      {/* Features Section */}
      <div style={{ padding: '0 20px', marginBottom: '60px' }}>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <TruckOutlined style={{ fontSize: '40px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>Giao hàng miễn phí</Title>
              <Text type="secondary">Miễn phí vận chuyển cho đơn hàng trên 500k</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <SafetyOutlined style={{ fontSize: '40px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>Thanh toán bảo mật</Title>
              <Text type="secondary">Hệ thống thanh toán an toàn và bảo mật</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <CustomerServiceOutlined style={{ fontSize: '40px', color: '#fa8c16', marginBottom: '16px' }} />
              <Title level={4}>Hỗ trợ 24/7</Title>
              <Text type="secondary">Đội ngũ hỗ trợ khách hàng tận tình</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <ShopOutlined style={{ fontSize: '40px', color: '#eb2f96', marginBottom: '16px' }} />
              <Title level={4}>Chất lượng cao</Title>
              <Text type="secondary">Sản phẩm chính hãng, chất lượng đảm bảo</Text>
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Categories Section */}
        {categories.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Title level={2}>Danh mục sản phẩm</Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Tìm kiếm theo danh mục yêu thích của bạn
              </Text>
            </div>
            <Row gutter={[16, 16]}>
              {categories.map(category => (
                <Col key={category.id} xs={12} sm={8} lg={4}>
                  <Card 
                    hoverable
                    style={{ textAlign: 'center' }}
                    bodyStyle={{ padding: '24px 16px' }}
                    onClick={() => navigate(`/products?category=${category.id}`)}
                  >
                    <div style={{ 
                      fontSize: '32px', 
                      marginBottom: '12px' 
                    }}>
                      📂
                    </div>
                    <Title level={5} style={{ margin: 0 }}>
                      {category.name}
                    </Title>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Featured Products Section */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2}>Sản phẩm nổi bật</Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Những sản phẩm được yêu thích nhất
            </Text>
          </div>
          
          <Row gutter={[20, 20]}>
            {products.map(prod => (
              <Col key={prod.id} xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable
                  cover={
                    <div style={{ position: 'relative' }}>
                      {prod.images && prod.images.length > 0 ? (
                        <div style={{ 
                          height: '240px', 
                          width: '100%',
                          overflow: 'hidden'
                        }}>
                          <Image
                            alt={prod.name}
                            src={prod.images[0].image}
                            style={{ 
                              height: '100%', 
                              width: '100%',
                              objectFit: 'cover'
                            }}
                            preview={false}
                          />
                        </div>
                      ) : (
                        <div 
                          style={{ 
                            height: '240px', 
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
                    >
                      Xem chi tiết
                    </Button>,
                    <Button 
                      type="primary" 
                      icon={<ShoppingCartOutlined />}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      Mua ngay
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {prod.name}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: '8px' }}>
                          <Space>
                            <StarFilled style={{ color: '#fadb14' }} />
                            <Text type="secondary">4.5 (24 đánh giá)</Text>
                          </Space>
                        </div>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: 'bold', 
                          color: '#f5222d',
                          marginBottom: '4px'
                        }}>
                          {Number(prod.price).toLocaleString()}₫
                        </div>
                        {prod.category && (
                          <Tag color="blue" style={{ fontSize: '10px' }}>
                            {prod.category.name}
                          </Tag>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          
          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛍️</div>
              <Title level={3} type="secondary">
                Chưa có sản phẩm nào
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Cửa hàng đang cập nhật sản phẩm mới. Vui lòng quay lại sau!
              </Text>
            </div>
          )}
          
          {products.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
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
  );
}

export default HomePage;
