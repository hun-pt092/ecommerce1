import React from 'react';
import { Card, Row, Col, Typography, Divider, Timeline, Statistic } from 'antd';
import { 
  TeamOutlined, 
  TrophyOutlined, 
  GlobalOutlined, 
  HeartOutlined,
  CheckCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  const { theme } = useTheme();

  return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        backgroundColor: theme.backgroundColor,
        minHeight: '100vh'
      }}>
        {/* Hero Section */}
        <Card style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', border: 'none' }}>
          <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
              Về Fashion Store
            </Title>
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '800px', margin: '0 auto' }}>
              Chúng tôi là điểm đến hàng đầu cho những ai đam mê thời trang, 
              mang đến những sản phẩm chất lượng cao với phong cách hiện đại và xu hướng mới nhất.
            </Paragraph>
          </div>
        </Card>

        {/* Company Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
          <Col xs={12} sm={6}>
            <Card style={{ 
              textAlign: 'center',
              background: theme.cardBackground,
              borderColor: theme.borderColor
            }}>
              <Statistic
                title={<span style={{ color: theme.textColor }}>Năm kinh nghiệm</span>}
                value={8}
                suffix="+"
                valueStyle={{ color: '#1890ff' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ 
              textAlign: 'center',
              background: theme.cardBackground,
              borderColor: theme.borderColor
            }}>
              <Statistic
                title={<span style={{ color: theme.textColor }}>Khách hàng hài lòng</span>}
                value={50000}
                suffix="+"
                valueStyle={{ color: '#52c41a' }}
                prefix={<HeartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ 
              textAlign: 'center',
              background: theme.cardBackground,
              borderColor: theme.borderColor
            }}>
              <Statistic
                title={<span style={{ color: theme.textColor }}>Sản phẩm</span>}
                value={1000}
                suffix="+"
                valueStyle={{ color: '#722ed1' }}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ 
              textAlign: 'center',
              background: theme.cardBackground,
              borderColor: theme.borderColor
            }}>
              <Statistic
                title={<span style={{ color: theme.textColor }}>Thành phố</span>}
                value={63}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<GlobalOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Story Section */}
          <Col xs={24} lg={12}>
            <Card style={{
              background: theme.cardBackground,
              borderColor: theme.borderColor
            }}>
              <Title level={3} style={{ color: '#1890ff' }}>
                <TeamOutlined /> Câu chuyện của chúng tôi
              </Title>
              <Paragraph style={{ color: theme.textColor }}>
                Fashion Store được thành lập vào năm 2016 với sứ mệnh mang đến những sản phẩm thời trang 
                chất lượng cao, phù hợp với xu hướng hiện đại và phong cách cá nhân của từng khách hàng.
              </Paragraph>
              <Paragraph style={{ color: theme.textColor }}>
                Từ một cửa hàng nhỏ, chúng tôi đã phát triển thành một trong những thương hiệu thời trang 
                được yêu thích nhất tại Việt Nam, với hệ thống cửa hàng trải dài khắp 63 tỉnh thành.
              </Paragraph>
              <Paragraph style={{ color: theme.textColor }}>
                Chúng tôi không ngừng đổi mới và cải tiến để mang đến trải nghiệm mua sắm tuyệt vời nhất 
                cho khách hàng, từ chất lượng sản phẩm đến dịch vụ chăm sóc khách hàng.
              </Paragraph>
            </Card>
          </Col>

          {/* Mission & Vision */}
          <Col xs={24} lg={12}>
            <Card style={{
              background: theme.cardBackground,
              borderColor: theme.borderColor
            }}>
              <Title level={3} style={{ color: '#1890ff' }}>
                <TrophyOutlined /> Sứ mệnh & Tầm nhìn
              </Title>
              
              <Title level={4} style={{ color: '#52c41a' }}>Sứ mệnh</Title>
              <Paragraph style={{ color: theme.textColor }}>
                Mang đến những sản phẩm thời trang chất lượng cao, phù hợp với mọi phong cách và 
                ngân sách, giúp khách hàng thể hiện cá tính và tự tin trong mọi hoàn cảnh.
              </Paragraph>

              <Title level={4} style={{ color: '#722ed1' }}>Tầm nhìn</Title>
              <Paragraph style={{ color: theme.textColor }}>
                Trở thành thương hiệu thời trang hàng đầu Việt Nam, được khách hàng tin tưởng 
                và lựa chọn bởi chất lượng sản phẩm, dịch vụ xuất sắc và giá trị bền vững.
              </Paragraph>

              <Title level={4} style={{ color: '#fa8c16' }}>Giá trị cốt lõi</Title>
              <ul style={{ color: theme.textColor }}>
                <li><Text strong style={{ color: theme.textColor }}>Chất lượng:</Text> Cam kết về chất lượng sản phẩm và dịch vụ</li>
                <li><Text strong style={{ color: theme.textColor }}>Đổi mới:</Text> Luôn cập nhật xu hướng thời trang mới nhất</li>
                <li><Text strong style={{ color: theme.textColor }}>Khách hàng:</Text> Đặt khách hàng làm trung tâm mọi hoạt động</li>
                <li><Text strong style={{ color: theme.textColor }}>Trách nhiệm:</Text> Cam kết với cộng đồng và môi trường</li>
              </ul>
            </Card>
          </Col>
        </Row>

        {/* Timeline */}
        <Card style={{ marginTop: '30px',}}>
          <Title level={3} style={{ color: '#1890ff', textAlign: 'center' }}>
            Hành trình phát triển
          </Title>
          <Timeline mode="alternate" style={{ marginTop: '30px' }}>
            <Timeline.Item color="blue" dot={<CheckCircleOutlined />}>
              <Title level={5} >2016 - Khởi đầu</Title>
              <Paragraph >Thành lập cửa hàng đầu tiên tại TP.HaNoi với 50 sản phẩm</Paragraph>
            </Timeline.Item>
            <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
              <Title level={5} >2018 - Mở rộng</Title>
              <Paragraph >Khai trương 10 cửa hàng tại các tỉnh thành lớn</Paragraph>
            </Timeline.Item>
            <Timeline.Item color="purple" dot={<CheckCircleOutlined />}>
              <Title level={5}>2020 - Chuyển đổi số</Title>
              <Paragraph >Ra mắt website và ứng dụng mobile, phát triển mạnh online</Paragraph>
            </Timeline.Item>
            <Timeline.Item color="orange" dot={<CheckCircleOutlined />}>
              <Title level={5} >2022 - Đối tác quốc tế</Title>
              <Paragraph>Hợp tác với các thương hiệu thời trang quốc tế hàng đầu</Paragraph>
            </Timeline.Item>
            <Timeline.Item color="red" dot={<StarOutlined />}>
              <Title level={5} >2025 - Tương lai</Title>
              <Paragraph >Mục tiêu trở thành nền tảng thời trang số 1 Việt Nam</Paragraph>
            </Timeline.Item>
          </Timeline>
        </Card>

        {/* Contact Info */}
        <Card style={{ 
          marginTop: '30px', 
          textAlign: 'center', 
          background: theme.backgroundColor === '#001529' ? '#162312' : '#f6ffed',
          borderColor: theme.borderColor
        }}>
          <Title level={3} style={{ color: '#52c41a' }}>
            Liên hệ với chúng tôi
          </Title>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={8}>
              <Text strong >Địa chỉ:</Text><br />
              <Text >123 Đường ABC, Quận 1<br />
              TP. Hà Nội</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text strong >Hotline:</Text><br />
              <Text>(028) 1234 5678<br />
              1900 xxxx (miễn phí)</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text strong >Email:</Text><br />
              <Text >contact@fashionstore.com<br />
              support@fashionstore.com</Text>
            </Col>
          </Row>
        </Card>
      </div>
  );
};

export default AboutPage;