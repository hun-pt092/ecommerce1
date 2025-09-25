import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  InputNumber,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Divider,
  Row,
  Col,
  Card,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ProductVariantsForm = ({ variants = [], onChange }) => {
  const [editingKey, setEditingKey] = useState('');
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    stock_quantity: 0,
  });

  // Kiểm tra variant đang được edit
  const isEditing = (record) => record.key === editingKey;

  // Bắt đầu edit variant
  const edit = (record) => {
    setEditingKey(record.key);
  };

  // Hủy edit
  const cancel = () => {
    setEditingKey('');
  };

  // Lưu variant đã edit
  const save = async (key) => {
    try {
      const updatedVariants = variants.map(variant => 
        variant.key === key ? variant : variant
      );
      onChange(updatedVariants);
      setEditingKey('');
      message.success('Cập nhật variant thành công');
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  // Thêm variant mới
  const handleAddVariant = () => {
    if (!newVariant.size.trim() || !newVariant.color.trim()) {
      message.error('Vui lòng nhập đầy đủ size và màu sắc');
      return;
    }

    // Kiểm tra trùng lặp
    const exists = variants.some(v => 
      v.size.toLowerCase() === newVariant.size.toLowerCase() && 
      v.color.toLowerCase() === newVariant.color.toLowerCase()
    );

    if (exists) {
      message.error('Variant này đã tồn tại');
      return;
    }

    const variant = {
      key: Date.now().toString(),
      ...newVariant,
      stock_quantity: newVariant.stock_quantity || 0,
    };

    onChange([...variants, variant]);
    setNewVariant({ size: '', color: '', stock_quantity: 0 });
    message.success('Thêm variant thành công');
  };

  // Xóa variant
  const handleDelete = (key) => {
    const updatedVariants = variants.filter(variant => variant.key !== key);
    onChange(updatedVariants);
    message.success('Xóa variant thành công');
  };

  // Cập nhật giá trị variant khi edit
  const updateVariant = (key, field, value) => {
    const updatedVariants = variants.map(variant =>
      variant.key === key ? { ...variant, [field]: value } : variant
    );
    onChange(updatedVariants);
  };

  // Columns cho table
  const columns = [
    {
      title: 'Size',
      dataIndex: 'size',
      width: '25%',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Input
              value={record.size}
              onChange={(e) => updateVariant(record.key, 'size', e.target.value)}
              placeholder="S, M, L, XL..."
            />
          );
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      width: '25%',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Input
              value={record.color}
              onChange={(e) => updateVariant(record.key, 'color', e.target.value)}
              placeholder="Đen, Trắng, Xanh..."
            />
          );
        }
        return <Tag color="green">{text}</Tag>;
      },
    },
    {
      title: 'Số lượng tồn kho',
      dataIndex: 'stock_quantity',
      width: '25%',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <InputNumber
              value={record.stock_quantity}
              onChange={(value) => updateVariant(record.key, 'stock_quantity', value || 0)}
              min={0}
              style={{ width: '100%' }}
            />
          );
        }
        return (
          <Text strong style={{ color: text > 0 ? '#52c41a' : '#ff4d4f' }}>
            {text}
          </Text>
        );
      },
    },
    {
      title: 'Hành động',
      width: '25%',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => save(record.key)}
            />
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={cancel}
            />
          </Space>
        ) : (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              disabled={editingKey !== ''}
            />
            <Popconfirm
              title="Xóa variant này?"
              onConfirm={() => handleDelete(record.key)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={editingKey !== ''}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* Form thêm variant mới */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Text strong>Thêm variant mới</Text>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Size (S, M, L...)"
              value={newVariant.size}
              onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
              onPressEnter={handleAddVariant}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Màu sắc"
              value={newVariant.color}
              onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
              onPressEnter={handleAddVariant}
            />
          </Col>
          <Col xs={24} sm={6}>
            <InputNumber
              placeholder="Số lượng"
              value={newVariant.stock_quantity}
              onChange={(value) => setNewVariant({ ...newVariant, stock_quantity: value || 0 })}
              min={0}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVariant}
              block
            >
              Thêm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng hiển thị variants */}
      {variants.length > 0 ? (
        <Table
          columns={columns}
          dataSource={variants}
          pagination={false}
          size="small"
          bordered
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}>
                  <Text strong>Tổng cộng</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>
                    {variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0)} sản phẩm
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text type="secondary">{variants.length} variants</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          background: '#f5f5f5', 
          borderRadius: 8,
          border: '1px dashed #d9d9d9'
        }}>
          <Text type="secondary">
            Chưa có variant nào. Thêm variant để khách hàng có thể chọn size và màu sắc.
            <br />
            <small>Ví dụ: S-Đen, M-Trắng, L-Xanh...</small>
          </Text>
        </div>
      )}

      {/* Hướng dẫn */}
      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 <strong>Lưu ý:</strong> Mỗi variant là một tổ hợp duy nhất của size và màu sắc. 
          Khách hàng sẽ chọn variant khi mua hàng.
        </Text>
      </div>
    </div>
  );
};

export default ProductVariantsForm;