import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReviewForm = ({ productId, onReviewSubmitted, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const submitReview = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/reviews/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: productId,
                    rating: rating,
                    comment: comment.trim()
                })
            });

            if (response.ok) {
                const reviewData = await response.json();
                if (onReviewSubmitted) {
                    onReviewSubmitted(reviewData);
                }
                setRating(5);
                setComment('');
                alert('Đánh giá đã được gửi thành công!');
            } else {
                const errorData = await response.json();
                if (response.status === 400) {
                    if (errorData.non_field_errors) {
                        setError(errorData.non_field_errors[0]);
                    } else {
                        setError(errorData.error || 'Có lỗi xảy ra khi gửi đánh giá');
                    }
                } else if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate('/login');
                } else {
                    setError('Có lỗi xảy ra khi gửi đánh giá');
                }
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setError('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Đánh giá sản phẩm</h3>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={submitReview}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đánh giá của bạn *
                    </label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition duration-200`}
                            >
                                ★
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                            ({rating} sao)
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang gửi...
                            </div>
                        ) : (
                            'Gửi đánh giá'
                        )}
                    </button>
                    
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;