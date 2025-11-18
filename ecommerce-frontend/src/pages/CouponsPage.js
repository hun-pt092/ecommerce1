import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Tag, Empty, Spin, message, Typography, Statistic, Button, Tooltip } from 'antd';
import { GiftOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, PercentageOutlined, CopyOutlined } from '@ant-design/icons';
import apiClient from '../api/apiClient';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useTheme } from '../contexts/ThemeContext';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CouponsPage = () => {
  const [coupons, setСoupons] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]); // Store all coupons for statistics
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const { theme } = useTheme();

  useEffect(() => {
    fetchAllCoupons();
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [activeTab]);

  const fetchAllCoupons = async () => {
    try {
      const response = await apiClient.get('/coupons/');
      setAllCoupons(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching all coupons:', error);
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/coupons/', {
        params: { status: activeTab }
      });
      setСoupons(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      message.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã: ${code}`);
  };

  const getCouponTypeDisplay = (type) => {
    const types = {
      percentage: { text: 'Phần trăm', color: 'blue' },
      fixed: { text: 'Số tiền cố định', color: 'green' },
      free_shipping: { text: 'Miễn phí ship', color: 'orange' },
    };
    return types[type] || { text: type, color: 'default' };
  };

  const getOccasionIcon = (occasion) => {
    const icons = {
      birthday: '🎂',
      promotion: '🎉',
      seasonal: '🌟',
      first_order: '🆕',
      loyalty: '💎',
    };
    return icons[occasion] || '🎁';
  };

  const formatDiscount = (coupon) => {
    if (coupon.coupon_type === 'percentage') {
      return (
        <div>
          <Text strong style={{ fontSize: '28px', color: '#ff4d4f' }}>
            {coupon.discount_value}%
          </Text>
          {coupon.max_discount_amount && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Tối đa {Number(coupon.max_discount_amount).toLocaleString()}đ
            </div>
          )}
        </div>
      );
    } else if (coupon.coupon_type === 'fixed') {
      return (
        <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
          {Number(coupon.discount_value).toLocaleString()}đ
        </Text>
      );
    } else {
      return (
        <Text strong style={{ fontSize: '18px', color: '#fa8c16' }}>
          Miễn phí vận chuyển
        </Text>
      );
    }
  };

  const renderCouponCard = (coupon) => {
    const isValid = coupon.is_valid_now?.valid;
    const daysRemaining = coupon.days_remaining;
    const typeDisplay = getCouponTypeDisplay(coupon.coupon_type);

    return (
      <Col xs={24} sm={24} md={12} lg={8} key={coupon.id}>
        <Card
          hoverable={isValid}
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: isValid ? '2px solid #52c41a' : '1px solid #d9d9d9',
            opacity: isValid ? 1 : 0.6,
            position: 'relative',
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
          }}
          bodyStyle={{ padding: '16px' }}
        >
          {/* Header with icon and type */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>
                {getOccasionIcon(coupon.coupon?.occasion_type)}
              </span>
              <Tag color={typeDisplay.color}>{typeDisplay.text}</Tag>
            </div>
            {isValid && (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Có thể dùng
              </Tag>
            )}
            {!isValid && coupon.is_used && (
              <Tag icon={<CheckCircleOutlined />} color="default">
                Đã sử dụng
              </Tag>
            )}
            {!isValid && !coupon.is_used && (
              <Tag icon={<CloseCircleOutlined />} color="error">
                Hết hạn
              </Tag>
            )}
          </div>

          {/* Coupon Name */}
          <Title level={5} style={{ marginBottom: '8px', minHeight: '48px' }}>
            {coupon.coupon_name}
          </Title>

          {/* Discount Amount */}
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 0', 
            background: theme === 'dark' ? '#141414' : '#f5f5f5', 
            borderRadius: '8px', 
            marginBottom: '12px' 
          }}>
            {formatDiscount(coupon)}
          </div>

          {/* Coupon Code */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px',
            background: theme === 'dark' ? '#1f1f1f' : '#fff',
            border: '2px dashed #1890ff',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <Text strong style={{ fontSize: '18px', color: '#1890ff', letterSpacing: '2px' }}>
              {coupon.coupon_code}
            </Text>
            <Tooltip title="Sao chép mã">
              <Button 
                type="text" 
                icon={<CopyOutlined />} 
                size="small"
                onClick={() => copyCouponCode(coupon.coupon_code)}
              />
            </Tooltip>
          </div>

          {/* Description */}
          <Paragraph 
            style={{ 
              fontSize: '13px', 
              color: '#666', 
              marginBottom: '12px',
              minHeight: '40px' 
            }}
            ellipsis={{ rows: 2 }}
          >
            {coupon.coupon_description}
          </Paragraph>

          {/* Min Purchase */}
          {coupon.min_purchase_amount > 0 && (
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              💰 Đơn tối thiểu: <strong>{Number(coupon.min_purchase_amount).toLocaleString()}đ</strong>
            </div>
          )}

          {/* Validity Period */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
            <div>
              <ClockCircleOutlined /> Từ: {dayjs(coupon.valid_from).format('DD/MM/YYYY')}
            </div>
            <div>
              Đến: {dayjs(coupon.valid_to).format('DD/MM/YYYY')}
            </div>
          </div>

          {/* Days Remaining */}
          {isValid && daysRemaining !== undefined && (
            <div 
              style={{ 
                marginTop: '8px', 
                textAlign: 'center',
                padding: '6px',
                background: daysRemaining <= 3 ? '#fff1f0' : '#e6f7ff',
                borderRadius: '4px',
                fontSize: '12px',
                color: daysRemaining <= 3 ? '#ff4d4f' : '#1890ff',
                fontWeight: 500
              }}
            >
              {daysRemaining === 0 ? '⚠️ Hôm nay là ngày cuối!' : `⏰ Còn ${daysRemaining} ngày`}
            </div>
          )}

          {/* Used Date */}
          {coupon.is_used && coupon.used_at && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              Đã sử dụng: {dayjs(coupon.used_at).format('DD/MM/YYYY HH:mm')}
            </div>
          )}
        </Card>
      </Col>
    );
  };

  const stats = {
    available: allCoupons.filter(c => c.is_valid_now?.valid && !c.is_used).length,
    used: allCoupons.filter(c => c.is_used).length,
    expired: allCoupons.filter(c => !c.is_valid_now?.valid && !c.is_used).length,
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: theme === 'dark' ? '#141414' : '#f0f2f5',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
          <GiftOutlined /> Ví Voucher Của Tôi
        </Title>
        <Text type="secondary">
          Quản lý và sử dụng các mã giảm giá của bạn
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card style={{ backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff' }}>
            <Statistic 
              title="Có thể sử dụng" 
              value={stats.available} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff' }}>
            <Statistic 
              title="Đã sử dụng" 
              value={stats.used} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff' }}>
            <Statistic 
              title="Đã hết hạn" 
              value={stats.expired} 
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <CheckCircleOutlined />
                Có thể dùng ({stats.available})
              </span>
            } 
            key="available"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : coupons.length === 0 ? (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Bạn chưa có voucher nào có thể sử dụng"
              />
            ) : (
              <Row gutter={[16, 16]}>
                {coupons.map(renderCouponCard)}
              </Row>
            )}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <CheckCircleOutlined />
                Đã sử dụng ({stats.used})
              </span>
            } 
            key="used"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : coupons.length === 0 ? (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Bạn chưa sử dụng voucher nào"
              />
            ) : (
              <Row gutter={[16, 16]}>
                {coupons.map(renderCouponCard)}
              </Row>
            )}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <CloseCircleOutlined />
                Đã hết hạn ({stats.expired})
              </span>
            } 
            key="expired"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : coupons.length === 0 ? (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có voucher nào hết hạn"
              />
            ) : (
              <Row gutter={[16, 16]}>
                {coupons.map(renderCouponCard)}
              </Row>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CouponsPage;
