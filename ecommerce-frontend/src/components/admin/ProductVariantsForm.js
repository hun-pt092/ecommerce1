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
    // KHÔNG quản lý stock_quantity ở đây nữa - sẽ quản lý ở Quản lý Kho hàng
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
      // Không set stock_quantity ở đây - để quản lý ở phần Kho hàng
      is_active: true, // Mặc định là active
    };

    onChange([...variants, variant]);
    setNewVariant({ size: '', color: '' });
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
      width: '30%',
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
      width: '30%',
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
      title: 'SKU',
      dataIndex: 'sku',
      width: '25%',
      render: (text, record) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {text || 'Tự động tạo'}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      width: '15%',
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
      <Card size="small" style={{ marginBottom: 16, background: '#f0f5ff' }}>
        <Text strong>Thêm variant mới</Text>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Size (S, M, L...)"
              value={newVariant.size}
              onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
              onPressEnter={handleAddVariant}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Màu sắc"
              value={newVariant.color}
              onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
              onPressEnter={handleAddVariant}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVariant}
              block
            >
              Thêm variant
            </Button>
          </Col>
        </Row>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 Số lượng tồn kho sẽ được quản lý ở phần <strong>Quản lý Kho hàng</strong>
          </Text>
        </div>
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
                <Table.Summary.Cell colSpan={3}>
                  <Text strong>Tổng số variants: {variants.length}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
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
      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        background: '#fffbe6', 
        borderRadius: 8,
        border: '1px solid #ffe58f'
      }}>
        <Text style={{ fontSize: 12 }}>
           <strong>Quản lý Sản phẩm vs Quản lý Kho hàng:</strong>
        </Text>
        <ul style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
          <li><strong>Ở đây (Quản lý Sản phẩm):</strong> Chỉ thêm/sửa size và màu sắc của variant</li>
          <li><strong>Quản lý Kho hàng:</strong> Nhập hàng, điều chỉnh tồn kho, xem lịch sử xuất nhập</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductVariantsForm;