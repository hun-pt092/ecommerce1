import React, { useState, useEffect } from 'react';
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
  Upload,
  Image,
  Collapse,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  PictureOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { Panel } = Collapse;

/**
 * ProductVariantsForm - Form quản lý biến thể sản phẩm theo cấu trúc:
 * Màu sắc (color) → Ảnh + Giá → Các sizes
 */
const ProductVariantsForm = ({ variants = [], onChange }) => {
  // State để quản lý các màu sắc (mỗi màu có ảnh và giá riêng)
  const [colors, setColors] = useState([]);
  
  // Form thêm màu mới
  const [newColor, setNewColor] = useState({
    name: '',
    price: '',
    discount_price: '',
    image: null,
    imagePreview: null,
  });

  // Form thêm size cho màu đã chọn
  const [selectedColorForSize, setSelectedColorForSize] = useState(null);
  const [newSize, setNewSize] = useState('');

  // Parse variants thành cấu trúc colors khi component mount hoặc variants thay đổi
  useEffect(() => {
    if (variants && variants.length > 0) {
      const colorMap = {};
      
      variants.forEach(variant => {
        const colorName = variant.color;
        if (!colorMap[colorName]) {
          colorMap[colorName] = {
            name: colorName,
            price: variant.price || 0,
            discount_price: variant.discount_price || null,
            image: variant.image,
            imagePreview: variant.image,
            sizes: [],
          };
        }
        colorMap[colorName].sizes.push({
          name: variant.size,
          stock_quantity: variant.stock_quantity || 0,
        });
      });
      
      setColors(Object.values(colorMap));
    }
  }, []);

  // Khi colors thay đổi, cập nhật variants
  useEffect(() => {
    const newVariants = [];
    colors.forEach(color => {
      color.sizes.forEach(size => {
        newVariants.push({
          color: color.name,
          size: size.name,
          price: color.price,
          discount_price: color.discount_price,
          image: color.image,
          imageFile: color.imageFile || (color.image instanceof File ? color.image : null), // Lưu file riêng để upload
          imagePreview: color.imagePreview,
          stock_quantity: size.stock_quantity,
        });
      });
    });
    onChange(newVariants);
  }, [colors, onChange]);

  // Xử lý upload ảnh cho màu mới
  const handleNewColorImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewColor({
          ...newColor,
          image: file,
          imagePreview: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm màu mới
  const handleAddColor = () => {
    if (!newColor.name.trim()) {
      message.error('Vui lòng nhập tên màu sắc');
      return;
    }
    if (!newColor.price || newColor.price <= 0) {
      message.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    // Kiểm tra trùng màu
    if (colors.some(c => c.name.toLowerCase() === newColor.name.toLowerCase())) {
      message.error('Màu sắc này đã tồn tại');
      return;
    }

    setColors([
      ...colors,
      {
        name: newColor.name,
        price: parseFloat(newColor.price),
        discount_price: newColor.discount_price ? parseFloat(newColor.discount_price) : null,
        image: newColor.image,
        imagePreview: newColor.imagePreview,
        sizes: [],
      },
    ]);

    // Reset form
    setNewColor({
      name: '',
      price: '',
      discount_price: '',
      image: null,
      imagePreview: null,
    });
    message.success('Thêm màu sắc thành công');
  };

  // Xóa màu
  const handleDeleteColor = (colorName) => {
    setColors(colors.filter(c => c.name !== colorName));
    message.success('Xóa màu sắc thành công');
  };

  // Thêm size cho màu
  const handleAddSize = (colorName) => {
    if (!newSize.trim()) {
      message.error('Vui lòng nhập tên size');
      return;
    }

    setColors(colors.map(color => {
      if (color.name === colorName) {
        // Kiểm tra trùng size
        if (color.sizes.some(s => s.name.toLowerCase() === newSize.toLowerCase())) {
          message.error('Size này đã tồn tại cho màu này');
          return color;
        }
        
        return {
          ...color,
          sizes: [...color.sizes, { name: newSize, stock_quantity: 0 }],
        };
      }
      return color;
    }));

    setNewSize('');
    setSelectedColorForSize(null);
    message.success('Thêm size thành công');
  };

  // Xóa size
  const handleDeleteSize = (colorName, sizeName) => {
    setColors(colors.map(color => {
      if (color.name === colorName) {
        return {
          ...color,
          sizes: color.sizes.filter(s => s.name !== sizeName),
        };
      }
      return color;
    }));
    message.success('Xóa size thành công');
  };

  // Cập nhật giá của màu
  const handleUpdateColorPrice = (colorName, field, value) => {
    setColors(colors.map(color => {
      if (color.name === colorName) {
        return { ...color, [field]: value };
      }
      return color;
    }));
  };

  // Xử lý thay đổi ảnh cho màu đã tồn tại
  const handleColorImageChange = (colorName, info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setColors(colors.map(color => {
          if (color.name === colorName) {
            return {
              ...color,
              image: file,
              imageFile: file,
              imagePreview: e.target.result,
            };
          }
          return color;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {/* Form thêm màu mới */}
      <Card size="small" style={{ marginBottom: 16, background: '#f0f5ff' }}>
        <Text strong>Thêm màu sắc mới</Text>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Tên màu (Đỏ, Xanh...)"
              value={newColor.name}
              onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
              onPressEnter={handleAddColor}
            />
          </Col>
          <Col xs={24} sm={5}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Giá bán"
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              value={newColor.price}
              onChange={(value) => setNewColor({ ...newColor, price: value })}
              addonAfter="VND"
            />
          </Col>
          <Col xs={24} sm={5}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Giá KM (tùy chọn)"
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              value={newColor.discount_price}
              onChange={(value) => setNewColor({ ...newColor, discount_price: value })}
              addonAfter="VND"
            />
          </Col>
          <Col xs={24} sm={4}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleNewColorImageChange}
            >
              <Button icon={<UploadOutlined />} block>
                {newColor.imagePreview ? 'Đổi ảnh' : 'Chọn ảnh'}
              </Button>
            </Upload>
            {newColor.imagePreview && (
              <Image
                src={newColor.imagePreview}
                alt="Preview"
                style={{ marginTop: 8, width: '100%', maxHeight: 60, objectFit: 'cover' }}
              />
            )}
          </Col>
          <Col xs={24} sm={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddColor}
              block
            >
              Thêm màu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Danh sách màu sắc */}
      {colors.length > 0 ? (
        <Collapse accordion>
          {colors.map((color, index) => (
            <Panel
              header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space>
                    <PictureOutlined />
                    <Text strong>{color.name}</Text>
                    <Tag color="green">{color.price?.toLocaleString()} VND</Tag>
                    {color.discount_price && (
                      <Tag color="red">KM: {color.discount_price?.toLocaleString()} VND</Tag>
                    )}
                    <Tag color="blue">{color.sizes.length} sizes</Tag>
                  </Space>
                  <Popconfirm
                    title="Xóa màu này và tất cả sizes?"
                    onConfirm={(e) => {
                      e.stopPropagation();
                      handleDeleteColor(color.name);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xóa màu
                    </Button>
                  </Popconfirm>
                </div>
              }
              key={index}
            >
              {/* Ảnh màu và giá */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={6}>
                  {color.imagePreview ? (
                    <div>
                      <Image
                        src={typeof color.imagePreview === 'string' ? color.imagePreview : color.imagePreview}
                        alt={color.name}
                        style={{ width: '100%', maxHeight: 150, objectFit: 'cover', marginBottom: 8 }}
                      />
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={(info) => handleColorImageChange(color.name, info)}
                      >
                        <Button icon={<UploadOutlined />} size="small" block>
                          Đổi ảnh
                        </Button>
                      </Upload>
                    </div>
                  ) : (
                    <div>
                      <div style={{
                        width: '100%',
                        height: 150,
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                      }}>
                        <Text type="secondary">Chưa có ảnh</Text>
                      </div>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={(info) => handleColorImageChange(color.name, info)}
                      >
                        <Button icon={<UploadOutlined />} size="small" block>
                          Chọn ảnh
                        </Button>
                      </Upload>
                    </div>
                  )}
                </Col>
                <Col xs={24} sm={18}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text>Giá bán:</Text>
                      <InputNumber
                        style={{ width: '100%', marginTop: 8 }}
                        min={0}
                        value={color.price}
                        onChange={(value) => handleUpdateColorPrice(color.name, 'price', value)}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        addonAfter="VND"
                      />
                    </Col>
                    <Col span={12}>
                      <Text>Giá khuyến mãi:</Text>
                      <InputNumber
                        style={{ width: '100%', marginTop: 8 }}
                        min={0}
                        value={color.discount_price}
                        onChange={(value) => handleUpdateColorPrice(color.name, 'discount_price', value)}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        addonAfter="VND"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Divider />

              {/* Form thêm size */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={18}>
                  <Input
                    placeholder="Nhập size (S, M, L, XL...)"
                    value={selectedColorForSize === color.name ? newSize : ''}
                    onChange={(e) => {
                      setSelectedColorForSize(color.name);
                      setNewSize(e.target.value);
                    }}
                    onPressEnter={() => handleAddSize(color.name)}
                  />
                </Col>
                <Col xs={6}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddSize(color.name)}
                    block
                  >
                    Thêm size
                  </Button>
                </Col>
              </Row>

              {/* Danh sách sizes */}
              {color.sizes.length > 0 ? (
                <Table
                  dataSource={color.sizes}
                  rowKey="name"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Size',
                      dataIndex: 'name',
                      render: (text) => <Tag color="blue">{text}</Tag>,
                    },
                    {
                      title: 'Tồn kho',
                      dataIndex: 'stock_quantity',
                      render: (text, record) => (
                        <Text type="secondary">{text || 0} (Quản lý ở Kho hàng)</Text>
                      ),
                    },
                    {
                      title: 'Hành động',
                      render: (_, record) => (
                        <Popconfirm
                          title="Xóa size này?"
                          onConfirm={() => handleDeleteSize(color.name, record.name)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ),
                    },
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 20, background: '#fafafa' }}>
                  <Text type="secondary">Chưa có size nào cho màu này</Text>
                </div>
              )}
            </Panel>
          ))}
        </Collapse>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 40,
          background: '#f5f5f5',
          borderRadius: 8,
          border: '1px dashed #d9d9d9'
        }}>
          <Text type="secondary">
            Chưa có màu sắc nào. Thêm màu sắc để bắt đầu.
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
          <strong>📝 Hướng dẫn:</strong>
        </Text>
        <ul style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
          <li>Mỗi màu sắc sẽ có ảnh riêng, giá riêng (và giá khuyến mãi nếu có)</li>
          <li>Mỗi màu có thể có nhiều sizes khác nhau (S, M, L, XL...)</li>
          <li>Tồn kho sẽ được quản lý riêng cho từng kết hợp màu-size ở phần "Quản lý Kho hàng"</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductVariantsForm;
