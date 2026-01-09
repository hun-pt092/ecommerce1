import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Form,
  message,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * ProductVouchersForm - Form quản lý voucher cho sản phẩm
 */
const ProductVouchersForm = ({ vouchers = [], onChange }) => {
  const [voucherList, setVoucherList] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Parse vouchers khi component mount
  useEffect(() => {
    if (vouchers && vouchers.length > 0) {
      setVoucherList(vouchers.map((v, index) => ({
        ...v,
        key: v.id || `temp_${index}`,
      })));
    }
  }, []);

  // Khi voucherList thay đổi, cập nhật parent
  useEffect(() => {
    onChange(voucherList);
  }, [voucherList, onChange]);

  // Thêm voucher mới
  const handleAdd = () => {
    form.validateFields().then(values => {
      const newVoucher = {
        key: `temp_${Date.now()}`,
        code: values.code,
        name: values.name,
        description: values.description || '',
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        max_discount_amount: values.max_discount_amount || null,
        max_uses: values.max_uses || null,
        current_uses: 0,
        valid_from: values.date_range[0].toISOString(),
        valid_to: values.date_range[1].toISOString(),
        is_active: values.is_active !== false,
      };

      setVoucherList([...voucherList, newVoucher]);
      form.resetFields();
      setIsAdding(false);
      message.success('Thêm voucher thành công');
    }).catch(error => {
      console.error('Validation failed:', error);
    });
  };

  // Cập nhật voucher
  const handleUpdate = (key) => {
    form.validateFields().then(values => {
      setVoucherList(voucherList.map(v => {
        if (v.key === key) {
          return {
            ...v,
            code: values.code,
            name: values.name,
            description: values.description || '',
            discount_type: values.discount_type,
            discount_value: values.discount_value,
            max_discount_amount: values.max_discount_amount || null,
            max_uses: values.max_uses || null,
            valid_from: values.date_range[0].toISOString(),
            valid_to: values.date_range[1].toISOString(),
            is_active: values.is_active !== false,
          };
        }
        return v;
      }));
      
      form.resetFields();
      setEditingId(null);
      message.success('Cập nhật voucher thành công');
    }).catch(error => {
      console.error('Validation failed:', error);
    });
  };

  // Xóa voucher
  const handleDelete = (key) => {
    setVoucherList(voucherList.filter(v => v.key !== key));
    message.success('Xóa voucher thành công');
  };

  // Bắt đầu edit
  const handleEdit = (voucher) => {
    setEditingId(voucher.key);
    setIsAdding(false);
    
    form.setFieldsValue({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      max_discount_amount: voucher.max_discount_amount,
      max_uses: voucher.max_uses,
      date_range: [dayjs(voucher.valid_from), dayjs(voucher.valid_to)],
      is_active: voucher.is_active,
    });
  };

  // Hủy thêm/sửa
  const handleCancel = () => {
    form.resetFields();
    setIsAdding(false);
    setEditingId(null);
  };

  // Cột của bảng
  const columns = [
    {
      title: 'Mã voucher',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Tên voucher',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Giảm giá',
      key: 'discount',
      width: 150,
      render: (_, record) => {
        if (record.discount_type === 'percentage') {
          return (
            <Space direction="vertical" size={0}>
              <Text>{record.discount_value}%</Text>
              {record.max_discount_amount && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tối đa: {record.max_discount_amount.toLocaleString()}₫
                </Text>
              )}
            </Space>
          );
        } else {
          return <Text>{record.discount_value.toLocaleString()}₫</Text>;
        }
      },
    },
    {
      title: 'Số lượt',
      key: 'uses',
      width: 100,
      render: (_, record) => {
        if (record.max_uses) {
          return `${record.current_uses || 0}/${record.max_uses}`;
        }
        return 'Không giới hạn';
      },
    },
    {
      title: 'Thời gian',
      key: 'validity',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            Từ: {dayjs(record.valid_from).format('DD/MM/YYYY HH:mm')}
          </Text>
          <Text style={{ fontSize: 12 }}>
            Đến: {dayjs(record.valid_to).format('DD/MM/YYYY HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tắt'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa voucher này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Nút thêm voucher */}
      {!isAdding && !editingId && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setIsAdding(true)}
          block
          style={{ marginBottom: 16 }}
        >
          Thêm voucher
        </Button>
      )}

      {/* Form thêm/sửa voucher */}
      {(isAdding || editingId) && (
        <Card
          size="small"
          style={{ marginBottom: 16, background: '#f0f5ff' }}
          title={
            <Text strong>
              {isAdding ? 'Thêm voucher mới' : 'Chỉnh sửa voucher'}
            </Text>
          }
          extra={
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={handleCancel}
            >
              Hủy
            </Button>
          }
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Mã voucher"
                  name="code"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã voucher' },
                    { pattern: /^[A-Z0-9_]+$/, message: 'Chỉ dùng chữ in hoa, số và _' },
                  ]}
                >
                  <Input placeholder="VD: SALE20" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={16}>
                <Form.Item
                  label="Tên voucher"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên voucher' }]}
                >
                  <Input placeholder="VD: Giảm 20% cho sản phẩm này" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Mô tả"
              name="description"
            >
              <Input.TextArea rows={2} placeholder="Mô tả chi tiết về voucher" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Loại giảm giá"
                  name="discount_type"
                  initialValue="percentage"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="percentage">Phần trăm (%)</Option>
                    <Option value="fixed">Số tiền cố định (₫)</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Giá trị giảm"
                  name="discount_value"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị' },
                    { type: 'number', min: 0, message: 'Giá trị phải lớn hơn 0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={8}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.discount_type !== currentValues.discount_type
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('discount_type') === 'percentage' ? (
                      <Form.Item
                        label="Giảm tối đa (₫)"
                        name="max_discount_amount"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          placeholder="Không giới hạn"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    ) : <div style={{ height: 62 }} />
                  }
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thời gian hiệu lực"
                  name="date_range"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                >
                  <RangePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Số lần sử dụng tối đa"
                  name="max_uses"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="Không giới hạn"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Kích hoạt voucher"
              name="is_active"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => isAdding ? handleAdd() : handleUpdate(editingId)}
              block
            >
              {isAdding ? 'Thêm voucher' : 'Cập nhật voucher'}
            </Button>
          </Form>
        </Card>
      )}

      {/* Bảng danh sách voucher */}
      {voucherList.length > 0 && (
        <Table
          columns={columns}
          dataSource={voucherList}
          pagination={false}
          size="small"
          scroll={{ x: 1000 }}
        />
      )}

      {voucherList.length === 0 && !isAdding && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#fafafa',
          border: '1px dashed #d9d9d9',
          borderRadius: 4,
        }}>
          <Text type="secondary">Chưa có voucher nào</Text>
        </div>
      )}
    </div>
  );
};

export default ProductVouchersForm;
