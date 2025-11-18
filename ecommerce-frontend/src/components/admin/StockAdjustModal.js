import React, { useState } from 'react';
import { Modal, Form, InputNumber, Input, Radio, message } from 'antd';
import apiClient from '../../api/apiClient';

const StockAdjustModal = ({ visible, onCancel, variant, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [adjustType, setAdjustType] = useState('adjust');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let response;
      
      if (adjustType === 'adjust') {
        // NEW API: variant_id in URL path, not in body
        response = await apiClient.post(`/admin/stock/variants/${variant.id}/adjust/`, {
          new_quantity: values.new_quantity,
          reason: values.reason || ''
        });
      } else {
        // NEW API: variant_id in URL path, not in body
        response = await apiClient.post(`/admin/stock/variants/${variant.id}/damaged/`, {
          quantity: values.damaged_quantity,
          reason: values.reason || ''
        });
      }

      message.success(response.data.message || 'Cập nhật thành công!');
      form.resetFields();
      if (onSuccess) onSuccess(response.data);
      onCancel();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Cập nhật thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="⚙️ Điều chỉnh tồn kho"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy"
      width={600}
    >
      {variant && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: '#f0f2f5', 
          borderRadius: 8,
          border: '1px solid #d9d9d9'
        }}>
          <div><strong>Sản phẩm:</strong> {variant.product_name || variant.product?.name}</div>
          {variant.size && <div><strong>Size:</strong> {variant.size}</div>}
          {variant.color && <div><strong>Màu:</strong> {variant.color}</div>}
          <div><strong>SKU:</strong> {variant.sku}</div>
          <div><strong>Tồn kho hiện tại:</strong> {variant.stock_quantity || 0}</div>
        </div>
      )}

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        initialValues={{ adjust_type: 'adjust' }}
      >
        <Form.Item label="Loại điều chỉnh" name="adjust_type">
          <Radio.Group onChange={(e) => setAdjustType(e.target.value)} value={adjustType}>
            <Radio value="adjust">📊 Điều chỉnh số lượng</Radio>
            <Radio value="damaged">🔴 Hàng hỏng/mất</Radio>
          </Radio.Group>
        </Form.Item>

        {adjustType === 'adjust' ? (
          <Form.Item
            label="Số lượng mới"
            name="new_quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng mới!' },
              { type: 'number', min: 0, message: 'Số lượng phải >= 0!' }
            ]}
            extra={`Hiện tại: ${variant?.stock_quantity || 0}`}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Nhập số lượng sau điều chỉnh" 
              min={0}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label="Số lượng hàng hỏng/mất"
            name="damaged_quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, message: 'Số lượng phải > 0!' },
              { 
                type: 'number', 
                max: variant?.stock_quantity || 0, 
                message: `Không vượt quá ${variant?.stock_quantity || 0}!` 
              }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Nhập số lượng hàng hỏng" 
              min={1}
              max={variant?.stock_quantity || 0}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Lý do"
          name="reason"
          rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder={
              adjustType === 'adjust' 
                ? "VD: Kiểm kê định kỳ..." 
                : "VD: Hàng bị hư hỏng..."
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockAdjustModal;