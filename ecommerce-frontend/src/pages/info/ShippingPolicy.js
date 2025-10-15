import React from 'react';
import { Card, Row, Col, Typography, Table, Alert, Timeline, Tag, Divider } from 'antd';
import { 
  TruckOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;

const ShippingPolicyPage = () => {
  const { theme } = useTheme();

  // Bảng giá vận chuyển
  const shippingRates = [
    {
      key: '1',
      area: 'Nội thành TP.HaNoi',
      time: '1-2 ngày',
      fee: '25,000đ',
      freeShipping: 'Đơn hàng ≥ 500,000đ'
    },
    {
      key: '2',
      area: 'Ngoại thành TP.HaNoi',
      time: '2-3 ngày',
      fee: '35,000đ',
      freeShipping: 'Đơn hàng ≥ 800,000đ'
    },
    {
      key: '3',
      area: 'Hà Nội & các thành phố lớn',
      time: '2-4 ngày',
      fee: '40,000đ',
      freeShipping: 'Đơn hàng ≥ 1,000,000đ'
    },
    {
      key: '4',
      area: 'Các tỉnh thành khác',
      time: '3-7 ngày',
      fee: '50,000đ',
      freeShipping: 'Đơn hàng ≥ 1,200,000đ'
    },
    {
      key: '5',
      area: 'Vùng sâu, vùng xa',
      time: '5-10 ngày',
      fee: '70,000đ',
      freeShipping: 'Đơn hàng ≥ 1,500,000đ'
    }
  ];

  const columns = [
    {
      title: <><EnvironmentOutlined /> Khu vực</>,
      dataIndex: 'area',
      key: 'area',
      width: '25%'
    },
    {
      title: <><ClockCircleOutlined /> Thời gian</>,
      dataIndex: 'time',
      key: 'time',
      width: '20%'
    },
    {
      title: <><DollarOutlined /> Phí vận chuyển</>,
      dataIndex: 'fee',
      key: 'fee',
      width: '20%',
      render: (fee) => <Text strong style={{ color: '#1890ff' }}>{fee}</Text>
    },
    {
      title: 'Miễn phí vận chuyển',
      dataIndex: 'freeShipping',
      key: 'freeShipping',
      width: '35%',
      render: (text) => <Tag color="green">{text}</Tag>
    }
  ];

  return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <Card style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)', border: 'none' }}>
          <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
              <TruckOutlined /> Chính sách giao hàng
            </Title>
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '800px', margin: '0 auto' }}>
              Chúng tôi cam kết giao hàng nhanh chóng, an toàn và tiện lợi đến tận tay khách hàng
              trên toàn quốc với nhiều hình thức vận chuyển đa dạng.
            </Paragraph>
          </div>
        </Card>

        {/* Shipping Rates Table */}
        <Card style={{ marginBottom: '30px' }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            <DollarOutlined /> Bảng giá & thời gian vận chuyển
          </Title>
          <Table
            columns={columns}
            dataSource={shippingRates}
            pagination={false}
            bordered
            size="middle"
          />
          <Alert
            message="Lưu ý quan trọng"
            description="Phí vận chuyển có thể thay đổi tùy thuộc vào trọng lượng, kích thước đơn hàng và điều kiện vận chuyển thực tế."
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* Shipping Methods */}
          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ color: '#1890ff' }}>
                <TruckOutlined /> Hình thức vận chuyển
              </Title>
              
              <div style={{ marginBottom: '20px' }}>
                <Title level={4} style={{ color: '#52c41a' }}>1. Giao hàng tiêu chuẩn</Title>
                <ul>
                  <li>Thời gian: 2-7 ngày làm việc</li>
                  <li>Phí ship: Theo bảng giá</li>
                  <li>Phù hợp: Đơn hàng thông thường</li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Title level={4} style={{ color: '#722ed1' }}>2. Giao hàng nhanh</Title>
                <ul>
                  <li>Thời gian: 1-3 ngày làm việc</li>
                  <li>Phí ship: +20,000đ so với tiêu chuẩn</li>
                  <li>Phù hợp: Đơn hàng gấp</li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Title level={4} style={{ color: '#fa8c16' }}>3. Giao hàng trong ngày</Title>
                <ul>
                  <li>Thời gian: Trong vòng 4-6 giờ</li>
                  <li>Phí ship: 60,000đ (chỉ nội thành HCM)</li>
                  <li>Điều kiện: Đặt hàng trước 14h</li>
                </ul>
              </div>

              <div>
                <Title level={4} style={{ color: '#eb2f96' }}>4. Nhận tại cửa hàng</Title>
                <ul>
                  <li>Thời gian: Ngay sau khi đặt hàng</li>
                  <li>Phí ship: Miễn phí</li>
                  <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HaNoi</li>
                </ul>
              </div>
            </Card>
          </Col>

          {/* Shipping Process */}
          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ color: '#1890ff' }}>
                <ClockCircleOutlined /> Quy trình giao hàng
              </Title>
              <Timeline>
                <Timeline.Item color="blue" dot={<CheckCircleOutlined />}>
                  <Title level={5}>Xác nhận đơn hàng</Title>
                  <Paragraph>Chúng tôi sẽ gọi điện xác nhận trong vòng 30 phút sau khi bạn đặt hàng</Paragraph>
                </Timeline.Item>
                
                <Timeline.Item color="orange" dot={<CheckCircleOutlined />}>
                  <Title level={5}>Chuẩn bị hàng</Title>
                  <Paragraph>Đóng gói cẩn thận và kiểm tra chất lượng sản phẩm</Paragraph>
                </Timeline.Item>
                
                <Timeline.Item color="purple" dot={<CheckCircleOutlined />}>
                  <Title level={5}>Vận chuyển</Title>
                  <Paragraph>Bàn giao cho đơn vị vận chuyển và gửi mã tracking</Paragraph>
                </Timeline.Item>
                
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <Title level={5}>Giao hàng thành công</Title>
                  <Paragraph>Nhận hàng và thanh toán (COD) hoặc đã thanh toán trước</Paragraph>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Col>
        </Row>

        {/* Important Notes */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            <InfoCircleOutlined /> Lưu ý quan trọng
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Title level={4} style={{ color: '#52c41a' }}>✅ Chúng tôi giao hàng:</Title>
              <ul>
                <li>Tất cả 63 tỉnh thành trên toàn quốc</li>
                <li>Thứ 2 - Thứ 6: 8h00 - 18h00</li>
                <li>Thứ 7 - Chủ nhật: 8h00 - 17h00</li>
                <li>Ngày lễ tết: Theo thông báo riêng</li>
              </ul>
            </Col>
            
            <Col xs={24} md={12}>
              <Title level={4} style={{ color: '#f5222d' }}>❌ Chúng tôi không giao hàng:</Title>
              <ul>
                <li>Các khu vực không có dịch vụ bưu chính</li>
                <li>Khu vực có thiên tai, dịch bệnh</li>
                <li>Địa chỉ không rõ ràng, không liên lạc được</li>
                <li>Từ chối giao hàng quá 3 lần</li>
              </ul>
            </Col>
          </Row>
        </Card>

        {/* Contact for Support */}
        <Card style={{ marginTop: '30px', background: '#f6ffed' }}>
          <Title level={3} style={{ color: '#52c41a', textAlign: 'center' }}>
            Cần hỗ trợ về vận chuyển?
          </Title>
          <Row gutter={[24, 24]} justify="center" style={{ textAlign: 'center' }}>
            <Col xs={24} sm={8}>
              <Text strong>Hotline hỗ trợ:</Text><br />
              <Text style={{ fontSize: '18px', color: '#1890ff' }}>1900 xxxx</Text><br />
              <Text type="secondary">(Miễn phí - 24/7)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text strong>Email hỗ trợ:</Text><br />
              <Text style={{ fontSize: '18px', color: '#1890ff' }}>shipping@fashionstore.com</Text><br />
              <Text type="secondary">(Phản hồi trong 2h)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text strong>Live Chat:</Text><br />
              <Text style={{ fontSize: '18px', color: '#1890ff' }}>Website & App</Text><br />
              <Text type="secondary">(8h00 - 22h00 hàng ngày)</Text>
            </Col>
          </Row>
        </Card>
      </div>
  );
};

export default ShippingPolicyPage;