import React, { useState, useEffect } from 'react';

const ReviewList = ({ productId, refresh }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchReviews();
        fetchProductStats();
    }, [productId, refresh]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/products/${productId}/reviews/`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.results || data);
            } else {
                setError('Không thể tải đánh giá');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Lỗi khi tải đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductStats = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/products/${productId}/stats/`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching product stats:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Đang tải đánh giá...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            {stats && (
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Tổng quan đánh giá</h3>
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{stats.average_rating}</div>
                            <div className="flex justify-center mt-1">
                                {renderStars(Math.round(stats.average_rating))}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {stats.total_reviews} đánh giá
                            </p>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center space-x-2 text-sm">
                                    <span className="w-8">{star} ★</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{
                                                width: `${stats.total_reviews > 0 
                                                    ? (stats.rating_breakdown[`star_${star}`] / stats.total_reviews) * 100 
                                                    : 0}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-right">
                                        {stats.rating_breakdown[`star_${star}`]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    Đánh giá từ khách hàng ({reviews.length})
                </h3>
                
                {reviews.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Hãy là người đầu tiên đánh giá sản phẩm này!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {review.user_first_name ? review.user_first_name.charAt(0).toUpperCase() : review.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {review.user_first_name && review.user_last_name 
                                                    ? `${review.user_first_name} ${review.user_last_name}`
                                                    : review.user_name
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(review.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                
                                {review.comment && (
                                    <div className="mt-3">
                                        <p className="text-gray-700 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;