import React, { useState } from 'react';
import { Form, Rate, Input, Button, Alert, message } from 'antd';
import { StarFilled, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../api/AuthAxios';

const { TextArea } = Input;

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            message.warning('Vui lòng đăng nhập để đánh giá sản phẩm');
            navigate('/login');
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        try {
            await authAxios.post('/reviews/create/', {
                product: productId,
                rating: values.rating,
                comment: values.comment?.trim() || ''
            });

            message.success('Đánh giá của bạn đã được gửi thành công!');
            form.resetFields();
            setErrorMessage(null);
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (error) {
            console.error('Review error:', error.response?.data);
            
            if (error.response?.status === 400) {
                // Lấy error message từ backend
                const backendError = error.response?.data?.non_field_errors?.[0] 
                    || error.response?.data?.error
                    || error.response?.data?.detail;
                
                if (backendError && backendError.includes('purchased')) {
                    setErrorMessage('⚠️ Bạn chỉ có thể đánh giá sản phẩm đã mua và được giao thành công. Vui lòng hoàn thành đơn hàng trước khi đánh giá.');
                } else {
                    setErrorMessage(backendError || 'Bạn đã đánh giá sản phẩm này rồi!');
                }
                message.error(backendError || 'Không thể gửi đánh giá');
            } else if (error.response?.status === 401) {
                message.warning('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
                localStorage.removeItem('access_token');
                navigate('/login');
            } else {
                setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại sau');
                message.error('Có lỗi xảy ra. Vui lòng thử lại sau');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            background: '#fafafa', 
            padding: '24px', 
            borderRadius: '12px',
            border: '1px solid #f0f0f0'
        }}>
            <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                marginBottom: '20px',
                color: '#262626'
            }}>
                <StarFilled style={{ color: '#fadb14', marginRight: '8px' }} />
                Viết đánh giá của bạn
            </h3>
            
            {errorMessage && (
                <Alert
                    message="Không thể gửi đánh giá"
                    description={errorMessage}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setErrorMessage(null)}
                    style={{ marginBottom: '20px' }}
                />
            )}
            
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{ rating: 5 }}
            >
                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Đánh giá của bạn</span>}
                    name="rating"
                    rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
                >
                    <Rate 
                        style={{ fontSize: '32px' }}
                        character={<StarFilled />}
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Nhận xét</span>}
                    name="comment"
                >
                    <TextArea
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        maxLength={500}
                        showCount
                        style={{ borderRadius: '8px' }}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SendOutlined />}
                        size="large"
                        style={{ 
                            borderRadius: '8px',
                            fontWeight: 500
                        }}
                    >
                        Gửi đánh giá
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ReviewForm;