import React, { useMemo, useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Image, 
  Divider,
  Space,
  Tag
} from 'antd';
import { 
  EditOutlined, 
  ArrowRightOutlined,
  ShoppingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const CartSummary = ({ cartData, onNext, onEdit, isBuyNow }) => {
  // Debug cart data
  console.log('=== CartSummary RENDER START ===');
  console.log('CartSummary cartData:', cartData);
  console.log('CartSummary isBuyNow:', isBuyNow);
  console.log('CartSummary timestamp:', new Date().toISOString());
  
  // Helper function to format price
  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toLocaleString('vi-VN') + '₫';
  };
  
  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  const calculateItemTotal = (item) => {
    // Debug item structure
    console.log('calculateItemTotal - full item:', JSON.stringify(item, null, 2));
    
    // Try multiple paths to get price (API cart vs temp cart)
    let price = 0;
    
    if (item.product_variant?.product?.discount_price) {
      price = item.product_variant.product.discount_price;
    } else if (item.product_variant?.product?.price) {
      price = item.product_variant.product.price;
    } else if (item.product?.discount_price) {
      // Alternative path for temp cart
      price = item.product.discount_price;
    } else if (item.product?.price) {
      // Alternative path for temp cart
      price = item.product.price;
    }
    
    console.log('calculateItemTotal - extracted price:', price, 'quantity:', item.quantity, 'total:', price * item.quantity);
    return price * item.quantity;
  };

  const calculateSubTotal = () => {
    if (!cartData?.items) return 0;
    const subTotal = cartData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    console.log('calculateSubTotal result:', subTotal);
    return subTotal;
  };

  // Force re-render state
  const [renderKey, setRenderKey] = useState(0);
  
  const subTotal = useMemo(() => {
    const result = calculateSubTotal();
    console.log('useMemo - subTotal calculated:', result);
    return result;
  }, [cartData, renderKey]);
  
  const shippingFee = subTotal >= 500000 ? 0 : 30000; // Miễn phí ship cho đơn >= 500k
  const totalAmount = subTotal + shippingFee;
  
  // Force re-render when cartData changes
  useEffect(() => {
    if (cartData && cartData.items && cartData.items.length > 0) {
      console.log('🔄 Force re-render triggered by cartData change');
      setRenderKey(prev => prev + 1);
    }
  }, [cartData]);

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ShoppingOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
          <Title level={4} type="secondary">Giỏ hàng trống</Title>
          <Text type="secondary">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</Text>
        </div>
      </Card>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {/* Cart Items */}
      <Col xs={24} lg={16}>
        <Card 
          title={
            <Space>
              <ShoppingOutlined />
              <span>{isBuyNow ? 'Sản phẩm mua ngay' : `Sản phẩm trong giỏ hàng (${cartData.items.length})`}</span>
            </Space>
          }
          extra={
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={onEdit}
            >
              {isBuyNow ? 'Quay lại' : 'Chỉnh sửa'}
            </Button>
          }
        >
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {cartData.items.map((item, index) => (
              <div key={item.id}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={6} sm={4}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0'
                    }}>
                      {item.product_variant?.product?.images?.[0] ? (
                        <Image
                          src={getImageUrl(item.product_variant.product.images[0].image)}
                          alt={item.product_variant.product.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                          preview={false}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          👕
                        </div>
                      )}
                    </div>
                  </Col>
                  
                  <Col xs={18} sm={12}>
                    <div>
                      <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                        {item.product_variant?.product?.name || 'Sản phẩm không xác định'}
                      </Title>
                      {item.product_variant && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Phân loại: {item.product_variant.size} - {item.product_variant.color}
                        </Text>
                      )}
                      {item.product_variant?.product?.category && (
                        <div style={{ marginTop: '4px' }}>
                          <Tag size="small" color="blue">
                            {item.product_variant.product.category.name}
                          </Tag>
                        </div>
                      )}
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                    <div>
                      <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                        {calculateItemTotal(item).toLocaleString()}₫
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {(item.product_variant?.product?.discount_price || 
                          item.product_variant?.product?.price || 0).toLocaleString()}₫ x {item.quantity}
                      </Text>
                    </div>
                  </Col>
                </Row>
                
                {index < cartData.items.length - 1 && (
                  <Divider style={{ margin: '16px 0' }} />
                )}
              </div>
            ))}
          </div>
        </Card>
      </Col>

      {/* Order Summary */}
      <Col xs={24} lg={8}>
        <Card title="Tóm tắt đơn hàng">
          <div style={{ marginBottom: '16px' }}>
            <Row justify="space-between">
              <Text>Tạm tính ({cartData.items.length} sản phẩm):</Text>
              <Text 
                strong 
                id="cart-subtotal-display"
                style={{ 
                  color: '#000', 
                  fontSize: '16px',
                  backgroundColor: 'yellow',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}
              >
                {(() => {
                  const finalPrice = formatPrice(subTotal);
                  console.log('🔥 FINAL RENDER:', {
                    subTotal,
                    finalPrice,
                    timestamp: new Date().toISOString(),
                    cartDataExists: !!cartData,
                    cartItemsLength: cartData?.items?.length || 0,
                    renderKey
                  });
                  // Add DOM manipulation debug
                  setTimeout(() => {
                    const element = document.getElementById('cart-subtotal-display');
                    console.log('💡 DOM Element content:', element?.textContent);
                    console.log('💡 DOM Element HTML:', element?.innerHTML);
                  }, 100);
                  return finalPrice;
                })()}
              </Text>
            </Row>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <Row justify="space-between">
              <Text>Phí vận chuyển:</Text>
              <Text strong style={{ color: shippingFee === 0 ? '#52c41a' : undefined }}>
                {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
              </Text>
            </Row>
            {shippingFee === 0 && (
              <Text type="success" style={{ fontSize: '12px', textAlign: 'right', display: 'block' }}>
                🎉 Bạn được miễn phí vận chuyển!
              </Text>
            )}
          </div>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <div style={{ marginBottom: '24px' }}>
            <Row justify="space-between">
              <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
              <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
                {formatPrice(totalAmount)}
              </Title>
            </Row>
          </div>
          
          <Button 
            type="primary" 
            size="large" 
            block
            icon={<ArrowRightOutlined />}
            onClick={onNext}
          >
            Tiếp tục thanh toán
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Bằng cách tiếp tục, bạn đồng ý với điều khoản sử dụng
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

// Add component display name for debugging
CartSummary.displayName = 'CartSummary';
console.log('=== CartSummary COMPONENT DEFINED ===');

export default CartSummary;