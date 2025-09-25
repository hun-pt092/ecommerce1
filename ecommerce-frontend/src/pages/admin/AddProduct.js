import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Divider,
  Space,
  Spin,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import authAxios from '../../api/AuthAxios';
import ProductImageUpload from '../../components/admin/ProductImageUpload';
import ProductVariantsForm from '../../components/admin/ProductVariantsForm';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get product ID for edit mode
  const isEditMode = !!id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  // Fetch categories, brands và product data (nếu edit mode)
  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      // Fetch categories và brands
      const [categoriesRes, brandsRes] = await Promise.all([
        authAxios.get('/admin/categories/'),
        authAxios.get('/admin/brands/')
      ]);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);

      // Nếu là edit mode, fetch product data
      if (isEditMode) {
        const productRes = await authAxios.get(`/admin/products/${id}/`);
        const product = productRes.data;
        
        // Set form values
        form.setFieldsValue({
          name: product.name,
          short_description: product.short_description,
          description: product.description,
          category: product.category?.id,
          brand: product.brand?.id,
          material: product.material,
          price: product.price,
          discount_price: product.discount_price,
          is_active: product.is_active,
          is_featured: product.is_featured,
          is_new: product.is_new,
        });

        // Set images
        if (product.images && product.images.length > 0) {
          const imageList = product.images.map(img => ({
            uid: img.id,
            name: img.alt_text || 'Product Image',
            url: img.image,
            is_main: img.is_main,
            alt_text: img.alt_text,
            order: img.order,
          }));
          setImages(imageList);
        }

        // Set variants
        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants);
        }
      }
      
    } catch (error) {
      message.error('Không thể tải dữ liệu');
      console.error('Fetch error:', error);
    } finally {
      setPageLoading(false);
    }
  };

  // Submit form
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Tạo FormData để gửi cả text và file
      const formData = new FormData();
      
      // Thêm thông tin sản phẩm
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      
      // Thêm ảnh mới (chỉ những ảnh có file)
      images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
          formData.append(`image_${image.uid}_is_main`, image.is_main);
          formData.append(`image_${image.uid}_alt_text`, image.alt_text || '');
          formData.append(`image_${image.uid}_order`, image.order || 0);
        }
      });
      
      // Thêm variants
      formData.append('variants', JSON.stringify(variants));
      
      let response;
      if (isEditMode) {
        // Update product
        response = await authAxios.put(`/admin/products/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        // Create product
        response = await authAxios.post('/admin/products/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Thêm sản phẩm thành công!');
      }
      
      navigate('/admin/products/list');
      
    } catch (error) {
      const errorMsg = isEditMode ? 'Có lỗi xảy ra khi cập nhật sản phẩm' : 'Có lỗi xảy ra khi thêm sản phẩm';
      message.error(errorMsg);
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/products/list')}
          style={{ marginRight: 16 }}
        />
        <Title level={2} style={{ margin: 0 }}>
          {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          is_active: true,
          is_featured: false,
          is_new: false,
        }}
      >
        <Row gutter={24}>
          {/* Cột trái - Thông tin sản phẩm */}
          <Col xs={24} lg={16}>
            {/* Thông tin cơ bản */}
            <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên sản phẩm"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                  >
                    <Input placeholder="Nhập tên sản phẩm" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="SKU"
                    name="sku"
                    tooltip="Để trống để tự động tạo SKU"
                  >
                    <Input placeholder="Tự động tạo nếu để trống" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Mô tả ngắn"
                name="short_description"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Mô tả ngắn gọn về sản phẩm"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Mô tả chi tiết"
                name="description"
              >
                <TextArea 
                  rows={6} 
                  placeholder="Mô tả chi tiết về sản phẩm"
                />
              </Form.Item>
            </Card>

            {/* Phân loại */}
            <Card title="Phân loại và thuộc tính" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Danh mục"
                    name="category"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select placeholder="Chọn danh mục">
                      {categories.map(cat => (
                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Thương hiệu"
                    name="brand"
                  >
                    <Select placeholder="Chọn thương hiệu" allowClear>
                      {brands.map(brand => (
                        <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Chất liệu"
                    name="material"
                  >
                    <Input placeholder="Ví dụ: Cotton 100%" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Upload ảnh */}
            <Card title="Hình ảnh sản phẩm" style={{ marginBottom: 24 }}>
              <ProductImageUpload 
                images={images}
                onChange={setImages}
              />
            </Card>

            {/* Variants */}
            <Card title="Biến thể sản phẩm" style={{ marginBottom: 24 }}>
              <ProductVariantsForm
                variants={variants}
                onChange={setVariants}
              />
            </Card>
          </Col>

          {/* Cột phải - Giá và trạng thái */}
          <Col xs={24} lg={8}>
            <Card title="Giá cả" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Giá bán"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0"
                  addonAfter="VND"
                />
              </Form.Item>

              <Form.Item
                label="Giá khuyến mãi"
                name="discount_price"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0"
                  addonAfter="VND"
                />
              </Form.Item>
            </Card>

            <Card title="Trạng thái" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  label="Hiển thị sản phẩm"
                  name="is_active"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Sản phẩm nổi bật"
                  name="is_featured"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Sản phẩm mới"
                  name="is_new"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Space>
            </Card>

            {/* Submit buttons */}
            <Card>
              <Space style={{ width: '100%' }} direction="vertical">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={<SaveOutlined />}
                >
                  Lưu sản phẩm
                </Button>
                
                <Button
                  block
                  onClick={() => navigate('/admin/products/list')}
                >
                  Hủy
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AddProduct;