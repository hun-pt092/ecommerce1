import React, { useState, useEffect } from 'react';
import { List, Avatar, Rate, Progress, Row, Col, Card, Typography, Empty, Spin, Divider } from 'antd';
import { UserOutlined, StarFilled } from '@ant-design/icons';
import apiClient from '../api/apiClient';

const { Title, Text, Paragraph } = Typography;

const ReviewList = ({ productId, refresh, onReviewsLoaded }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchData();
    }, [productId, refresh]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                apiClient.get(`products/${productId}/reviews/`),
                apiClient.get(`products/${productId}/stats/`)
            ]);
            
            const reviewsData = reviewsRes.data.results || reviewsRes.data || [];
            setReviews(reviewsData);
            setStats(statsRes.data);
            
            // Truyền tổng số reviews về parent component
            if (onReviewsLoaded && statsRes.data) {
                onReviewsLoaded(statsRes.data.total_reviews || 0);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: '16px', color: '#8c8c8c' }}>Đang tải đánh giá...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Rating Summary Card */}
            {stats && stats.total_reviews > 0 && (
                <Card 
                    style={{ 
                        marginBottom: '32px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                    }}
                    bodyStyle={{ padding: '32px' }}
                >
                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                            <div style={{ 
                                background: 'rgba(255,255,255,0.95)', 
                                borderRadius: '16px', 
                                padding: '24px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ fontSize: '56px', fontWeight: 700, color: '#fadb14', lineHeight: 1 }}>
                                    {stats.average_rating.toFixed(1)}
                                </div>
                                <Rate 
                                    disabled 
                                    value={stats.average_rating} 
                                    style={{ fontSize: '24px', marginTop: '12px' }}
                                    character={<StarFilled />}
                                />
                                <Text style={{ 
                                    display: 'block', 
                                    marginTop: '12px', 
                                    fontSize: '15px',
                                    color: '#595959'
                                }}>
                                    {stats.total_reviews} đánh giá
                                </Text>
                            </div>
                        </Col>
                        
                        <Col xs={24} md={16}>
                            <div style={{ 
                                background: 'rgba(255,255,255,0.95)', 
                                borderRadius: '16px', 
                                padding: '24px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}>
                                <Title level={5} style={{ marginBottom: '16px', color: '#262626' }}>
                                    Phân bố đánh giá
                                </Title>
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = stats.rating_breakdown?.[`star_${star}`] || 0;
                                    const percent = stats.total_reviews > 0 
                                        ? (count / stats.total_reviews) * 100 
                                        : 0;
                                    
                                    return (
                                        <Row key={star} align="middle" gutter={12} style={{ marginBottom: '12px' }}>
                                            <Col span={3}>
                                                <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                                                    {star} <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                                                </Text>
                                            </Col>
                                            <Col span={17}>
                                                <Progress 
                                                    percent={percent} 
                                                    showInfo={false}
                                                    strokeColor={{
                                                        '0%': '#fadb14',
                                                        '100%': '#ffd666',
                                                    }}
                                                    trailColor="#f0f0f0"
                                                    strokeWidth={10}
                                                    style={{ margin: 0 }}
                                                />
                                            </Col>
                                            <Col span={4} style={{ textAlign: 'right' }}>
                                                <Text style={{ fontSize: '14px', color: '#595959' }}>
                                                    {count}
                                                </Text>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Reviews List */}
            <div>
                <Title level={4} style={{ marginBottom: '24px' }}>
                    <StarFilled style={{ color: '#fadb14', marginRight: '8px' }} />
                    Đánh giá từ khách hàng ({reviews.length})
                </Title>
                
                {reviews.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span>
                                <div style={{ fontSize: '16px', color: '#595959', marginBottom: '8px' }}>
                                    Chưa có đánh giá nào
                                </div>
                                <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                                    Hãy là người đầu tiên đánh giá sản phẩm này!
                                </div>
                            </span>
                        }
                        style={{ 
                            padding: '60px 20px',
                            background: '#fafafa',
                            borderRadius: '12px'
                        }}
                    />
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={reviews}
                        renderItem={(review) => (
                            <List.Item
                                style={{
                                    background: '#ffffff',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    border: '1px solid #f0f0f0',
                                    marginBottom: '16px'
                                }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar 
                                            size={48} 
                                            style={{ 
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                fontSize: '20px',
                                                fontWeight: 600
                                            }}
                                            icon={!review.user_first_name && <UserOutlined />}
                                        >
                                            {review.user_first_name 
                                                ? review.user_first_name.charAt(0).toUpperCase() 
                                                : review.user_name.charAt(0).toUpperCase()
                                            }
                                        </Avatar>
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                                                    {review.user_first_name && review.user_last_name 
                                                        ? `${review.user_first_name} ${review.user_last_name}`
                                                        : review.user_name
                                                    }
                                                </Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Rate 
                                                        disabled 
                                                        value={review.rating} 
                                                        style={{ fontSize: '16px' }}
                                                        character={<StarFilled />}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    description={
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            {formatDate(review.created_at)}
                                        </Text>
                                    }
                                />
                                {review.comment && (
                                    <Paragraph 
                                        style={{ 
                                            marginTop: '16px',
                                            marginLeft: '64px',
                                            fontSize: '15px',
                                            lineHeight: '1.7',
                                            color: '#595959',
                                            marginBottom: 0
                                        }}
                                    >
                                        {review.comment}
                                    </Paragraph>
                                )}
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default ReviewList;