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
  Form,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  PictureOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Panel } = Collapse;

/**
 * ProductVariantsForm - NEW STRUCTURE
 * Product → ProductVariant (color, price) → ProductVariantImage[] + ProductSKU[] (size, stock)
 */
const ProductVariantsForm = ({ variants = [], onChange }) => {
  // State để quản lý các variants (mỗi variant có color, price, images[], sizes[])
  const [variantsList, setVariantsList] = useState([]);
  
  // Form thêm variant mới
  const [newVariant, setNewVariant] = useState({
    color: '',
    price: '',
    discount_price: '',
    existingImages: [], // ✅ Ảnh cũ từ DB (không có khi tạo mới)
    images: [], // ✅ Array of NEW image files only
    imagePreviews: [], // Array of preview URLs (cả cũ và mới)
  });

  // Form thêm size cho variant đã chọn
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [newSize, setNewSize] = useState({
    name: '',
    stock_quantity: 0,
  });

  // Parse variants từ backend khi component mount
  useEffect(() => {
    if (variants && variants.length > 0) {
      // Backend trả về ProductVariant with skus[] and images[]
      const parsedVariants = variants.map(variant => ({
        id: variant.id, // ✅ Giữ ID để update
        color: variant.color || '',
        price: variant.price || 0,
        discount_price: variant.discount_price || null,
        is_active: variant.is_active !== false,
        existingImages: variant.images || [], // ✅ Ảnh cũ từ DB (object với id)
        images: [], // ✅ Ảnh MỚI upload (File objects) - ban đầu rỗng
        imagePreviews: variant.images?.map(img => img.image_url || img.image) || [],
        sizes: variant.skus?.map(sku => ({
          id: sku.id, // ✅ Giữ ID của SKU
          name: sku.size || '',
          stock_quantity: sku.stock_quantity || 0,
          minimum_stock: sku.minimum_stock || 5,
          reorder_point: sku.reorder_point || 10,
          cost_price: sku.cost_price || 0,
        })) || [],
      }));
      
      setVariantsList(parsedVariants);
    }
  }, []);

  // Khi variantsList thay đổi, cập nhật parent component
  useEffect(() => {
    // Convert to format expected by backend
    const formatted = variantsList.map(variant => ({
      id: variant.id, // ✅ Gửi ID để BE biết update
      color: variant.color,
      price: variant.price,
      discount_price: variant.discount_price,
      is_active: variant.is_active,
      images: variant.images, // ✅ CHỈ File objects MỚI, KHÔNG có ảnh cũ
      imagePreviews: variant.imagePreviews, // For display only
      sizes: variant.sizes,
    }));
    
    // DEBUG: Log variant images để kiểm tra
    formatted.forEach(v => {
      if (v.images && v.images.length > 0) {
        console.log(`📸 Variant ${v.color} has ${v.images.length} images:`, 
          v.images.map(img => img instanceof File ? `File: ${img.name}` : `Object: ${JSON.stringify(img)}`));
      }
    });
    
    onChange(formatted);
  }, [variantsList, onChange]);

  // Xử lý upload nhiều ảnh cho variant mới
  const handleNewVariantImagesChange = ({ fileList }) => {
    const files = fileList.map(f => f.originFileObj || f).filter(f => f instanceof File);
    
    if (files.length === 0) {
      setNewVariant({
        ...newVariant,
        images: [],
        imagePreviews: [],
      });
      return;
    }
    
    const previews = [];
    let loadedCount = 0;
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = e.target.result;
        loadedCount++;
        
        // Chỉ update state khi đã load xong tất cả ảnh
        if (loadedCount === files.length) {
          setNewVariant({
            ...newVariant,
            images: files,
            imagePreviews: previews,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Thêm variant mới
  const handleAddVariant = () => {
    if (!newVariant.color.trim()) {
      message.error('Vui lòng nhập màu sắc');
      return;
    }
    if (!newVariant.price || newVariant.price <= 0) {
      message.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    // Kiểm tra trùng màu
    if (variantsList.some(v => v.color && v.color.toLowerCase() === newVariant.color.toLowerCase())) {
      message.error('Màu sắc này đã tồn tại');
      return;
    }

    setVariantsList([
      ...variantsList,
      {
        color: newVariant.color,
        price: parseFloat(newVariant.price),
        discount_price: newVariant.discount_price ? parseFloat(newVariant.discount_price) : null,
        is_active: true,
        images: newVariant.images,
        imagePreviews: newVariant.imagePreviews,
        sizes: [],
      },
    ]);

    // Reset form
    setNewVariant({
      color: '',
      price: '',
      discount_price: '',
      images: [],
      imagePreviews: [],
    });
    
    message.success('Thêm variant thành công');
  };

  // Xóa variant
  const handleDeleteVariant = (index) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
    message.success('Xóa variant thành công');
  };

  // Cập nhật giá của variant
  const handleUpdateVariantPrice = (index, field, value) => {
    const updated = [...variantsList];
    updated[index] = {
      ...updated[index],
      [field]: value ? parseFloat(value) : null,
    };
    setVariantsList(updated);
  };

  // Thêm size cho variant
  const handleAddSize = (variantIndex) => {
    if (!newSize.name.trim()) {
      message.error('Vui lòng nhập tên size');
      return;
    }

    const updated = [...variantsList];
    const variant = updated[variantIndex];
    
    // Kiểm tra trùng size
    if (variant.sizes.some(s => s.name && s.name.toLowerCase() === newSize.name.toLowerCase())) {
      message.error('Size này đã tồn tại cho variant này');
      return;
    }
    
    variant.sizes.push({
      name: newSize.name,
      stock_quantity: newSize.stock_quantity || 0,
      minimum_stock: 5,
      reorder_point: 10,
      cost_price: 0,
    });
    
    setVariantsList(updated);
    setNewSize({ name: '', stock_quantity: 0 });
    setSelectedVariantIndex(null);
    message.success('Thêm size thành công');
  };

  // Xóa size
  const handleDeleteSize = (variantIndex, sizeIndex) => {
    const updated = [...variantsList];
    updated[variantIndex].sizes = updated[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    setVariantsList(updated);
    message.success('Xóa size thành công');
  };

  // Cập nhật stock của size
  const handleUpdateSizeStock = (variantIndex, sizeIndex, stock) => {
    const updated = [...variantsList];
    updated[variantIndex].sizes[sizeIndex].stock_quantity = stock || 0;
    setVariantsList(updated);
  };

  // Thêm/cập nhật ảnh cho variant đã tồn tại
  const handleUpdateVariantImages = (variantIndex, { fileList }) => {
    const files = fileList.map(f => f.originFileObj || f).filter(f => f instanceof File);
    
    if (files.length === 0) {
      return;
    }
    
    const previews = [];
    let loadedCount = 0;
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = e.target.result;
        loadedCount++;
        
        if (loadedCount === files.length) {
          const updated = [...variantsList];
          updated[variantIndex] = {
            ...updated[variantIndex],
            images: [...(updated[variantIndex].images || []), ...files],
            imagePreviews: [...(updated[variantIndex].imagePreviews || []), ...previews],
          };
          setVariantsList(updated);
          message.success('Thêm ảnh thành công');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Xóa ảnh khỏi variant
  const handleDeleteVariantImage = (variantIndex, imageIndex) => {
    const updated = [...variantsList];
    const variant = updated[variantIndex];
    
    variant.images = variant.images.filter((_, i) => i !== imageIndex);
    variant.imagePreviews = variant.imagePreviews.filter((_, i) => i !== imageIndex);
    
    setVariantsList(updated);
    message.success('Xóa ảnh thành công');
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4}>Quản lý Variants (Màu sắc & Sizes)</Title>
      
      {/* Form thêm variant mới */}
      <Card 
        title="Thêm Variant Mới (Màu sắc + Giá)" 
        size="small" 
        style={{ marginBottom: '16px', background: '#fafafa' }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Text strong>Màu sắc *</Text>
            <Input
              placeholder="VD: Đen, Trắng, Xanh"
              value={newVariant.color}
              onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
              onPressEnter={handleAddVariant}
            />
          </Col>
          <Col span={5}>
            <Text strong>Giá (₫) *</Text>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="VD: 500000"
              min={0}
              value={newVariant.price}
              onChange={(val) => setNewVariant({ ...newVariant, price: val })}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Col>
          <Col span={5}>
            <Text strong>Giá giảm (₫)</Text>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Tùy chọn"
              min={0}
              value={newVariant.discount_price}
              onChange={(val) => setNewVariant({ ...newVariant, discount_price: val })}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Col>
          <Col span={6}>
            <Text strong>Ảnh</Text>
            <Upload
              listType="picture-card"
              fileList={newVariant.imagePreviews.map((url, i) => ({
                uid: i,
                name: `image-${i}`,
                status: 'done',
                url: url,
              }))}
              onChange={handleNewVariantImagesChange}
              beforeUpload={() => false}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Col>
          <Col span={2}>
            <div style={{ marginTop: '22px' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddVariant}
                block
              >
                Thêm
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Danh sách variants */}
      <Collapse accordion>
        {variantsList.map((variant, variantIndex) => (
          <Panel
            key={variantIndex}
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color="blue">{variant.color}</Tag>
                  <Text strong>{variant.price?.toLocaleString()}₫</Text>
                  {variant.discount_price && (
                    <Text type="danger">→ {variant.discount_price?.toLocaleString()}₫</Text>
                  )}
                  <Text type="secondary">
                    ({variant.sizes.length} sizes, {variant.imagePreviews?.length || 0} ảnh)
                  </Text>
                </Space>
                <Popconfirm
                  title="Xóa variant này?"
                  onConfirm={(e) => {
                    e.stopPropagation();
                    handleDeleteVariant(variantIndex);
                  }}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button 
                    danger 
                    size="small" 
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Xóa Variant
                  </Button>
                </Popconfirm>
              </div>
            }
          >
            {/* Cập nhật giá và ảnh */}
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={6}>
                <Text strong>Giá (₫)</Text>
                <InputNumber
                  style={{ width: '100%' }}
                  value={variant.price}
                  onChange={(val) => handleUpdateVariantPrice(variantIndex, 'price', val)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Col>
              <Col span={6}>
                <Text strong>Giá giảm (₫)</Text>
                <InputNumber
                  style={{ width: '100%' }}
                  value={variant.discount_price}
                  onChange={(val) => handleUpdateVariantPrice(variantIndex, 'discount_price', val)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Col>
              <Col span={12}>
                <Text strong>Quản lý ảnh ({variant.imagePreviews?.length || 0} ảnh)</Text>
                <div style={{ marginTop: '8px' }}>
                  {/* Hiển thị ảnh hiện tại với nút xóa */}
                  <Space wrap>
                    {variant.imagePreviews?.map((url, imageIndex) => (
                      <div key={imageIndex} style={{ position: 'relative', display: 'inline-block' }}>
                        <Image 
                          width={60} 
                          height={60} 
                          src={url} 
                          style={{ borderRadius: '4px', border: '1px solid #d9d9d9' }}
                        />
                        <Button
                          danger
                          size="small"
                          shape="circle"
                          icon={<DeleteOutlined />}
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            zIndex: 1,
                          }}
                          onClick={() => handleDeleteVariantImage(variantIndex, imageIndex)}
                        />
                        {imageIndex === 0 && (
                          <Tag 
                            color="green" 
                            style={{ position: 'absolute', bottom: 0, left: 0, margin: 2, fontSize: '10px' }}
                          >
                            Chính
                          </Tag>
                        )}
                      </div>
                    ))}
                    
                    {/* Upload thêm ảnh */}
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => false}
                      multiple
                      onChange={(info) => handleUpdateVariantImages(variantIndex, info)}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 4, fontSize: '12px' }}>Thêm</div>
                      </div>
                    </Upload>
                  </Space>
                </div>
              </Col>
            </Row>

            <Divider />

            {/* Form thêm size */}
            <Card size="small" title="Thêm Size" style={{ marginBottom: '16px', background: '#f0f0f0' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Input
                    placeholder="VD: S, M, L, XL, 29, 30"
                    value={selectedVariantIndex === variantIndex ? newSize.name : ''}
                    onChange={(e) => {
                      setSelectedVariantIndex(variantIndex);
                      setNewSize({ ...newSize, name: e.target.value });
                    }}
                    onPressEnter={() => handleAddSize(variantIndex)}
                  />
                </Col>
                <Col span={8}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Số lượng tồn kho"
                    min={0}
                    value={selectedVariantIndex === variantIndex ? newSize.stock_quantity : 0}
                    onChange={(val) => {
                      setSelectedVariantIndex(variantIndex);
                      setNewSize({ ...newSize, stock_quantity: val || 0 });
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAddSize(variantIndex)}
                    block
                  >
                    Thêm Size
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Bảng sizes */}
            <Table
              size="small"
              dataSource={variant.sizes}
              pagination={false}
              rowKey={(_, index) => index}
              columns={[
                {
                  title: 'Size',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => <Tag color="green">{text}</Tag>,
                },
                {
                  title: 'Tồn kho',
                  dataIndex: 'stock_quantity',
                  key: 'stock',
                  render: (stock, record, sizeIndex) => (
                    <InputNumber
                      min={0}
                      value={stock}
                      onChange={(val) => handleUpdateSizeStock(variantIndex, sizeIndex, val)}
                      style={{ width: '100px' }}
                    />
                  ),
                },
                {
                  title: 'Hành động',
                  key: 'action',
                  render: (_, record, sizeIndex) => (
                    <Popconfirm
                      title="Xóa size này?"
                      onConfirm={() => handleDeleteSize(variantIndex, sizeIndex)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button danger size="small" icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </Panel>
        ))}
      </Collapse>

      {variantsList.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          background: '#fafafa', 
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <PictureOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
          <p style={{ color: '#999', marginTop: '16px' }}>
            Chưa có variant nào. Thêm màu sắc và giá ở form bên trên.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductVariantsForm;
