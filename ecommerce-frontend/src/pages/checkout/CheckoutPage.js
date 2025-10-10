import React, { useState, useEffect, useCallback } from 'react';
import { 
  Steps, 
  Card, 
  message, 
  Spin,
  Typography
} from 'antd';
import { 
  ShoppingCartOutlined, 
  EnvironmentOutlined, 
  CreditCardOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../../api/AuthAxios';
import CartSummary from '../../components/checkout/CartSummary';
import AddressForm from '../../components/checkout/AddressForm';
import PaymentForm from '../../components/checkout/PaymentForm';
import OrderConfirmation from '../../components/checkout/OrderConfirmation';

const { Title, Text } = Typography;
const { Step } = Steps;

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  const fetchCartData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAxios.get('cart/');
      setCartData(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Không thể tải thông tin giỏ hàng');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchCartData();
  }, [fetchCartData]);

  const steps = [
    {
      title: 'Giỏ hàng',
      icon: <ShoppingCartOutlined />,
      description: 'Xác nhận sản phẩm'
    },
    {
      title: 'Địa chỉ',
      icon: <EnvironmentOutlined />,
      description: 'Thông tin giao hàng'
    },
    {
      title: 'Thanh toán',
      icon: <CreditCardOutlined />,
      description: 'Phương thức thanh toán'
    },
    {
      title: 'Hoàn thành',
      icon: <CheckCircleOutlined />,
      description: 'Xác nhận đơn hàng'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleAddressSubmit = (addressData) => {
    setShippingAddress(addressData);
    handleNext();
  };

  const handlePaymentSubmit = (paymentData) => {
    console.log('CheckoutPage handlePaymentSubmit called with:', paymentData);
    processOrder(paymentData);
  };

  const processOrder = async (paymentData) => {
    console.log('processOrder called with:', paymentData);
    console.log('shippingAddress:', shippingAddress);
    console.log('shippingAddress structure:', JSON.stringify(shippingAddress, null, 2));
    
    setLoading(true);
    try {
      const orderPayload = {
        shipping_name: shippingAddress.full_name,
        shipping_address: shippingAddress.full_address,
        shipping_city: shippingAddress.ward_name + ', ' + shippingAddress.district_name + ', ' + shippingAddress.province_name,
        shipping_postal_code: shippingAddress.postal_code || '',
        shipping_country: 'Vietnam',
        phone_number: shippingAddress.phone_number,
        notes: paymentData.notes || ''
      };

      console.log('Sending order payload:', orderPayload);
      console.log('About to call: orders/create/');
      const response = await authAxios.post('orders/create/', orderPayload);
      console.log('Order response:', response.data);
      
      setOrderData(response.data);
      handleNext();
      message.success('Đặt hàng thành công!');
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response?.data);
      message.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CartSummary 
            cartData={cartData}
            onNext={handleNext}
            onEdit={() => navigate('/cart')}
          />
        );
      case 1:
        return (
          <AddressForm 
            onSubmit={handleAddressSubmit}
            onPrevious={handlePrevious}
            loading={loading}
          />
        );
      case 2:
        return (
          <PaymentForm 
            cartData={cartData}
            shippingAddress={shippingAddress}
            onSubmit={handlePaymentSubmit}
            onPrevious={handlePrevious}
            loading={loading}
          />
        );
      case 3:
        return (
          <OrderConfirmation 
            orderData={orderData}
            onContinueShopping={() => navigate('/')}
            onViewOrders={() => navigate('/orders')}
          />
        );
      default:
        return null;
    }
  };

  if (loading && !cartData) {
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
    <div style={{ 
      padding: '24px 16px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          Thanh toán đơn hàng
        </Title>
        <Text type="secondary">
          Hoàn tất các bước để đặt hàng thành công
        </Text>
      </div>

      {/* Steps */}
      <Card style={{ marginBottom: '24px' }}>
        <Steps 
          current={currentStep} 
          size="small"
          responsive={false}
        >
          {steps.map((step, index) => (
            <Step 
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
      </Card>

      {/* Step Content */}
      <div style={{ minHeight: '400px' }}>
        {renderStepContent()}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;