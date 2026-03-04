import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  InputNumber, 
  message, 
  Spin, 
  Row, 
  Col, 
  Typography,
  Divider,
  Empty,
  Space,
  Popconfirm,
  Image,
  Modal,
  Form,
  Input
} from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ShoppingCartOutlined, 
  DeleteOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
  MinusOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../api/AuthAxios';

const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [form] = Form.useForm();
  const { theme } = useTheme();

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    fetchCart();
  }, []);



  const fetchCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      message.warning('Vui lòng đăng nhập để xem giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      const response = await authAxios.get('cart/');
      setCart(response.data);
    } catch (error) {
      message.error('Không thể tải giỏ hàng');
      console.error('Cart fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemIndex, newQuantity) => {
    if (newQuantity <= 0) {
      removeCartItem(itemIndex);
      return;
    }

    setUpdating(true);
    try {
      const currentItem = cart.items[itemIndex];
      const quantityDiff = newQuantity - currentItem.quantity;
      
      if (quantityDiff !== 0) {
        // Sử dụng PUT method để cập nhật số lượng
        await authAxios.put('cart/', {
          product_sku_id: currentItem.product_sku.id,
          quantity: quantityDiff
        });
        
        // Fetch lại cart từ server để đảm bảo sync
        await fetchCart();

        // Cập nhật cart count trong navigation
        if (window.updateCartCount) {
          window.updateCartCount();
        }

        message.success('Đã cập nhật giỏ hàng');
      }
    } catch (error) {
      // Hiển thị lỗi cụ thể từ backend (stock validation)
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Có lỗi khi cập nhật giỏ hàng');
      }
      console.error('Update cart error:', error);
      
      // Fetch lại cart để reset về trạng thái ban đầu
      fetchCart();
    } finally {
      setUpdating(false);
    }
  };

  const removeCartItem = async (itemIndex) => {
    setUpdating(true);
    try {
      const itemToRemove = cart.items[itemIndex];
      
      // Sử dụng DELETE method để xóa item hoàn toàn
      await authAxios.delete('cart/', {
        data: {
          product_sku_id: itemToRemove.product_sku.id
        }
      });
      
      // Fetch lại cart từ server để đảm bảo sync
      await fetchCart();

      // Cập nhật cart count trong navigation
      if (window.updateCartCount) {
        window.updateCartCount();
      }

      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      message.error('Có lỗi khi xóa sản phẩm');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const calculateItemTotal = (item) => {
    // Lấy giá từ product_sku hoặc variant
    const price = item.product_sku?.final_price || item.product_sku?.variant?.final_price || 0;
    return price * item.quantity;
  };

  const calculateSubTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubTotal();
    return subtotal >= 500000 ? 0 : 30000; // Free shipping over 500k
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateShipping();
  };

  const getTotalItems = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      message.warning('Giỏ hàng trống');
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  const onCheckoutSubmit = async (values) => {
    setCheckoutLoading(true);
    try {
      const orderData = {
        shipping_name: values.shipping_name,
        shipping_address: values.shipping_address,
        shipping_city: values.shipping_city,
        shipping_postal_code: values.shipping_postal_code || '',
        phone_number: values.phone_number,
        notes: values.notes || ''
      };

      const response = await authAxios.post('orders/create-from-cart/', orderData);
      
      message.success('Đặt hàng thành công!');
      setCheckoutModalVisible(false);
      form.resetFields();
      
      // Clear cart and update navigation
      setCart({ items: [] });
      if (window.updateCartCount) {
        window.updateCartCount();
      }
      
      // Show success message with order info
      Modal.success({
        title: 'Đặt hàng thành công!',
        content: `Mã đơn hàng của bạn là: #${response.data.id}. Chúng tôi sẽ liên hệ với bạn sớm nhất.`,
      });
      
    } catch (error) {
      message.error('Có lỗi khi đặt hàng. Vui lòng thử lại');
      console.error('Error creating order:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      minHeight: '100vh'
    }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px' }}
      >
        Tiếp tục mua sắm
      </Button>

      <Title level={2} style={{ marginBottom: '30px', color: theme.textColor }}>
        <ShoppingCartOutlined /> Giỏ hàng của bạn
      </Title>

      {isEmpty ? (
        <Card style={{ backgroundColor: theme.cardBackground, borderColor: theme.borderColor }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: theme.textColor }}>
                Giỏ hàng của bạn đang trống
              </span>
            }
          >
            <Button type="primary" onClick={() => navigate('/')}>
              Mua sắm ngay
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {/* Cart Items */}
          <Col xs={24} lg={16}>
            <Card 
              title={`Sản phẩm trong giỏ (${cart.items.length})`}
              style={{ backgroundColor: theme.cardBackground, borderColor: theme.borderColor }}
              headStyle={{ color: theme.textColor, borderBottomColor: theme.borderColor }}
            >
              {cart.items.map((item, index) => (
                <div key={index}>
                  <Row gutter={[16, 16]} align="middle">
                    {/* Product Image */}
                    <Col xs={24} sm={6} md={4}>
                      {item.product_sku?.variant?.images && item.product_sku.variant.images.length > 0 ? (
                        <Image
                          width={80}
                          height={80}
                          src={getImageUrl(item.product_sku.variant.images[0].image_url || item.product_sku.variant.images[0].image)}
                          alt={item.product_sku?.variant?.product?.name || 'Product image'}
                          style={{ 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                          placeholder={
                            <div style={{
                              width: '80px',
                              height: '80px',
                              background: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px'
                            }}>
                              <Spin size="small" />
                            </div>
                          }
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN4BMghMgBBBIHcAFXQIbzaQy4wjEcQLfAAdwAJ3AAF8AJXAAJtFpNFhYEEjAlYGhFRNPm+e4zdvdDO46r7+v7Lr8N1f7yLrjCCEhwdgABelFiFKAU5SgwipKsXhQgTcELXAAE6X9fPjUwQU6RJCdNh1OkjFOkGWfXSA=="
                        />
                      ) : (
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            fontSize: '24px',
                            color: '#999'
                          }}
                        >
                          👕
                        </div>
                      )}
                    </Col>

                    {/* Product Info */}
                    <Col xs={24} sm={18} md={10}>
                      <div>
                        <Title level={5} style={{ margin: 0, marginBottom: '4px', color: theme.textColor }}>
                          {item.product_sku?.variant?.product_name || 
                           item.product_sku?.variant?.product?.name || 
                           `Sản phẩm #${item.product_sku.id}`}
                        </Title>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '4px', color: theme.secondaryText }}>
                          Kích cỡ: {item.product_sku.size} | Màu: {item.product_sku.variant.color}
                        </Text>
                        <div>
                          {(() => {
                            const variant = item.product_sku?.variant;
                            
                            if (!variant) {
                              return (
                                <Text type="secondary" style={{ fontSize: '14px', color: theme.secondaryText }}>
                                  Đang tải giá...
                                </Text>
                              );
                            }
                            
                            const finalPrice = item.product_sku.final_price || variant.final_price;
                            const hasDiscount = variant.discount_price && variant.discount_price < variant.price;
                            
                            if (hasDiscount) {
                              return (
                                <Space>
                                  <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                                    {Number(finalPrice).toLocaleString()}₫
                                  </Text>
                                  <Text delete type="secondary" style={{ fontSize: '14px', color: theme.secondaryText }}>
                                    {Number(variant.price).toLocaleString()}₫
                                  </Text>
                                </Space>
                              );
                            } else {
                              return (
                                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                  {Number(finalPrice).toLocaleString()}₫
                                </Text>
                              );
                            }
                          })()}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px', color: theme.secondaryText }}>
                            Tồn kho: {item.product_sku?.available_quantity || item.product_sku?.stock_quantity || 0}
                          </Text>
                        </div>
                      </div>
                    </Col>

                    {/* Quantity Controls */}
                    <Col xs={12} sm={12} md={6}>
                      {/* Stock warning */}
                      {item.product_sku && (item.product_sku.available_quantity || item.product_sku.stock_quantity) <= 5 && (
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="warning" style={{ fontSize: '12px', color: '#faad14' }}>
                            ⚠️ Chỉ còn {item.product_sku.available_quantity || item.product_sku.stock_quantity} sản phẩm
                          </Text>
                        </div>
                      )}
                      
                      <Space.Compact>
                        <Button
                          icon={<MinusOutlined />}
                          onClick={() => updateCartItem(index, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          size="small"
                        />
                        <InputNumber
                          value={item.quantity}
                          min={1}
                          max={item.product_sku?.available_quantity || item.product_sku?.stock_quantity || 99}
                          onChange={(value) => {
                            // Nếu value null hoặc <= 0, xóa item
                            if (!value || value <= 0) {
                              removeCartItem(index);
                            } else {
                              updateCartItem(index, value);
                            }
                          }}
                          disabled={updating}
                          style={{ width: '60px' }}
                          size="small"
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => updateCartItem(index, item.quantity + 1)}
                          disabled={updating || item.quantity >= (item.product_sku?.available_quantity || item.product_sku?.stock_quantity || 99)}
                          size="small"
                        />
                      </Space.Compact>
                      
                      {/* Stock info */}
                      {item.product_sku && (
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '11px', color: theme.secondaryText }}>
                            Tồn kho: {item.product_sku.available_quantity || item.product_sku.stock_quantity}
                          </Text>
                        </div>
                      )}
                    </Col>

                    {/* Total & Delete */}
                    <Col xs={12} sm={12} md={4}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: '16px', color: theme.textColor }}>
                          {calculateItemTotal(item).toLocaleString()}₫
                        </Text>
                        <br />
                        <Popconfirm
                          title="Xóa sản phẩm?"
                          description="Bạn có chắc muốn xóa sản phẩm này?"
                          onConfirm={() => removeCartItem(index)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            disabled={updating}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </div>
                    </Col>
                  </Row>
                  {index < cart.items.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={8}>
            <Card 
              title={`Tóm tắt đơn hàng (${getTotalItems()} sản phẩm)`} 
              style={{ 
                position: 'sticky', 
                top: '20px',
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderColor
              }}
              headStyle={{ color: theme.textColor, borderBottomColor: theme.borderColor }}
            >

              
              <div style={{ marginBottom: '20px' }}>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Text style={{ color: theme.textColor }}>Tạm tính:</Text>
                  <Text style={{ color: calculateSubTotal() === 0 ? '#ff4d4f' : theme.textColor }}>
                    {calculateSubTotal().toLocaleString()}₫
                    {calculateSubTotal() === 0 && cart?.items?.length > 0 && (
                      <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px', color: theme.secondaryText }}>
                        (Lỗi dữ liệu)
                      </Text>
                    )}
                  </Text>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Text style={{ color: theme.textColor }}>Phí vận chuyển:</Text>
                  <Text style={{ color: calculateShipping() === 0 ? '#52c41a' : theme.textColor }}>
                    {calculateShipping() === 0 ? 'Miễn phí' : `${calculateShipping().toLocaleString()}₫`}
                  </Text>
                </Row>
                {calculateSubTotal() < 500000 && (
                  <Row justify="space-between" style={{ marginBottom: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px', color: theme.secondaryText }}>
                      Mua thêm {(500000 - calculateSubTotal()).toLocaleString()}₫ để được miễn phí ship
                    </Text>
                  </Row>
                )}
                <Divider style={{ margin: '12px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '16px' }}>
                  <Title level={4} style={{ margin: 0, color: theme.textColor }}>Tổng cộng:</Title>
                  <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
                    {calculateTotal().toLocaleString()}₫
                  </Title>
                </Row>
              </div>

              {/* Savings info */}
              {(() => {
                const totalSavings = cart.items.reduce((total, item) => {
                  const product = item.product_sku?.variant?.product;
                  if (product?.discount_price) {
                    return total + (product.price - product.discount_price) * item.quantity;
                  }
                  return total;
                }, 0);
                
                return totalSavings > 0 && (
                  <div style={{ 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '16px'
                  }}>
                    <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                      💰 Bạn đã tiết kiệm được: {totalSavings.toLocaleString()}₫
                    </Text>
                  </div>
                );
              })()}

              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                onClick={handleCheckout}
                block
                style={{ 
                  height: '50px',
                  marginBottom: '16px'
                }}
              >
                Tiến hành thanh toán
              </Button>

              <Button
                size="large"
                onClick={() => navigate('/')}
                block
              >
                Tiếp tục mua sắm
              </Button>

              {/* Shipping Info */}
              <Divider />
              <div style={{ fontSize: '12px', color: '#666' }}>
                <div style={{ marginBottom: '8px' }}>
                  🚚 Miễn phí vận chuyển cho đơn hàng từ 500,000₫
                </div>
                <div style={{ marginBottom: '8px' }}>
                  📦 Giao hàng trong 2-5 ngày làm việc
                </div>
                <div>
                  🔄 Đổi trả miễn phí trong 30 ngày
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Checkout Modal */}
      <Modal
        title="Thông tin giao hàng"
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onCheckoutSubmit}
        >
          <Form.Item
            label="Họ và tên"
            name="shipping_name"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone_number"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="shipping_address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ chi tiết" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Thành phố"
                name="shipping_city"
                rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
              >
                <Input placeholder="Thành phố" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mã bưu điện"
                name="shipping_postal_code"
              >
                <Input placeholder="Mã bưu điện (không bắt buộc)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={2} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCheckoutModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={checkoutLoading}>
                Đặt hàng ({calculateTotal().toLocaleString('vi-VN')}đ)
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CartPage;