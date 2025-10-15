import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

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
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2">Đang tải đánh giá của bạn...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Đánh giá của tôi</h1>
                <span className="text-gray-600">
                    {reviews.length} đánh giá
                </span>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Bạn chưa có đánh giá nào
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Mua sắm và đánh giá sản phẩm để chia sẻ trải nghiệm của bạn
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Khám phá sản phẩm
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 
                                        className="text-lg font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition duration-200"
                                        onClick={() => navigate(`/products/${review.product}`)}
                                    >
                                        {review.product_name}
                                    </h3>
                                    <div className="flex items-center space-x-4 mb-2">
                                        {renderStars(review.rating)}
                                        <span className="text-sm text-gray-500">
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/products/${review.product}`)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Xem sản phẩm
                                    </button>
                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                            
                            {review.comment && (
                                <div className="bg-gray-50 p-4 rounded-lg">
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
    );
};

export default MyReviewsPage;