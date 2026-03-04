import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Radio, 
  Button, 
  Row, 
  Col, 
  Typography,
  Space,
  Divider,
  Input,
  Alert,
  Tag,
  Modal,
  List,
  message as antdMessage,
  Progress
} from 'antd';
import { 
  CreditCardOutlined, 
  ArrowLeftOutlined, 
  CheckCircleOutlined,
  BankOutlined,
  MobileOutlined,
  DollarOutlined,
  GiftOutlined,
  CloseCircleOutlined,
  ScanOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import momoImage from '../../momo.jpg';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PaymentForm = ({ cartData, shippingAddress, onSubmit, onPrevious, loading }) => {
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  // MoMo payment states
  const [showMoMoModal, setShowMoMoModal] = useState(false);
  const [momoPaymentStatus, setMomoPaymentStatus] = useState('waiting'); // waiting, confirming, success, failed
  const [momoCountdown, setMomoCountdown] = useState(120); // 120 seconds countdown

  // Fetch available coupons on mount
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        const response = await apiClient.get('coupons/?status=available');
        const coupons = response.data.results || response.data || [];
        console.log('Fetched coupons:', coupons);
        setAvailableCoupons(coupons);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };
    fetchAvailableCoupons();
  }, []);

  // Apply coupon
  const applyCoupon = async (coupon) => {
    console.log('applyCoupon called with coupon object:', coupon);
    // Extract the actual code from coupon object
    const code = coupon.coupon_code || coupon.code;
    console.log('Using code:', code);
    setCouponLoading(true);
    try {
      const subTotal = calculateSubTotal();
      const shippingFee = subTotal >= 500000 ? 0 : 30000;
      const totalAmount = subTotal + shippingFee;

      console.log('Sending request:', { coupon_code: code, order_amount: totalAmount });

      const response = await apiClient.post('coupons/apply/', {
        coupon_code: code,
        order_amount: totalAmount
      });

      setAppliedCoupon({
        code: code,
        discount: response.data.discount_amount,
        name: response.data.coupon_name
      });
      antdMessage.success(`Áp dụng mã giảm giá thành công! Giảm ${response.data.discount_amount.toLocaleString()}₫`);
      setShowCouponModal(false);
    } catch (error) {
      console.error('Error applying coupon:', error);
      
      // Extract detailed error messages from backend
      let errorMsg = 'Không thể áp dụng mã giảm giá';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for specific field errors
        if (errorData.coupon_code) {
          errorMsg = Array.isArray(errorData.coupon_code) 
            ? errorData.coupon_code[0] 
            : errorData.coupon_code;
        } else if (errorData.order_amount) {
          errorMsg = Array.isArray(errorData.order_amount) 
            ? errorData.order_amount[0] 
            : errorData.order_amount;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      }
      
      antdMessage.error(errorMsg);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    antdMessage.info('Đã bỏ áp dụng mã giảm giá');
  };

  // Calculate totals
  const calculateSubTotal = () => {
    if (!cartData?.items) {
      console.log('No cart data or items');
      return 0;
    }
    
    console.log('=== PaymentForm calculateSubTotal Debug ===');
    console.log('cartData:', cartData);
    console.log('cartData.items:', cartData.items);
    
    return cartData.items.reduce((sum, item) => {
      console.log('Processing item:', item);
      
      // Try multiple paths to get price with better fallback logic
      let price = 0;
      
      // Priority 1: final_price from product_sku (calculated by backend)
      if (item.product_sku?.final_price) {
        price = parseFloat(item.product_sku.final_price);
        console.log('✓ Using product_sku.final_price:', price);
      }
      // Priority 2: Discount price from variant product
      else if (item.product_sku?.variant?.product?.discount_price) {
        price = parseFloat(item.product_sku.variant.product.discount_price);
        console.log('✓ Using product_sku.variant.product.discount_price:', price);
      }
      // Priority 3: Regular price from variant product
      else if (item.product_sku?.variant?.product?.price) {
        price = parseFloat(item.product_sku.variant.product.price);
        console.log('✓ Using product_sku.variant.product.price:', price);
      }
      // Priority 4: Fallback to product direct (old structure)
      else if (item.product?.discount_price) {
        price = parseFloat(item.product.discount_price);
        console.log('✓ Using product.discount_price:', price);
      } else if (item.product?.price) {
        price = parseFloat(item.product.price);
        console.log('✓ Using product.price:', price);
      }
      // Priority 5: Direct item price properties
      else if (item.discount_price) {
        price = parseFloat(item.discount_price);
        console.log('✓ Using item.discount_price:', price);
      } else if (item.price) {
        price = parseFloat(item.price);
        console.log('✓ Using item.price:', price);
      } else if (item.product_variant?.price) {
        price = parseFloat(item.product_variant.price);
        console.log('✓ Using product_variant.price:', price);
      }
      // Fallback: Deep search for any price
      else {
        console.log('❌ No standard price found, trying fallback...');
        console.log('Item keys:', Object.keys(item));
        console.log('Item product:', item.product);
        console.log('Item product_variant:', item.product_variant);
        
        // Try to extract price from any nested structure
        const productData = item.product_variant?.product || item.product;
        if (productData) {
          const foundPrice = productData.discount_price || productData.price;
          if (foundPrice !== undefined && foundPrice !== null) {
            price = parseFloat(foundPrice);
            console.log('✓ Fallback price found:', price);
          } else {
            console.error('❌ No price found in productData:', productData);
          }
        } else {
          console.error('❌ No product data found for item:', item);
        }
      }
      
      // Ensure price is a valid number
      if (isNaN(price) || price < 0) {
        console.error('❌ Invalid price detected:', price, 'for item:', item);
        price = 0;
      }
      
      const itemName = item.product?.name || item.product_variant?.product?.name || 'Unknown Product';
      const itemTotal = price * (item.quantity || 1);
      console.log(`📊 Item: ${itemName}, Price: ${price}₫, Quantity: ${item.quantity}, Total: ${itemTotal}₫`);
      
      return sum + itemTotal;
    }, 0);
  };

  const subTotal = calculateSubTotal();
  const shippingFee = subTotal >= 500000 ? 0 : 30000;
  const discount = appliedCoupon?.discount || 0;
  const totalAmount = subTotal + shippingFee - discount;

  // Debug final calculations
  console.log('=== PaymentForm Final Calculations ===');
  console.log('SubTotal:', subTotal);
  console.log('ShippingFee:', shippingFee);
  console.log('Discount:', discount);
  console.log('TotalAmount:', totalAmount);
  console.log('CartData:', cartData);

  const handleSubmit = (values) => {
    console.log('PaymentForm handleSubmit called with:', values);
    console.log('Current paymentMethod:', paymentMethod);
    
    // If MoMo payment, show QR modal first
    if (paymentMethod === 'momo') {
      setShowMoMoModal(true);
      setMomoPaymentStatus('waiting');
      setMomoCountdown(120);
      return;
    }
    
    const paymentData = {
      method: paymentMethod,
      details: values,
      notes: values.notes || '',
      coupon: appliedCoupon ? appliedCoupon.code : null
    };
    
    console.log('Calling onSubmit with:', paymentData);
    onSubmit(paymentData);
  };

  // Handle MoMo payment confirmation
  const handleMoMoConfirm = () => {
    // Prevent double invocation if already confirming/success
    if (momoPaymentStatus !== 'waiting') return;

    setMomoPaymentStatus('confirming');

    // Simulate payment verification (in production, this would call MoMo API)
    setTimeout(() => {
      setMomoPaymentStatus('success');
      antdMessage.success('Thanh toán MoMo thành công!');

      // Wait a bit then close modal and submit order
      setTimeout(() => {
        const values = form.getFieldsValue();
        const paymentData = {
          method: 'momo',
          details: values,
          notes: values.notes || '',
          coupon: appliedCoupon ? appliedCoupon.code : null,
          momo_transaction_id: `MOMO${Date.now()}` // Mock transaction ID
        };

        // Close modal first
        setShowMoMoModal(false);
        // reset state for next time
        setMomoPaymentStatus('waiting');
        setMomoCountdown(120);

        // Then submit order
        onSubmit(paymentData);
      }, 1000);
    }, 2000);
  };

  // Countdown timer for MoMo payment
  useEffect(() => {
    let timer;
    if (showMoMoModal && momoPaymentStatus === 'waiting' && momoCountdown > 0) {
      timer = setInterval(() => {
        setMomoCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showMoMoModal, momoPaymentStatus, momoCountdown]);

  const paymentMethods = [
    {
      key: 'cod',
      title: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận được sản phẩm',
      icon: <DollarOutlined style={{ color: '#52c41a' }} />,
      available: true
    },
    {
      key: 'bank_transfer',
      title: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản trực tiếp qua số tài khoản ngân hàng',
      icon: <BankOutlined style={{ color: '#1890ff' }} />,
      available: true
    },
    {
      key: 'momo',
      title: 'Ví điện tử MoMo',
      description: 'Thanh toán qua ứng dụng MoMo',
      icon: <MobileOutlined style={{ color: '#d63384' }} />,
      available: true
    },
    {
      key: 'credit_card',
      title: 'Thẻ tín dụng/Ghi nợ',
      description: 'Thanh toán qua thẻ Visa, Mastercard, JCB',
      icon: <CreditCardOutlined style={{ color: '#fa8c16' }} />,
      available: false
    }
  ];

  const renderPaymentDetails = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return (
          <Card size="small" style={{ marginTop: '16px', background: '#f6ffed' }}>
            <Title level={5} style={{ marginBottom: '12px' }}>
              Thông tin chuyển khoản:
            </Title>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Ngân hàng: </Text>
              <Text>MBbank</Text>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Số tài khoản: </Text>
              <Text copyable>0342176457</Text>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Chủ tài khoản: </Text>
              <Text>PKA Shop COMPANY</Text>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Nội dung chuyển khoản: </Text>
              <Text copyable>FASHIONSTORE {Date.now()}</Text>
            </div>
            <Alert
              message="Lưu ý quan trọng"
              description="Vui lòng chuyển khoản đúng nội dung và liên hệ hotline 1900-xxxx sau khi chuyển khoản để xác nhận đơn hàng."
              type="warning"
              showIcon
              size="small"
            />
          </Card>
        );
      
      case 'cod':
        return (
          <Card size="small" style={{ marginTop: '16px', background: '#f6ffed' }}>
            <Alert
              message="Thanh toán khi nhận hàng"
              description="Bạn sẽ thanh toán bằng tiền mặt cho shipper khi nhận được sản phẩm. Vui lòng chuẩn bị đủ tiền lẻ."
              type="success"
              showIcon
              size="small"
            />
          </Card>
        );
      
      case 'momo':
        return (
          <Card size="small" style={{ marginTop: '16px', background: '#fff0f6', borderColor: '#d63384' }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <MobileOutlined style={{ fontSize: '32px', color: '#d63384', marginBottom: '8px' }} />
                <Title level={5} style={{ margin: 0, color: '#d63384' }}>
                  Thanh toán qua MoMo
                </Title>
              </div>
              <Alert
                message="Hướng dẫn thanh toán"
                description={
                  <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Nhấn nút "Đặt hàng ngay" bên dưới</li>
                    <li>Mở ứng dụng MoMo trên điện thoại</li>
                    <li>Quét mã QR hiển thị trên màn hình</li>
                    <li>Xác nhận thanh toán trong ứng dụng MoMo</li>
                    <li>Chờ hệ thống xác nhận</li>
                  </ol>
                }
                type="info"
                showIcon
                size="small"
              />
              <div style={{ 
                padding: '12px', 
                background: 'linear-gradient(135deg, #d63384 0%, #ff6b9d 100%)',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'white'
              }}>
                <Text strong style={{ color: 'white', fontSize: '16px' }}>
                  💳 Số tiền thanh toán: {totalAmount.toLocaleString()}₫
                </Text>
              </div>
            </Space>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Card 
          title={
            <Space>
              <CreditCardOutlined />
              <span>Phương thức thanh toán</span>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="payment_method"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
            >
              <Radio.Group 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <div style={{ display: 'grid', gap: '12px' }}>
                  {paymentMethods.map(method => (
                    <Card 
                      key={method.key}
                      size="small"
                      style={{
                        border: paymentMethod === method.key ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        opacity: method.available ? 1 : 0.5,
                        cursor: method.available ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => method.available && setPaymentMethod(method.key)}
                    >
                      <Radio 
                        value={method.key} 
                        disabled={!method.available}
                        style={{ width: '100%' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                          <div style={{ marginRight: '12px', fontSize: '20px' }}>
                            {method.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                              {method.title}
                              {!method.available && (
                                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                                  (Sắp ra mắt)
                                </Text>
                              )}
                            </div>
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {method.description}
                            </Text>
                          </div>
                        </div>
                      </Radio>
                    </Card>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>

            {renderPaymentDetails()}

            <Divider />

            <Form.Item
              name="notes"
              label="Ghi chú đơn hàng (không bắt buộc)"
            >
              <TextArea 
                rows={3}
                placeholder="Ghi chú thêm về đơn hàng..."
                maxLength={200}
                showCount
              />
            </Form.Item>

            {/* Form Actions */}
            <div style={{ marginTop: '24px' }}>
              <Space>
                <Button 
                  icon={<ArrowLeftOutlined />}
                  onClick={onPrevious}
                >
                  Quay lại
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<CheckCircleOutlined />}
                  loading={loading}
                  size="large"
                >
                  Đặt hàng ngay
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Col>

      {/* Order Summary */}
      <Col xs={24} lg={8}>
        <Card title="Tóm tắt thanh toán">
          {/* Shipping Address */}
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ marginBottom: '8px' }}>
              📍 Địa chỉ giao hàng:
            </Title>
            <Text strong style={{ display: 'block', marginBottom: '4px' }}>
              {shippingAddress?.full_name}
            </Text>
            <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
              {shippingAddress?.phone_number}<br/>
              {shippingAddress?.full_address}
            </Text>
          </div>

          <Divider />

          {/* Price Breakdown */}
          <div style={{ marginBottom: '16px' }}>
            <Row justify="space-between" style={{ marginBottom: '8px' }}>
              <Text>Tạm tính ({cartData?.items?.length || 0} sản phẩm):</Text>
              <Text strong>{subTotal.toLocaleString()}₫</Text>
            </Row>
            
            <Row justify="space-between" style={{ marginBottom: '8px' }}>
              <Text>Phí vận chuyển:</Text>
              <Text strong style={{ color: shippingFee === 0 ? '#52c41a' : undefined }}>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}₫`}
              </Text>
            </Row>
            
            {discount > 0 && (
              <Row justify="space-between" style={{ marginBottom: '8px' }}>
                <Text>Giảm giá:</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  -{discount.toLocaleString()}₫
                </Text>
              </Row>
            )}
            
            {shippingFee === 0 && (
              <Text type="success" style={{ fontSize: '12px', textAlign: 'right', display: 'block', marginBottom: '8px' }}>
                🎉 Miễn phí vận chuyển cho đơn ≥ 500k
              </Text>
            )}

            {/* Coupon Section */}
            {appliedCoupon ? (
              <Row justify="space-between" align="middle" style={{ 
                marginTop: '12px', 
                padding: '8px', 
                background: '#f6ffed',
                borderRadius: '4px',
                border: '1px solid #b7eb8f'
              }}>
                <Space>
                  <GiftOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ color: '#52c41a', fontSize: '13px' }}>{appliedCoupon.name}</Text>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>{appliedCoupon.code}</Text></div>
                  </div>
                </Space>
                <Space>
                  <Text strong style={{ color: '#52c41a' }}>-{appliedCoupon.discount.toLocaleString()}₫</Text>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CloseCircleOutlined />}
                    onClick={removeCoupon}
                    style={{ color: '#ff4d4f' }}
                  />
                </Space>
              </Row>
            ) : (
              <Button 
                icon={<GiftOutlined />}
                onClick={() => setShowCouponModal(true)}
                style={{ marginTop: '12px', width: '100%' }}
                disabled={availableCoupons.length === 0}
              >
                {availableCoupons.length > 0 
                  ? `Áp dụng mã giảm giá (${availableCoupons.length})`
                  : 'Không có mã giảm giá'
                }
              </Button>
            )}
          </div>
          
          <Divider />
          
          <Row justify="space-between" style={{ marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>Tổng thanh toán:</Title>
            <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
              {totalAmount.toLocaleString()}₫
            </Title>
          </Row>

          <Alert
            message="Cam kết của chúng tôi"
            description="✓ Giao hàng trong 1-3 ngày làm việc ✓ Hỗ trợ đổi trả trong 7 ngày ✓ Bảo hành chính hãng"
            type="info"
            showIcon
            size="small"
          />
        </Card>
      </Col>

      {/* Coupon Selection Modal */}
      <Modal
        title={
          <Space>
            <GiftOutlined style={{ color: '#1890ff' }} />
            <span>Chọn mã giảm giá</span>
          </Space>
        }
        open={showCouponModal}
        onCancel={() => setShowCouponModal(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={availableCoupons}
          locale={{ emptyText: 'Không có mã giảm giá khả dụng' }}
          renderItem={coupon => {
            console.log('Rendering coupon:', coupon);
            return (
            <List.Item
              style={{
                padding: '16px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: '#fff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => applyCoupon(coupon)}
            >
              <div style={{ width: '100%' }}>
                <Row justify="space-between" align="middle">
                  <Col span={16}>
                    <Space direction="vertical" size={4}>
                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                        {coupon.coupon_name || coupon.name}
                      </Text>
                      <Tag color="blue">{coupon.coupon_code || coupon.code}</Tag>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {(coupon.coupon_type || coupon.type) === 'percentage' 
                          ? `Giảm ${coupon.discount_value || coupon.coupon_discount_value}%`
                          : `Giảm ${Number(coupon.discount_value || coupon.coupon_discount_value || 0).toLocaleString()}₫`
                        }
                        {(coupon.max_discount_amount || coupon.coupon_max_discount_amount) && 
                          ` (tối đa ${Number(coupon.max_discount_amount || coupon.coupon_max_discount_amount).toLocaleString()}₫)`
                        }
                      </Text>
                      {(coupon.min_purchase_amount || coupon.coupon_min_purchase_amount || 0) > 0 && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Đơn tối thiểu: {Number(coupon.min_purchase_amount || coupon.coupon_min_purchase_amount).toLocaleString()}₫
                        </Text>
                      )}
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        HSD: {new Date(coupon.valid_to).toLocaleDateString('vi-VN')}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <Button 
                      type="primary"
                      loading={couponLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        applyCoupon(coupon);
                      }}
                    >
                      Áp dụng
                    </Button>
                  </Col>
                </Row>
              </div>
            </List.Item>
            );
          }}
        />
      </Modal>

      {/* MoMo QR Payment Modal */}
      <Modal
        title={
          <Space>
            <MobileOutlined style={{ color: '#d63384', fontSize: '20px' }} />
            <span style={{ color: '#d63384', fontWeight: 'bold' }}>Thanh toán MoMo</span>
          </Space>
        }
        open={showMoMoModal}
        onCancel={() => {
          if (momoPaymentStatus !== 'confirming') {
            setShowMoMoModal(false);
            setMomoPaymentStatus('waiting');
            setMomoCountdown(120);
          }
        }}
        footer={null}
        width={500}
        centered
        maskClosable={momoPaymentStatus !== 'confirming'}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {/* Waiting State - Show QR Code */}
          {momoPaymentStatus === 'waiting' && (
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {/* MoMo QR Image */}
              <div style={{
                padding: '24px',
                background: 'white',
                borderRadius: '12px',
                border: '2px solid #d63384',
                display: 'inline-block'
              }}>
                <img 
                  src={momoImage} 
                  alt="MoMo QR Code"
                  style={{ 
                    width: '220px',
                    height: '220px',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Instructions */}
              <div style={{
                background: 'linear-gradient(135deg, #fff0f6 0%, #ffe6f0 100%)',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <ScanOutlined style={{ fontSize: '36px', color: '#d63384' }} />
                  <Title level={4} style={{ margin: 0, color: '#d63384' }}>
                    Vui lòng quét mã QR
                  </Title>
                  <Text style={{ fontSize: '15px', color: '#595959' }}>
                    Mở ứng dụng MoMo và quét mã QR phía trên để thanh toán
                  </Text>
                  
                  {/* Amount Display */}
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '2px dashed #d63384'
                  }}>
                    <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                      Số tiền thanh toán
                    </Text>
                    <Text strong style={{ fontSize: '24px', color: '#d63384' }}>
                      {totalAmount.toLocaleString()}₫
                    </Text>
                  </div>

                  {/* Countdown Timer */}
                  <div style={{ marginTop: '16px' }}>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#d63384' }} />
                      <Text style={{ color: '#595959' }}>
                        Vui lòng hoàn tất trong <Text strong style={{ color: '#d63384' }}>{momoCountdown}s</Text>
                      </Text>
                    </Space>
                    <Progress
                      percent={(momoCountdown / 120) * 100}
                      strokeColor={{
                        '0%': '#d63384',
                        '100%': '#ff6b9d',
                      }}
                      showInfo={false}
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                </Space>
              </div>

              {/* Confirm Button */}
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={handleMoMoConfirm}
                disabled={momoCountdown === 0 || momoPaymentStatus !== 'waiting'}
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: momoCountdown === 0 || momoPaymentStatus !== 'waiting' ? '#d9d9d9' : 'linear-gradient(135deg, #d63384 0%, #ff6b9d 100%)',
                  border: 'none'
                }}
              >
                {momoPaymentStatus === 'confirming' ? 'Đang xác nhận...' : (momoCountdown === 0 ? 'Hết thời gian' : 'Tôi đã thanh toán')}
              </Button>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                💡 Sau khi quét mã và thanh toán trong app MoMo, hãy nhấn nút "Tôi đã thanh toán"
              </Text>
            </Space>
          )}

          {/* Confirming State */}
          {momoPaymentStatus === 'confirming' && (
            <Space direction="vertical" size={24} style={{ width: '100%', padding: '40px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d63384 0%, #ff6b9d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                <MobileOutlined style={{ fontSize: '40px', color: 'white' }} />
              </div>
              <Title level={4} style={{ color: '#d63384' }}>
                Đang xác nhận thanh toán...
              </Title>
              <Text type="secondary">
                Vui lòng đợi trong giây lát
              </Text>
              <Progress percent={100} status="active" strokeColor="#d63384" showInfo={false} />
            </Space>
          )}

          {/* Success State */}
          {momoPaymentStatus === 'success' && (
            <Space direction="vertical" size={24} style={{ width: '100%', padding: '40px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                borderRadius: '50%',
                background: '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleOutlined style={{ fontSize: '40px', color: 'white' }} />
              </div>
              <Title level={4} style={{ color: '#52c41a' }}>
                Thanh toán thành công!
              </Title>
              <Text type="secondary">
                Đơn hàng của bạn đang được xử lý
              </Text>
            </Space>
          )}
        </div>

        {/* Animation Styles */}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
      </Modal>
    </Row>
  );
};

export default PaymentForm;