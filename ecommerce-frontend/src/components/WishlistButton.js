import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

const WishlistButton = ({ productId, className = "", size = "large", showText = false, style = {} }) => {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkWishlistStatus();
    }, [productId]);

    const checkWishlistStatus = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`http://localhost:8000/api/wishlist/check/${productId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsInWishlist(data.is_in_wishlist);
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    };

    const toggleWishlist = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            if (isInWishlist) {
                // Remove from wishlist
                const response = await fetch(`http://localhost:8000/api/wishlist/${productId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    setIsInWishlist(false);
                }
            } else {
                // Add to wishlist
                const response = await fetch('http://localhost:8000/api/wishlist/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        product_id: productId
                    })
                });

                if (response.ok) {
                    setIsInWishlist(true);
                } else if (response.status === 400) {
                    const errorData = await response.json();
                    if (errorData.error === "Product already in wishlist") {
                        setIsInWishlist(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip title={isInWishlist ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}>
            <Button
                size={size}
                onClick={toggleWishlist}
                loading={loading}
                style={{
                    color: isInWishlist ? '#ff4d4f' : '#8c8c8c',
                    borderColor: isInWishlist ? '#ff4d4f' : '#d9d9d9',
                    backgroundColor: isInWishlist ? 'rgba(255, 77, 79, 0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...style
                }}
                className={className}
                icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
            >
                {showText && (isInWishlist ? 'Đã thích' : 'Thích')}
            </Button>
        </Tooltip>
    );
};

export default WishlistButton;