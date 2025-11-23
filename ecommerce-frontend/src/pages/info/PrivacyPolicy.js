import React from 'react';
import { Card, Row, Col, Typography, Alert, Timeline, Collapse, Divider } from 'antd';
import { 
  SafetyOutlined, 
  UserOutlined, 
  DatabaseOutlined,
  LockOutlined,
  EyeOutlined,
  SecurityScanOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const PrivacyPolicyPage = () => {
  const { theme } = useTheme();

  return (
    <>
      <style>{`
        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
          color: ${theme.textColor} !important;
        }
        .ant-collapse-ghost .ant-collapse-content {
          background-color: ${theme.cardBackground} !important;
        }
      `}</style>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        backgroundColor: theme.backgroundColor,
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Card style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)', border: 'none' }}>
          <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
              <SafetyOutlined /> Chính sách bảo mật
            </Title>
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '800px', margin: '0 auto' }}>
              Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng một cách an toàn và bảo mật nhất.
              Vui lòng đọc kỹ chính sách để hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
            </Paragraph>
          </div>
        </Card>

        {/* Last Updated */}
        <Alert
          message={
            <>
              <ClockCircleOutlined /> Cập nhật lần cuối: 15/10/2025
            </>
          }
          description="Chính sách này có hiệu lực từ ngày 01/01/2025 và áp dụng cho tất cả người dùng của PKA Shop."
          type="info"
          showIcon
          style={{ marginBottom: '30px' }}
        />

        {/* Data Collection - Simplified */}
        <Card style={{ 
          marginBottom: '30px',
          background: theme.cardBackground,
          borderColor: theme.borderColor
        }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            <DatabaseOutlined /> Thu thập & Bảo vệ thông tin
          </Title>
          
          <Alert
            message="Cam kết bảo mật"
            description="PKA Shop chỉ thu thập thông tin cần thiết để phục vụ quá trình mua hàng và cải thiện trải nghiệm khách hàng. Tất cả thông tin được bảo mật theo tiêu chuẩn quốc tế."
            type="success"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          
          <Paragraph style={{ color: theme.textColor }}>
            <Text strong style={{ color: theme.textColor }}>Chúng tôi thu thập:</Text> Thông tin cần thiết cho việc đặt hàng, giao hàng và thanh toán. 
            Tất cả dữ liệu được mã hóa và bảo vệ nghiêm ngặt.
          </Paragraph>
        </Card>

        {/* Data Usage */}
        <Card style={{ 
          marginBottom: '30px',
          background: theme.cardBackground,
          borderColor: theme.borderColor
        }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            <InfoCircleOutlined /> Mục đích sử dụng thông tin
          </Title>
          
          <Collapse defaultActiveKey={['1']} ghost>
            <Panel 
                header={
                <span style={{ color: theme.textColor }}>
                    <ShoppingCartOutlined style={{ color: theme.textColor, marginRight: '8px' }} />
                    Xử lý đơn hàng và giao hàng
                </span>
            } key="1">
              <ul style={{ color: theme.textColor }}>
                <li>Xác nhận và xử lý đơn hàng của khách hàng</li>
                <li>Liên lạc về tình trạng đơn hàng, giao hàng</li>
                <li>Xử lý thanh toán và hoàn tiền</li>
                <li>Cung cấp dịch vụ chăm sóc khách hàng</li>
              </ul>
            </Panel>
            
            <Panel header={
                <span style={{ color: theme.textColor }}>
                    <MailOutlined style={{ color: theme.textColor, marginRight: '8px' }} />
                    Marketing và quảng cáo
                </span>
             } key="2">
              <ul style={{ color: theme.textColor }}>
                <li>Gửi thông tin khuyến mãi, sản phẩm mới (chỉ khi đồng ý)</li>
                <li>Cá nhân hóa trải nghiệm mua sắm</li>
                <li>Phân tích hành vi để cải thiện dịch vụ</li>
                <li>Chương trình khách hàng thân thiết</li>
              </ul>
            </Panel>
            
            <Panel header={
                <span style={{ color: theme.textColor }}>
                    <LockOutlined style={{ color: theme.textColor, marginRight: '8px' }} />
                    Bảo mật và tuân thủ pháp luật
                </span>
            } key="3">
              <ul style={{ color: theme.textColor }}>
                <li>Xác thực danh tính và ngăn chặn gian lận</li>
                <li>Tuân thủ các quy định pháp luật</li>
                <li>Bảo vệ quyền lợi của công ty và khách hàng</li>
                <li>Giải quyết tranh chấp (nếu có)</li>
              </ul>
            </Panel>
          </Collapse>
        </Card>

        {/* Data Protection */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ color: '#1890ff' }}>
                <LockOutlined /> Bảo mật thông tin
              </Title>
              
              <Alert
                message="Cam kết bảo mật"
                description="PKA Shop sử dụng các biện pháp bảo mật tiêu chuẩn để bảo vệ thông tin khách hàng."
                type="success"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              
              <Paragraph>
                <Text strong>Chúng tôi áp dụng:</Text> Mã hóa dữ liệu, kiểm soát truy cập nghiêm ngặt, 
                và tuân thủ các quy định bảo mật hiện hành.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ color: '#1890ff' }}>
                <SafetyOutlined /> Quyền của khách hàng
              </Title>
              
              <div style={{ marginBottom: '20px' }}>
                <Title level={5} style={{ color: '#52c41a' }}>✅ Quyền truy cập</Title>
                <Paragraph>Bạn có quyền xem, cập nhật thông tin cá nhân bất cứ lúc nào</Paragraph>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Title level={5} style={{ color: '#1890ff' }}>✅ Quyền xóa dữ liệu</Title>
                <Paragraph>Bạn có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân</Paragraph>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Title level={5} style={{ color: '#722ed1' }}>✅ Quyền từ chối</Title>
                <Paragraph>Bạn có thể từ chối nhận email marketing bất cứ lúc nào</Paragraph>
              </div>

              <div>
                <Title level={5} style={{ color: '#fa8c16' }}>✅ Quyền khiếu nại</Title>
                <Paragraph>Bạn có quyền khiếu nại về cách xử lý thông tin cá nhân</Paragraph>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Data Sharing */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            <DatabaseOutlined /> Chia sẻ thông tin với bên thứ ba
          </Title>
          
          <Alert
            message="Cam kết quan trọng"
            description="Chúng tôi KHÔNG bán, cho thuê hoặc trao đổi thông tin cá nhân của khách hàng với bất kỳ bên thứ ba nào vì mục đích thương mại."
            type="success"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Title level={4}>Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <ul>
                <li><Text strong>Đối tác vận chuyển:</Text> Thông tin giao hàng cần thiết</li>
                <li><Text strong>Đối tác thanh toán:</Text> Xử lý giao dịch tài chính</li>
                <li><Text strong>Cơ quan pháp luật:</Text> Khi có yêu cầu hợp pháp</li>
              </ul>
            </Col>
            <Col xs={24} md={12}>
              <ul>
                <li><Text strong>Nhà cung cấp dịch vụ:</Text> Email, SMS, phân tích dữ liệu</li>
                <li><Text strong>Tình huống khẩn cấp:</Text> Bảo vệ an toàn người dùng</li>
                <li><Text strong>Với sự đồng ý:</Text> Khi khách hàng đồng ý rõ ràng</li>
              </ul>
            </Col>
          </Row>
        </Card>

        {/* Cookies Policy */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            🍪 Chính sách Cookies
          </Title>
          
          <Paragraph>
            Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn trên website. 
            Cookies giúp chúng tôi nhớ tùy chọn của bạn và cung cấp nội dung phù hợp.
          </Paragraph>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: '#f6ffed' }}>
                <Text strong style={{ color: '#52c41a' }}>Cookies cần thiết</Text>
                <br />
                <Text type="secondary">Đăng nhập, giỏ hàng, bảo mật</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: '#f0f5ff' }}>
                <Text strong style={{ color: '#1890ff' }}>Cookies phân tích</Text>
                <br />
                <Text type="secondary">Thống kê, cải thiện website</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: '#fff2f0' }}>
                <Text strong style={{ color: '#fa8c16' }}>Cookies marketing</Text>
                <br />
                <Text type="secondary">Quảng cáo cá nhân hóa</Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Contact for Privacy */}
        <Card style={{ marginTop: '30px', background: '#f0f5ff' }}>
          <Title level={3} style={{ color: '#1890ff', textAlign: 'center' }}>
            Liên hệ về vấn đề bảo mật
          </Title>
          <Row gutter={[24, 24]} justify="center" style={{ textAlign: 'center' }}>
            <Col xs={24} sm={8}>
              <SafetyOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <br />
              <Text strong>Email bảo mật:</Text><br />
              <Text style={{ fontSize: '16px', color: '#1890ff' }}>privacy@fashionstore.com</Text><br />
              <Text type="secondary">(Phản hồi trong 24h)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <LockOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <br />
              <Text strong>Hotline bảo mật:</Text><br />
              <Text style={{ fontSize: '18px', color: '#1890ff' }}>1900 xxxx</Text><br />
              <Text type="secondary">(8h00 - 17h00, T2-T6)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <UserOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <br />
              <Text strong>Trực tiếp:</Text><br />
              <Text style={{ fontSize: '16px', color: '#1890ff' }}>123 Đường ABC, Q1</Text><br />
              <Text style={{ fontSize: '16px', color: '#1890ff' }}>TP.HaNoi</Text>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;