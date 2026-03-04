import React, { useState } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  InputNumber, 
  Select, 
  Card,
  Typography,
  Space,
  Tag,
  message
} from 'antd';
import { 
  MessageOutlined, 
  CloseOutlined,
  UserOutlined,
  HeartOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../api/AuthAxios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ChatBot = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Results
  const [form] = Form.useForm();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hàm tính size phù hợp dựa trên chiều cao và cân nặng
  const calculateSize = (height, weight) => {
    const bmi = weight / ((height / 100) ** 2);
    
    if (height < 160) {
      if (bmi < 18.5) return 'S';
      if (bmi < 23) return 'M';
      return 'L';
    } else if (height < 170) {
      if (bmi < 18.5) return 'M';
      if (bmi < 23) return 'L';
      return 'XL';
    } else if (height < 180) {
      if (bmi < 18.5) return 'L';
      if (bmi < 23) return 'XL';
      return 'XXL';
    } else {
      if (bmi < 18.5) return 'XL';
      if (bmi < 23) return 'XXL';
      return 'XXXL';
    }
  };

  // Hàm gợi ý style dựa trên preferences
  const getStyleAdvice = (bodyType, style) => {
    const advice = {
      slim: {
        casual: 'Áo thun form fitted, quần jean skinny sẽ tôn dáng người gầy của bạn.',
        formal: 'Suit form ôm vừa phải, sơ mi trắng classic sẽ giúp bạn trông chuyên nghiệp.',
        sporty: 'Áo hoodie oversized, quần jogger sẽ tạo phong cách năng động.'
      },
      average: {
        casual: 'Áo thun basic, quần jean straight fit là lựa chọn hoàn hảo.',
        formal: 'Suit regular fit, áo sơ mi oxford sẽ phù hợp với vóc dáng cân đối.',
        sporty: 'Áo khoác thể thao, quần short năng động tạo vẻ khỏe khoắn.'
      },
      athletic: {
        casual: 'Áo polo, quần chinos sẽ tôn lên vóc dáng khỏe khoắn.',
        formal: 'Suit modern fit, sơ mi stretch thoải mái cho người có cơ bắp.',
        sporty: 'Áo compression, quần training fit giúp thoải mái vận động.'
      }
    };
    
    return advice[bodyType]?.[style] || 'Hãy chọn trang phục phù hợp với phong cách cá nhân!';
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { height, weight, bodyType, style, category } = values;
      
      // Tính size phù hợp
      const suggestedSize = calculateSize(height, weight);
      
      // Lấy lời khuyên style
      const styleAdvice = getStyleAdvice(bodyType, style);
      
      // Gọi API lấy sản phẩm theo category
      const response = await authAxios.get('products/', {
        params: {
          category: category,
          page_size: 6
        }
      });
      
      const products = response.data.results || [];
      
      // Filter sản phẩm có size phù hợp
      const suitableProducts = products.filter(product => {
        return product.variants?.some(variant => 
          variant.skus?.some(sku => sku.size === suggestedSize && sku.stock_quantity > 0)
        );
      });
      
      setRecommendations({
        size: suggestedSize,
        advice: styleAdvice,
        products: suitableProducts.length > 0 ? suitableProducts : products,
        hasExactSize: suitableProducts.length > 0
      });
      
      setStep(2);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      message.error('Không thể tải gợi ý sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    form.resetFields();
    setRecommendations([]);
  };

  const handleProductClick = (productId) => {
    setVisible(false);
    navigate(`/products/${productId}`);
    setTimeout(() => {
      handleReset();
    }, 300);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined style={{ fontSize: '24px' }} />}
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      />

      {/* Chat Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageOutlined style={{ fontSize: '20px', color: '#667eea' }} />
            <span>Tư Vấn Size & Phong Cách</span>
          </div>
        }
        open={visible}
        onCancel={() => {
          setVisible(false);
          setTimeout(() => handleReset(), 300);
        }}
        footer={null}
        width={600}
        closeIcon={<CloseOutlined />}
      >
        {step === 1 ? (
          <div style={{ padding: '20px 0' }}>
            <Paragraph style={{ fontSize: '15px', color: '#666', marginBottom: '24px' }}>
              <UserOutlined /> Hãy cho mình biết một chút về bạn để tư vấn size và phong cách phù hợp nhất!
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                height: 170,
                weight: 65,
                bodyType: 'average',
                style: 'casual'
              }}
            >
              <Form.Item
                label={<Text strong>Chiều cao (cm)</Text>}
                name="height"
                rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
              >
                <InputNumber
                  min={140}
                  max={220}
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 170"
                />
              </Form.Item>

              <Form.Item
                label={<Text strong>Cân nặng (kg)</Text>}
                name="weight"
                rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
              >
                <InputNumber
                  min={40}
                  max={150}
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 65"
                />
              </Form.Item>

              <Form.Item
                label={<Text strong>Vóc dáng</Text>}
                name="bodyType"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn vóc dáng">
                  <Option value="slim">Gầy / Mảnh khảnh</Option>
                  <Option value="average">Trung bình / Cân đối</Option>
                  <Option value="athletic">Khỏe / Vạm vỡ</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<Text strong>Phong cách yêu thích</Text>}
                name="style"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn phong cách">
                  <Option value="casual">Casual - Thoải mái hàng ngày</Option>
                  <Option value="formal">Formal - Lịch sự công sở</Option>
                  <Option value="sporty">Sporty - Năng động thể thao</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<Text strong>Loại sản phẩm quan tâm</Text>}
                name="category"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="">Tất cả</Option>
                  <Option value="1">Áo thun</Option>
                  <Option value="2">Áo sơ mi</Option>
                  <Option value="3">Quần jean</Option>
                  <Option value="4">Áo khoác</Option>
                </Select>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: '30px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    height: '45px',
                    fontSize: '16px'
                  }}
                >
                  <ShoppingOutlined /> Tìm sản phẩm phù hợp
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <div style={{ padding: '20px 0' }}>
            {/* Size Recommendation */}
            <Card 
              size="small" 
              style={{ 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                border: '1px solid #667eea30'
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ fontSize: '15px' }}>
                    📏 Size phù hợp với bạn: 
                  </Text>
                  <Tag color="purple" style={{ fontSize: '16px', padding: '4px 12px', marginLeft: '8px' }}>
                    {recommendations.size}
                  </Tag>
                </div>
                <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  <HeartOutlined /> {recommendations.advice}
                </Paragraph>
                {!recommendations.hasExactSize && (
                  <Text type="warning" style={{ fontSize: '13px' }}>
                    ⚠️ Một số sản phẩm có thể chưa có size {recommendations.size}, bạn có thể xem các size tương tự.
                  </Text>
                )}
              </Space>
            </Card>

            {/* Product Recommendations */}
            <Title level={5} style={{ marginBottom: '16px' }}>
              🎁 Gợi ý sản phẩm cho bạn
            </Title>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {recommendations.products?.map(product => {
                  const variant = product.variants?.[0];
                  const primaryImage = variant?.images?.find(img => img.is_primary)?.image || 
                                      variant?.images?.[0]?.image;
                  const imageUrl = primaryImage ? 
                    (primaryImage.startsWith('http') ? primaryImage : `http://localhost:8000${primaryImage}`) 
                    : null;
                  
                  const hasSize = product.variants?.some(v => 
                    v.skus?.some(sku => sku.size === recommendations.size && sku.stock_quantity > 0)
                  );

                  return (
                    <Card
                      key={product.id}
                      hoverable
                      onClick={() => handleProductClick(product.id)}
                      style={{ cursor: 'pointer' }}
                      bodyStyle={{ padding: '12px' }}
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#f5f5f5'
                        }}>
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={product.name}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '30px'
                            }}>
                              👕
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                            {product.name}
                          </Text>
                          <div style={{ marginBottom: '6px' }}>
                            {hasSize && (
                              <Tag color="success" style={{ fontSize: '11px' }}>
                                Có size {recommendations.size}
                              </Tag>
                            )}
                            {product.category?.name && (
                              <Tag color="blue" style={{ fontSize: '11px' }}>
                                {product.category.name}
                              </Tag>
                            )}
                          </div>
                          <Text strong style={{ color: '#f5222d', fontSize: '15px' }}>
                            {variant?.discount_price ? 
                              Number(variant.discount_price).toLocaleString() : 
                              Number(variant?.price || 0).toLocaleString()
                            }₫
                          </Text>
                          {variant?.discount_price && (
                            <Text delete type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                              {Number(variant.price).toLocaleString()}₫
                            </Text>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </Space>
            </div>

            <Button
              onClick={handleReset}
              block
              style={{ marginTop: '20px' }}
            >
              Tư vấn lại
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ChatBot;
