import React from 'react';
import { Card, Row, Col, Typography, Alert, Collapse, Divider, List } from 'antd';
import { 
  FileTextOutlined, 
  UserOutlined, 
  ShoppingOutlined,
  LockOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const TermsOfServicePage = () => {
  const userResponsibilities = [
    'Cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản',
    'Bảo mật thông tin tài khoản và không chia sẻ với người khác',
    'Sử dụng website một cách hợp pháp và không vi phạm quy định',
    'Không sử dụng website để thực hiện các hành vi bất hợp pháp',
    'Tuân thủ các quy định về thanh toán và nhận hàng',
    'Thông báo kịp thời cho PKA Shop về mọi vấn đề phát sinh'
  ];

  const prohibitedActivities = [
    'Hack, phá hoại hệ thống hoặc can thiệp vào hoạt động của website',
    'Sử dụng robot, bot hoặc các công cụ tự động không được phép',
    'Tạo tài khoản giả mạo hoặc cung cấp thông tin sai lệch',
    'Spam, gửi thông tin quảng cáo không mong muốn',
    'Vi phạm bản quyền, sở hữu trí tuệ của PKA Shop hoặc bên thứ ba',
    'Sử dụng website cho mục đích thương mại mà không được phép'
  ];

  return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <Card style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #fa8c16 0%, #f5222d 100%)', border: 'none' }}>
          <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
              <FileTextOutlined /> Điều khoản sử dụng
            </Title>
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '800px', margin: '0 auto' }}>
              Vui lòng đọc kỹ các điều khoản và điều kiện sử dụng dịch vụ của PKA Shop. 
              Việc sử dụng website đồng nghĩa với việc bạn đồng ý với các điều khoản này.
            </Paragraph>
          </div>
        </Card>

        {/* Important Notice */}
        <Alert
          message={
            <>
              <ClockCircleOutlined /> Có hiệu lực từ ngày 01/01/2025
            </>
          }
          description="Các điều khoản này có thể được cập nhật theo thời gian. Chúng tôi sẽ thông báo trước mọi thay đổi quan trọng."
          type="warning"
          showIcon
          style={{ marginBottom: '30px' }}
        />

        {/* General Terms */}
        <Card style={{ marginBottom: '30px' }}>
          <Title level={3} style={{ color: '#fa8c16' }}>
            <InfoCircleOutlined /> Điều khoản chung
          </Title>
          
          <Collapse defaultActiveKey={['1']} ghost>
            <Panel header="📋 Định nghĩa và giải thích" key="1">
              <ul>
                <li><Text strong>"PKA Shop"</Text> là trang thương mại điện tử được vận hành bởi Công ty PKA Shop</li>
                <li><Text strong>"Người dùng"/"Khách hàng"</Text> là cá nhân hoặc tổ chức sử dụng dịch vụ của chúng tôi</li>
                <li><Text strong>"Dịch vụ"</Text> bao gồm website, ứng dụng mobile và các dịch vụ liên quan</li>
                <li><Text strong>"Sản phẩm"</Text> là các mặt hàng thời trang được bán trên website</li>
                <li><Text strong>"Đơn hàng"</Text> là yêu cầu mua hàng được khách hàng gửi đến PKA Shop</li>
              </ul>
            </Panel>
            
            <Panel header="✅ Chấp nhận điều khoản" key="2">
              <Paragraph>
                Bằng việc truy cập và sử dụng website PKA Shop, bạn xác nhận rằng:
              </Paragraph>
              <ul>
                <li>Bạn đã đọc, hiểu và đồng ý tuân thủ các điều khoản này</li>
                <li>Bạn có đủ năng lực hành vi dân sự theo pháp luật Việt Nam</li>
                <li>Bạn cam kết sử dụng dịch vụ một cách hợp pháp và có trách nhiệm</li>
                <li>Bạn đồng ý nhận thông báo từ PKA Shop qua email hoặc SMS</li>
              </ul>
            </Panel>
          </Collapse>
        </Card>

        {/* Account Terms */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ color: '#fa8c16' }}>
                <UserOutlined /> Tài khoản người dùng
              </Title>
              
              <Title level={4} style={{ color: '#52c41a' }}>Đăng ký tài khoản:</Title>
              <ul>
                <li>Cung cấp thông tin chính xác và đầy đủ</li>
                <li>Xác thực email và số điện thoại</li>
                <li>Chọn mật khẩu mạnh và bảo mật</li>
                <li>Chịu trách nhiệm về mọi hoạt động trong tài khoản</li>
              </ul>

              <Title level={4} style={{ color: '#1890ff' }}>Quyền của người dùng:</Title>
              <ul>
                <li>Truy cập và sử dụng các tính năng của website</li>
                <li>Mua sắm và thanh toán trực tuyến</li>
                <li>Nhận hỗ trợ khách hàng</li>
                <li>Cập nhật thông tin cá nhân bất cứ lúc nào</li>
              </ul>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ color: '#fa8c16' }}>
                <ShoppingOutlined /> Quy định mua hàng
              </Title>
              
              <Title level={4} style={{ color: '#722ed1' }}>Quy trình đặt hàng:</Title>
              <ol>
                <li>Chọn sản phẩm và thêm vào giỏ hàng</li>
                <li>Kiểm tra thông tin và tiến hành thanh toán</li>
                <li>Nhận xác nhận đơn hàng qua email/SMS</li>
                <li>Theo dõi tình trạng đơn hàng</li>
                <li>Nhận hàng và xác nhận hoàn tất</li>
              </ol>

              <Title level={4} style={{ color: '#eb2f96' }}>Giá cả và thanh toán:</Title>
              <ul>
                <li>Giá sản phẩm đã bao gồm VAT</li>
                <li>Phí vận chuyển được tính riêng</li>
                <li>Hỗ trợ nhiều hình thức thanh toán</li>
                <li>Đơn hàng được xác nhận sau khi thanh toán</li>
              </ul>
            </Card>
          </Col>
        </Row>

        {/* User Responsibilities */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#fa8c16' }}>
            <CheckCircleOutlined /> Trách nhiệm của người dùng
          </Title>
          
          <List
            header={<Text strong>Bạn có trách nhiệm:</Text>}
            bordered
            dataSource={userResponsibilities}
            renderItem={(item, index) => (
              <List.Item>
                <Text>
                  <span style={{ color: '#52c41a', marginRight: '8px' }}>
                    {index + 1}.
                  </span>
                  {item}
                </Text>
              </List.Item>
            )}
          />
        </Card>

        {/* Prohibited Activities */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#fa8c16' }}>
            <CloseCircleOutlined /> Hành vi bị cấm
          </Title>
          
          <List
            header={<Text strong style={{ color: '#f5222d' }}>Các hành vi sau đây bị nghiêm cấm:</Text>}
            bordered
            dataSource={prohibitedActivities}
            renderItem={(item, index) => (
              <List.Item>
                <Text>
                  
                  {item}
                </Text>
              </List.Item>
            )}
          />
          
          <Alert
            message="Hậu quả vi phạm"
            description="Việc vi phạm các quy định trên có thể dẫn đến việc tạm khóa hoặc xóa vĩnh viễn tài khoản, đồng thời PKA Shop có quyền khởi kiện pháp lý nếu cần thiết."
            type="error"
            showIcon
            style={{ marginTop: '16px' }}
          />
        </Card>

        {/* Intellectual Property */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#fa8c16' }}>
            <LockOutlined /> Sở hữu trí tuệ
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Title level={4} style={{ color: '#1890ff' }}>Quyền sở hữu của PKA Shop:</Title>
              <ul>
                <li>Logo, tên thương hiệu và nhận diện thương hiệu</li>
                <li>Thiết kế, giao diện và trải nghiệm người dùng</li>
                <li>Nội dung, hình ảnh và mô tả sản phẩm</li>
                <li>Mã nguồn, công nghệ và thuật toán</li>
                <li>Các tài liệu hướng dẫn và marketing</li>
              </ul>
            </Col>
            
            <Col xs={24} md={12}>
              <Title level={4} style={{ color: '#52c41a' }}>Quyền của khách hàng:</Title>
              <ul>
                <li>Sử dụng website cho mục đích mua sắm cá nhân</li>
                <li>Tải và in thông tin sản phẩm để tham khảo</li>
                <li>Chia sẻ link sản phẩm trên mạng xã hội</li>
                <li>Viết đánh giá và phản hồi về sản phẩm</li>
              </ul>
              
              <Alert
                message="Lưu ý"
                description="Không được sao chép, phân phối hoặc sử dụng nội dung của PKA Shop cho mục đích thương mại mà không có sự đồng ý bằng văn bản."
                type="warning"
                showIcon
              />
            </Col>
          </Row>
        </Card>

        {/* Limitation of Liability */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#fa8c16' }}>
            <WarningOutlined /> Giới hạn trách nhiệm
          </Title>
          
          <Collapse ghost>
            <Panel header="⚠️ Trách nhiệm của PKA Shop" key="1">
              <Paragraph><Text strong>Chúng tôi cam kết:</Text></Paragraph>
              <ul>
                <li>Cung cấp sản phẩm chất lượng như mô tả</li>
                <li>Giao hàng đúng hạn trong điều kiện bình thường</li>
                <li>Bảo mật thông tin khách hàng</li>
                <li>Hỗ trợ khách hàng một cách tận tình</li>
              </ul>
              
              <Paragraph><Text strong>Chúng tôi không chịu trách nhiệm về:</Text></Paragraph>
              <ul>
                <li>Thiệt hại gián tiếp do gián đoạn dịch vụ</li>
                <li>Sự cố do thiên tai, dịch bệnh hoặc bất khả kháng</li>
                <li>Lỗi do nhà cung cấp dịch vụ thứ ba</li>
                <li>Sử dụng sai mục đích hoặc không tuân thủ hướng dẫn</li>
              </ul>
            </Panel>
            
            <Panel header="🔧 Thay đổi dịch vụ" key="2">
              <Paragraph>
                PKA Shop có quyền thay đổi, tạm ngưng hoặc chấm dứt dịch vụ 
                với thông báo trước hợp lý. Chúng tôi sẽ cố gắng giảm thiểu 
                tác động đến khách hàng.
              </Paragraph>
            </Panel>
          </Collapse>
        </Card>

        {/* Dispute Resolution */}
        <Card style={{ marginTop: '30px' }}>
          <Title level={3} style={{ color: '#fa8c16' }}>
            ⚖️ Giải quyết tranh chấp
          </Title>
          
          <Paragraph>
            Mọi tranh chấp phát sinh sẽ được giải quyết theo thứ tự ưu tiên:
          </Paragraph>
          
          <ol>
            <li><Text strong>Thương lượng trực tiếp:</Text> Liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ</li>
            <li><Text strong>Hòa giải:</Text> Sử dụng dịch vụ hòa giải của cơ quan có thẩm quyền</li>
            <li><Text strong>Tòa án:</Text> Giải quyết tại Tòa án có thẩm quyền tại TP. Hà Nội</li>
          </ol>
          
          <Alert
            message="Luật áp dụng"
            description="Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam và tuân thủ các quy định về thương mại điện tử."
            type="info"
            showIcon
          />
        </Card>

        {/* Contact Information */}
        <Card style={{ marginTop: '30px', background: '#fff7e6' }}>
          <Title level={3} style={{ color: '#fa8c16', textAlign: 'center' }}>
            Liên hệ về điều khoản sử dụng
          </Title>
          <Row gutter={[24, 24]} justify="center" style={{ textAlign: 'center' }}>
            <Col xs={24} sm={8}>
              <FileTextOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
              <br />
              <Text strong>Email pháp lý:</Text><br />
              <Text style={{ fontSize: '16px', color: '#fa8c16' }}>legal@fashionstore.com</Text><br />
              <Text type="secondary">(Phản hồi trong 48h)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <UserOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
              <br />
              <Text strong>Hotline hỗ trợ:</Text><br />
              <Text style={{ fontSize: '18px', color: '#fa8c16' }}>1900 xxxx</Text><br />
              <Text type="secondary">(8h00 - 17h00, T2-T6)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <InfoCircleOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
              <br />
              <Text strong>Địa chỉ:</Text><br />
              <Text style={{ fontSize: '16px', color: '#fa8c16' }}>123 Đường ABC, Q1</Text><br />
              <Text style={{ fontSize: '16px', color: '#fa8c16' }}>TP. Hà Nội</Text>
            </Col>
          </Row>
        </Card>
      </div>
  );
};

export default TermsOfServicePage;