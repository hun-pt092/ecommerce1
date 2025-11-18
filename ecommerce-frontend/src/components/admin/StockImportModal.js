import React, { useState } from 'react';
import { Modal, Form, InputNumber, Input, message } from 'antd';
import apiClient from '../../api/apiClient';

const StockImportModal = ({ visible, onCancel, variant, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // NEW API: variant_id in URL path, not in body
      const response = await apiClient.post(`/admin/stock/variants/${variant.id}/import/`, {
        quantity: values.quantity,
        cost_per_item: values.cost_per_item,
        reference_number: values.reference_number || '',
        notes: values.notes || ''
      });

      message.success(response.data.message || 'Nhập kho thành công!');
      form.resetFields();
      if (onSuccess) onSuccess(response.data);
      onCancel();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Nhập kho thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nhập kho"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Xác nhận nhập"
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
          <div style={{ marginBottom: 4 }}>
            <strong>Sản phẩm:</strong> {variant.product_name || variant.product?.name}
          </div>
          {variant.size && (
            <div style={{ marginBottom: 4 }}>
              <strong>Size:</strong> {variant.size}
            </div>
          )}
          {variant.color && (
            <div style={{ marginBottom: 4 }}>
              <strong>Màu:</strong> {variant.color}
            </div>
          )}
          <div style={{ marginBottom: 4 }}>
            <strong>SKU:</strong> {variant.sku}
          </div>
          <div>
            <strong>Tồn kho hiện tại:</strong> {variant.stock_quantity || 0}
          </div>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Số lượng nhập"
          name="quantity"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng!' },
            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
          ]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            placeholder="Nhập số lượng" 
            min={1}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          label="Giá vốn (VNĐ/sản phẩm)"
          name="cost_per_item"
          rules={[
            { required: true, message: 'Vui lòng nhập giá vốn!' },
            { type: 'number', min: 0, message: 'Giá vốn không hợp lệ!' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập giá vốn"
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          label="Mã phiếu nhập"
          name="reference_number"
        >
          <Input placeholder="VD: NK-001, PN-20251107" />
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="notes"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Ghi chú về lô hàng nhập (tùy chọn)" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockImportModal;
