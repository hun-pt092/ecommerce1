import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Rate, Button, Empty, Spin, Alert, Space, Typography, Tag, Avatar, Divider, Row, Col, Image } from 'antd';
import { StarFilled, DeleteOutlined, EyeOutlined, ShoppingOutlined, HeartOutlined, EditOutlined } from '@ant-design/icons';
import '../App.css';

const { Title, Text, Paragraph } = Typography;

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyReviews();
    }, []);

    const fetchMyReviews = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:8000/api/reviews/my-reviews/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReviews(data.results || data);
            } else if (response.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/login');
            } else {
                setError('Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Error loading reviews');
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này không?')) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setReviews(reviews.filter(review => review.id !== reviewId));
                alert('Đánh giá đã được xóa');
            } else {
                alert('Có lỗi xảy ra khi xóa đánh giá');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Có lỗi xảy ra khi xóa đánh giá');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ 
                minHeight: 'calc(100vh - 200px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Spin size="large" tip="Đang tải đánh giá của bạn..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: 'calc(100vh - 200px)',
            background: 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)'
        }}>
            {/* Header Section with Gradient */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '48px 24px',
                marginBottom: '32px',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Space align="center" size="large">
                        <Avatar 
                            size={64} 
                            style={{ 
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)'
                            }}
                            icon={<StarFilled style={{ fontSize: '32px', color: '#fff' }} />}
                        />
                        <div>
                            <Title level={2} style={{ color: '#fff', margin: 0, marginBottom: '8px' }}>
                                Đánh giá của tôi
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                                <HeartOutlined /> {reviews.length} đánh giá đã chia sẻ
                            </Text>
                        </div>
                    </Space>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 48px' }}>
                {reviews.length === 0 ? (
                    <Card
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                            border: 'none'
                        }}
                    >
                        <Empty
                            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                            imageStyle={{
                                height: 180,
                            }}
                            description={
                                <div style={{ marginTop: '24px' }}>
                                    <Title level={4} style={{ color: '#8c8c8c', marginBottom: '8px' }}>
                                        Bạn chưa có đánh giá nào
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '15px' }}>
                                        Mua sắm và đánh giá sản phẩm để chia sẻ trải nghiệm của bạn
                                    </Text>
                                </div>
                            }
                        >
                            <Button 
                                type="primary" 
                                size="large"
                                icon={<ShoppingOutlined />}
                                onClick={() => navigate('/')}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    height: '48px',
                                    padding: '0 32px',
                                    fontSize: '16px',
                                    borderRadius: '24px',
                                    marginTop: '16px'
                                }}
                            >
                                Khám phá sản phẩm
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <Row gutter={[16, 16]}>
                        {reviews.map((review) => (
                            <Col xs={24} key={review.id}>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: '16px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        border: '1px solid #f0f0f0',
                                        transition: 'all 0.3s ease'
                                    }}
                                    bodyStyle={{ padding: '24px' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Row gutter={24} align="top">
                                        {/* Product Image */}
                                        <Col>
                                            <div 
                                                style={{ 
                                                    cursor: 'pointer',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                                }}
                                                onClick={() => navigate(`/products/${review.product}`)}
                                            >
                                                <Image
                                                    width={120}
                                                    height={120}
                                                    src={review.product_image || 'https://via.placeholder.com/120'}
                                                    alt={review.product_name}
                                                    style={{ objectFit: 'cover' }}
                                                    preview={false}
                                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg"
                                                />
                                            </div>
                                        </Col>
                                        
                                        <Col flex="auto">
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                <div>
                                                    <Text 
                                                        strong 
                                                        style={{ 
                                                            fontSize: '18px',
                                                            color: '#262626',
                                                            cursor: 'pointer',
                                                            transition: 'color 0.2s'
                                                        }}
                                                        onClick={() => navigate(`/products/${review.product}`)}
                                                        onMouseEnter={(e) => e.target.style.color = '#667eea'}
                                                        onMouseLeave={(e) => e.target.style.color = '#262626'}
                                                    >
                                                        {review.product_name}
                                                    </Text>
                                                </div>
                                                
                                                <Space size="middle">
                                                    <Rate disabled value={review.rating} style={{ fontSize: '16px' }} />
                                                    <Tag color="blue">{review.rating} sao</Tag>
                                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                                        {formatDate(review.created_at)}
                                                    </Text>
                                                </Space>

                                                {review.comment && (
                                                    <Card
                                                        size="small"
                                                        style={{
                                                            marginTop: '12px',
                                                            background: 'linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%)',
                                                            border: '1px solid #e8e8e8',
                                                            borderRadius: '12px'
                                                        }}
                                                        bodyStyle={{ padding: '16px' }}
                                                    >
                                                        <Paragraph 
                                                            style={{ 
                                                                margin: 0,
                                                                color: '#595959',
                                                                fontSize: '15px',
                                                                lineHeight: '1.6'
                                                            }}
                                                        >
                                                            "{review.comment}"
                                                        </Paragraph>
                                                    </Card>
                                                )}
                                            </Space>
                                        </Col>
                                        
                                        <Col>
                                            <Space direction="vertical" size="small">
                                                <Button
                                                    type="primary"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => navigate(`/products/${review.product}`)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        width: '140px'
                                                    }}
                                                >
                                                    Xem sản phẩm
                                                </Button>
                                                <Button
                                                    icon={<EditOutlined />}
                                                    onClick={() => navigate(`/products/${review.product}`)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        width: '140px',
                                                        borderColor: '#667eea',
                                                        color: '#667eea'
                                                    }}
                                                >
                                                    Sửa đánh giá
                                                </Button>
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => deleteReview(review.id)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        width: '140px'
                                                    }}
                                                >
                                                    Xóa đánh giá
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default MyReviewsPage;