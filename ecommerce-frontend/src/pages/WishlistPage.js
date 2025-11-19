import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Typography, Space, Image, Badge, message, Tag, Spin } from 'antd';
import { EyeOutlined, ShoppingCartOutlined, DeleteOutlined, HeartFilled, StarFilled, ShoppingOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import '../App.css';

const { Title, Text } = Typography;

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:8000${imagePath}`;
    };

    // Get main product image - check multiple sources
    const getProductImage = (item) => {
        // Priority 1: product_main_image from API
        if (item.product_main_image) {
            return getImageUrl(item.product_main_image);
        }
        
        // Priority 2: product.images array (get first is_main=true)
        if (item.product?.images && item.product.images.length > 0) {
            const mainImage = item.product.images.find(img => img.is_main);
            if (mainImage?.image) {
                return getImageUrl(mainImage.image);
            }
            // Fallback to first image
            if (item.product.images[0]?.image) {
                return getImageUrl(item.product.images[0].image);
            }
        }
        
        // Priority 3: product.main_image
        if (item.product?.main_image) {
            return getImageUrl(item.product.main_image);
        }
        
        return null;
    };

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:8000/api/wishlist/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Wishlist data:', data); // Debug log
                setWishlist(data);
            } else if (response.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/login');
            } else {
                setError('Failed to fetch wishlist');
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setError('Error loading wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/wishlist/${productId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setWishlist(wishlist.filter(item => item.product.id !== productId));
                message.success('Đã xóa khỏi danh sách yêu thích!');
            } else {
                message.error('Có lỗi khi xóa sản phẩm khỏi wishlist');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            message.error('Có lỗi khi xóa sản phẩm');
        }
    };

    const addToCart = async (product) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Lấy variant đầu tiên của sản phẩm
            const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
            if (!firstVariant) {
                alert('Sản phẩm này hiện tại không có sẵn');
                return;
            }

            const response = await fetch('http://localhost:8000/api/cart/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_variant_id: firstVariant.id,
                    quantity: 1
                })
            });

            if (response.ok) {
                message.success('Đã thêm vào giỏ hàng!');
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            message.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                background: theme.backgroundColor 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: theme.backgroundColor, 
            padding: '24px',
            color: theme.textColor 
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '32px' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <HeartFilled style={{ fontSize: '32px', color: '#f5222d' }} />
                        <div>
                            <Title level={2} style={{ margin: 0, color: theme.textColor }}>
                                Sản phẩm yêu thích
                            </Title>
                            <Text style={{ color: theme.secondaryText }}>
                                Danh sách các sản phẩm bạn đã yêu thích
                            </Text>
                        </div>
                    </div>
                    <div style={{ 
                        padding: '8px 16px', 
                        background: theme.cardBackground, 
                        borderRadius: '8px',
                        border: `1px solid ${theme.borderColor}`
                    }}>
                        <Text strong style={{ color: theme.textColor }}>
                            {wishlist.length} sản phẩm
                        </Text>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '80px 20px',
                        background: theme.cardBackground,
                        borderRadius: '16px',
                        border: `1px solid ${theme.borderColor}`
                    }}>
                        <div style={{ fontSize: '80px', marginBottom: '24px' }}>
                            💔
                        </div>
                        <Title level={3} style={{ color: theme.textColor, marginBottom: '16px' }}>
                            Danh sách yêu thích trống
                        </Title>
                        <Text style={{ fontSize: '16px', color: theme.secondaryText, marginBottom: '32px', display: 'block' }}>
                            Bạn chưa có sản phẩm nào trong danh sách yêu thích
                        </Text>
                        <Button 
                            type="primary" 
                            size="large"
                            onClick={() => navigate('/')}
                            style={{ 
                                borderRadius: '8px',
                                height: '48px',
                                paddingLeft: '32px',
                                paddingRight: '32px'
                            }}
                        >
                            Khám phá sản phẩm
                        </Button>
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {wishlist.map((item) => (
                            <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Card
                                    hoverable
                                    style={{ 
                                        height: '100%',
                                        background: theme.cardBackground,
                                        borderColor: theme.borderColor,
                                        borderRadius: '12px',
                                        overflow: 'hidden'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    cover={
                                        <div style={{ position: 'relative', height: '200px' }}>
                                            {getProductImage(item) ? (
                                                <Image
                                                    alt={item.product_name}
                                                    src={getProductImage(item)}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '200px', 
                                                        objectFit: 'cover',
                                                        cursor: 'pointer'
                                                    }}
                                                    preview={false}
                                                    onClick={() => navigate(`/products/${item.product.id}`)}
                                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN4BMghMgBBBIHcAFXQIbzaQy4wjEcQLfAAdwAJ3AAF8AJXAAJtFpNFhYEEjAlYGhFRNPm+e4zdvdDO46r7+v7Lr8N1f7yLrjCCEhwdgABelFiFKAU5SgwipKsXhQgTcELXAAE6X9fPjUwQU6RJCdNh1OkjFOkGWfXSA=="
                                                />
                                            ) : (
                                                <div 
                                                    onClick={() => navigate(`/products/${item.product.id}`)}
                                                    style={{ 
                                                        height: '200px', 
                                                        background: theme.mode === 'dark' 
                                                            ? 'linear-gradient(45deg, #2a2a2a, #3a3a3a)' 
                                                            : 'linear-gradient(45deg, #f0f2f5, #d9d9d9)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '48px',
                                                        color: theme.mode === 'dark' ? '#666' : '#bfbfbf',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    👕
                                                </div>
                                            )}
                                            
                                            {/* Remove button */}
                                            <Button
                                                type="primary"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeFromWishlist(item.product.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Xóa khỏi wishlist"
                                            />
                                        </div>
                                    }
                                    actions={[
                                        <Button 
                                            type="text" 
                                            icon={<EyeOutlined />}
                                            onClick={() => navigate(`/products/${item.product.id}`)}
                                            style={{ 
                                                color: theme.textColor,
                                                borderColor: 'transparent'
                                            }}
                                        >
                                            Chi tiết
                                        </Button>,
                                        <Button 
                                            type="primary" 
                                            icon={<ShoppingOutlined />}
                                            onClick={() => navigate(`/products/${item.product.id}`)}
                                            size="small"
                                        >
                                            Mua
                                        </Button>
                                    ]}
                                >
                                    <div style={{ height: '120px', display: 'flex', flexDirection: 'column' }}>
                                        <Title 
                                            level={5} 
                                            style={{ 
                                                margin: '0 0 12px 0',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                fontSize: '14px',
                                                lineHeight: '1.4',
                                                color: theme.textColor,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/products/${item.product.id}`)}
                                            title={item.product_name}
                                        >
                                            {item.product_name}
                                        </Title>
                                        
                                        {/* Rating */}
                                        <div style={{ marginBottom: '8px' }}>
                                            <Space size="small">
                                                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                    <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                                                    <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                                                    <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                                                    <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                                        <StarFilled style={{ 
                                                            color: theme.mode === 'dark' ? '#3a3a3a' : '#d9d9d9', 
                                                            fontSize: '12px' 
                                                        }} />
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '50%',
                                                            height: '100%',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <StarFilled style={{ color: '#fadb14', fontSize: '12px' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <Text style={{ fontSize: '12px', color: theme.secondaryText }}>4.5 (128)</Text>
                                            </Space>
                                        </div>
                                        
                                        {/* Price */}
                                        <div style={{ marginBottom: '8px', flex: 1 }}>
                                            {item.product_discount_price ? (
                                                <div>
                                                    <Text style={{ 
                                                        fontSize: '16px', 
                                                        fontWeight: 'bold', 
                                                        color: '#f5222d',
                                                        display: 'block'
                                                    }}>
                                                        {Number(item.product_discount_price).toLocaleString()}₫
                                                    </Text>
                                                    <Text delete style={{ fontSize: '12px', color: theme.secondaryText }}>
                                                        {Number(item.product_price).toLocaleString()}₫
                                                    </Text>
                                                </div>
                                            ) : (
                                                <Text style={{ 
                                                    fontSize: '16px', 
                                                    fontWeight: 'bold', 
                                                    color: theme.mode === 'dark' ? '#40a9ff' : '#1890ff'
                                                }}>
                                                    {Number(item.product_price).toLocaleString()}₫
                                                </Text>
                                            )}
                                        </div>
                                        
                                        {/* Category & Date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {item.product.category && (
                                                <Tag color="blue" size="small">
                                                    {item.product.category.name}
                                                </Tag>
                                            )}
                                            <Text style={{ fontSize: '11px', color: theme.secondaryText }}>
                                                {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;