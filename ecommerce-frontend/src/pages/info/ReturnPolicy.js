import React from 'react';
import { Card, Row, Col, Typography, Steps, Alert, Timeline, Tag, Divider, Table } from 'antd';
import { 
  SwapOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const ReturnPolicyPage = () => {
  const { theme } = useTheme();

  // Bảng điều kiện đổi trả
  const returnConditions = [
    {
      key: '1',
      condition: 'Thời gian',
      requirement: '7 ngày kể từ ngày nhận hàng',
      note: 'Tính từ 0h ngày thứ 8'
    },
    {
      key: '2',
      condition: 'Tình trạng sản phẩm',
      requirement: 'Còn nguyên tem mác, chưa sử dụng',
      note: 'Không có dấu hiệu đã qua sử dụng'
    },
    {
      key: '3',
      condition: 'Bao bì',
      requirement: 'Còn nguyên hộp, túi đựng gốc',
      note: 'Không rách, không bị hư hại'
    },
    {
      key: '4',
      condition: 'Hóa đơn',
      requirement: 'Có hóa đơn mua hàng gốc',
      note: 'Hóa đơn giấy hoặc điện tử'
    }
  ];

  const conditionColumns = [
    {
      title: 'Điều kiện',
      dataIndex: 'condition',
      key: 'condition',
      width: '25%',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Yêu cầu',
      dataIndex: 'requirement',
      key: 'requirement',
      width: '40%'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: '35%',
      render: (text) => <Text type="secondary">{text}</Text>
    }
  ];

  return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        backgroundColor: theme.backgroundColor,
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Card style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #722ed1 0%, #eb2f96 100%)', border: 'none' }}>
          <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
              <SwapOutlined /> Chính sách đổi trả
            </Title>
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '800px', margin: '0 auto' }}>
              Chúng tôi cam kết đổi trả sản phẩm trong vòng 7 ngày để đảm bảo 
              quyền lợi và sự hài lòng của khách hàng.
            </Paragraph>
          </div>
        </Card>

        {/* Important Alert */}
        <Alert
          message="Thông báo quan trọng"
          description="Chính sách đổi trả áp dụng cho tất cả sản phẩm trừ các mặt hàng đặc biệt (underwear, swimwear, accessories vệ sinh cá nhân). Vui lòng đọc kỹ điều kiện trước khi yêu cầu đổi trả."
          type="warning"
          showIcon
          style={{ marginBottom: '30px' }}
        />

        {/* Return Conditions */}
        <Card style={{ 
          marginBottom: '30px',
        }}>
          <Title level={3} style={{ color: '#722ed1' }}>
            <CheckCircleOutlined /> Điều kiện đổi trả
          </Title>
          <Table
            columns={conditionColumns}
            dataSource={returnConditions}
            pagination={false}
            bordered
            size="middle"
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* Return Process */}
          <Col xs={24} lg={12}>
            <Card style={{
              
            }}>
              <Title level={3} style={{ color: '#722ed1' }}>
                <ClockCircleOutlined /> Quy trình đổi trả
              </Title>
              <Steps direction="vertical" size="small">
                <Step
                  status="process"
                  title="Liên hệ yêu cầu"
                  description="Gọi hotline hoặc gửi email yêu cầu đổi trả kèm thông tin đơn hàng"
                  icon={<PhoneOutlined />}
                />
                <Step
                  status="process"
                  title="Xác nhận điều kiện"
                  description="Nhân viên kiểm tra và xác nhận đơn hàng đủ điều kiện đổi trả"
                  icon={<CheckCircleOutlined />}
                />
                <Step
                  status="process"
                  title="Gửi hàng về"
                  description="Đóng gói cẩn thận và gửi hàng về địa chỉ cửa hàng"
                  icon={<ShoppingCartOutlined />}
                />
                <Step
                  status="process"
                  title="Kiểm tra hàng"
                  description="Chúng tôi kiểm tra tình trạng sản phẩm trong vòng 1-2 ngày"
                  icon={<ExclamationCircleOutlined />}
                />
                <Step
                  status="process"
                  title="Xử lý hoàn tất"
                  description="Hoàn tiền hoặc gửi sản phẩm mới theo yêu cầu"
                  icon={<CheckCircleOutlined />}
                />
              </Steps>
            </Card>
          </Col>

          {/* Return Types */}
          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ color: '#722ed1' }}>
                <SwapOutlined /> Các trường hợp được chấp nhận
              </Title>
              
              <div style={{ marginBottom: '20px' }}>
                <Title level={4} style={{ color: '#52c41a' }}>
                  <CheckCircleOutlined /> Được chấp nhận
                </Title>
                <ul>
                  <li>Sản phẩm bị lỗi từ nhà sản xuất</li>
                  <li>Giao nhầm sản phẩm, kích cỡ, màu sắc</li>
                  <li>Sản phẩm bị hư hại trong quá trình vận chuyển</li>
                  <li>Không vừa kích cỡ (còn nguyên tem mác)</li>
                  <li>Không hài lòng về chất lượng</li>
                </ul>
              </div>

              <div>
                <Title level={4} style={{ color: '#f5222d' }}>
                  <CloseCircleOutlined /> Không được chấp nhận
                </Title>
                <ul>
                  <li>Đã qua 7 ngày kể từ ngày nhận hàng</li>
                  <li>Sản phẩm đã qua sử dụng, có dấu hiệu bẩn</li>
                  <li>Đã cắt bỏ tem mác, nhãn hiệu</li>
                  <li>Hư hại do sử dụng không đúng cách</li>
                  <li>Underwear, swimwear đã mở bao bì</li>
                  <li>Sản phẩm sale, khuyến mãi đặc biệt</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Return Timeline */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#722ed1' }}>
            <ClockCircleOutlined /> Thời gian xử lý
          </Title>
          <Timeline>
            <Timeline.Item color="blue">
              <Title level={5}>Ngày 1: Tiếp nhận yêu cầu</Title>
              <Paragraph>Xác nhận thông tin và tư vấn khách hàng về quy trình đổi trả</Paragraph>
            </Timeline.Item>
            <Timeline.Item color="orange">
              <Title level={5}>Ngày 2-3: Nhận hàng trả về</Title>
              <Paragraph>Nhận và kiểm tra tình trạng sản phẩm, xác nhận đủ điều kiện</Paragraph>
            </Timeline.Item>
            <Timeline.Item color="purple">
              <Title level={5}>Ngày 4-5: Xử lý đổi trả</Title>
              <Paragraph>Thực hiện hoàn tiền hoặc gửi sản phẩm thay thế</Paragraph>
            </Timeline.Item>
            <Timeline.Item color="green">
              <Title level={5}>Ngày 6-7: Hoàn tất</Title>
              <Paragraph>Khách hàng nhận được tiền hoàn hoặc sản phẩm mới</Paragraph>
            </Timeline.Item>
          </Timeline>
        </Card>

        {/* Fee Information */}
        <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
          <Col xs={24} md={12}>
            <Card style={{ background: '#f6ffed' }}>
              <Title level={4} style={{ color: '#52c41a' }}>
                <CheckCircleOutlined /> Miễn phí đổi trả
              </Title>
              <ul>
                <li>Lỗi từ nhà sản xuất</li>
                <li>Giao nhầm sản phẩm</li>
                <li>Hư hại do vận chuyển</li>
                <li>Đơn hàng trên 500,000đ</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ background: '#fff2f0' }}>
              <Title level={4} style={{ color: '#f5222d' }}>
                <ExclamationCircleOutlined /> Khách hàng chịu phí
              </Title>
              <ul>
                <li>Không vừa kích cỡ: 30,000đ</li>
                <li>Không hài lòng chất lượng: 50,000đ</li>
                <li>Đổi sang sản phẩm khác: 40,000đ</li>
                <li>Đơn hàng dưới 500,000đ: Phí vận chuyển 2 chiều</li>
              </ul>
            </Card>
          </Col>
        </Row>

        {/* Contact Information */}
        <Card style={{ marginTop: '30px', background: '#f0f5ff' }}>
          <Title level={3} style={{ color: '#1890ff', textAlign: 'center' }}>
            Liên hệ hỗ trợ đổi trả
          </Title>
          <Row gutter={[24, 24]} justify="center" style={{ textAlign: 'center' }}>
            <Col xs={24} sm={8}>
              <PhoneOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <br />
              <Text strong>Hotline đổi trả:</Text><br />
              <Text style={{ fontSize: '18px', color: '#1890ff' }}>1900 xxxx</Text><br />
              <Text type="secondary">(8h00 - 22h00 hàng ngày)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <MailOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <br />
              <Text strong>Email hỗ trợ:</Text><br />
              <Text style={{ fontSize: '18px', color: '#1890ff' }}>return@fashionstore.com</Text><br />
              <Text type="secondary">(Phản hồi trong 4h)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <ShoppingCartOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <br />
              <Text strong>Địa chỉ trả hàng:</Text><br />
              <Text style={{ fontSize: '16px', color: '#1890ff' }}>123 Đường ABC, Quận 1</Text><br />
              <Text style={{ fontSize: '16px', color: '#1890ff' }}>TP. Hà Nội</Text>
            </Col>
          </Row>
        </Card>
      </div>
  );
};

export default ReturnPolicyPage;