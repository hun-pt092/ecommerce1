import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Card, Row, Col, Button, Typography } from 'antd';
import { EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function HomePage() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={1}>Chào mừng đến Fashion Store</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Khám phá bộ sưu tập thời trang mới nhất
        </Text>
      </div>
      
      <Title level={2} style={{ marginBottom: '20px' }}>Sản phẩm nổi bật</Title>
      <Row gutter={[16, 16]}>
        {products.map(prod => (
          <Col key={prod.id} xs={24} sm={12} md={8} lg={6}>
            <Card 
              cover={
                <div 
                  style={{ 
                    height: '200px', 
                    background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#999'
                  }}
                >
                  👕
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
                title={prod.name}
                description={
                  <div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: '#1890ff',
                      marginBottom: '8px'
                    }}>
                      {Number(prod.price).toLocaleString()}₫
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {prod.description || 'Sản phẩm thời trang chất lượng cao'}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          <Title level={4} type="secondary">
            Chưa có sản phẩm nào
          </Title>
          <Text type="secondary">
            Hãy thêm sản phẩm từ admin panel để hiển thị ở đây
          </Text>
        </div>
      )}
    </div>
  );
}

export default HomePage;
