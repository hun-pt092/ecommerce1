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
  const [deletedImageIds, setDeletedImageIds] = useState([]); // Track deleted existing images
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Prevent duplicate API calls

  // Fetch categories, brands và product data (nếu edit mode)
  useEffect(() => {
    if (!isDataLoaded) {
      fetchInitialData();
    }
  }, [id, isDataLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback để set lại form values khi categories và brands đã load xong
  const [productData, setProductData] = useState(null);
  
  useEffect(() => {
    if (isEditMode && productData && categories.length > 0 && brands.length > 0) {
      // Kiểm tra xem form có đang thiếu values không
      const currentValues = form.getFieldsValue();
      if (!currentValues.category || !currentValues.brand) {
        console.log('Fallback: Re-setting form values - current missing values:', {
          category: currentValues.category,
          brand: currentValues.brand
        });
        
        const formValues = {
          name: productData.name,
          short_description: productData.short_description,
          description: productData.description,
          category: productData.category?.id,
          brand: productData.brand?.id,
          material: productData.material,
          price: productData.price,
          discount_price: productData.discount_price,
          is_active: productData.is_active,
          is_featured: productData.is_featured,
          is_new: productData.is_new,
        };
        
        form.setFieldsValue(formValues);
        console.log('Fallback: Form values set to:', formValues);
      }
    }
  }, [categories, brands, productData, isEditMode, form]);

  const fetchInitialData = async () => {
    if (isDataLoaded) {
      console.log('Data already loaded, skipping...');
      return;
    }
    
    try {
      // Fetch categories và brands TRƯỚC
      console.log('Loading categories and brands...');
      const [categoriesRes, brandsRes] = await Promise.all([
        authAxios.get('/admin/categories/'),
        authAxios.get('/admin/brands/')
      ]);
      
      console.log('Categories loaded:', categoriesRes.data.length);
      console.log('Brands loaded:', brandsRes.data.length);
      
      // Set categories và brands NGAY LẬP TỨC - ensure arrays
      const categoriesData = categoriesRes.data.results || categoriesRes.data || [];
      const brandsData = brandsRes.data.results || brandsRes.data || [];
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);

      // Wait a bit để đảm bảo state được update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Nếu là edit mode, fetch product data SAU KHI categories/brands đã sẵn sàng
      if (isEditMode) {
        console.log('Loading product data...');
        const productRes = await authAxios.get(`/admin/products/${id}/`);
        const product = productRes.data;
        
        console.log('=== EDIT MODE DEBUG ===');
        console.log('Product data:', product);
        console.log('Category:', product.category);
        console.log('Brand:', product.brand);
        console.log('Categories loaded:', categoriesRes.data);
        console.log('Brands loaded:', brandsRes.data);
        
        // Lưu product data vào state để fallback useEffect có thể sử dụng
        setProductData(product);
        
        // Prepare form values
        const formValues = {
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
        };
        
        console.log('Form values to set:', formValues);
        
        // Wait a bit để đảm bảo dropdowns đã được render với options
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Set form values
        console.log('Setting form values...');
        form.setFieldsValue(formValues);
        
        // Verify form values were set
        setTimeout(() => {
          const currentValues = form.getFieldsValue();
          console.log('Current form values after set:', currentValues);
        }, 100);

        // Set images
        if (product.images && product.images.length > 0) {
          const imageList = product.images.map((img, index) => ({
            uid: `existing-${img.id}`, // String uid for existing images
            name: img.alt_text || `Product Image ${index + 1}`,
            url: img.image,
            status: 'done', // Mark as uploaded
            is_main: img.is_main,
            alt_text: img.alt_text || '',
            order: img.order || index,
            existingImageId: img.id, // Keep track of existing image ID
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
      setIsDataLoaded(true); // Mark data as loaded to prevent duplicate calls
    }
  };

  // Submit form
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('Form values:', values);
      console.log('Brand value specifically:', values.brand);
      console.log('Category value specifically:', values.category);
      console.log('All form fields from form.getFieldsValue():', form.getFieldsValue());
      console.log('Images:', images);
      console.log('Variants:', variants);
      
      // Tạo FormData để gửi cả text và file
      const formData = new FormData();
      
      // Kiểm tra đặc biệt cho brand field
      if (values.brand === null || values.brand === undefined) {
        console.log('⚠️ BRAND FIELD IS NULL/UNDEFINED!');
        console.log('Brand dropdown options:', brands);
        console.log('Selected brand in form:', form.getFieldValue('brand'));
      }
      
      // Thêm thông tin sản phẩm - ĐĂNG BIỆt XỬ LÝ brand field
      Object.keys(values).forEach(key => {
        const value = values[key];
        
        // Đặc biệt xử lý brand field - cho phép null
        if (key === 'brand') {
          if (value !== undefined) {
            console.log(`✅ Adding ${key}:`, value, '(type:', typeof value, ')');
            formData.append(key, value || ''); // Convert null to empty string
          } else {
            console.log(`❌ SKIPPING ${key} - undefined`);
          }
        }
        // Xử lý các field khác
        else if (value !== undefined && value !== null && value !== '') {
          console.log(`✅ Adding ${key}:`, value);
          formData.append(key, value);
        } else {
          console.log(`❌ SKIPPING ${key} because it is:`, value);
        }
      });
      
      // Debug: Kiểm tra những gì đã được thêm vào FormData
      console.log('=== FORMDATA DEBUG ===');
      for (let [key, value] of formData.entries()) {
        console.log(`FormData contains: ${key} = ${value}`);
      }
      
      // Thêm ảnh (mới và cũ)
      const newImages = [];
      const existingImages = [];
      
      images.forEach((image) => {
        if (image.file) {
          // Ảnh mới (có file)
          newImages.push(image);
          formData.append('images', image.file);
          formData.append(`image_${image.uid}_is_main`, image.is_main);
          formData.append(`image_${image.uid}_alt_text`, image.alt_text || '');
          formData.append(`image_${image.uid}_order`, image.order || 0);
        } else if (image.existingImageId) {
          // Ảnh cũ (cập nhật thông tin)
          existingImages.push({
            id: image.existingImageId,
            is_main: image.is_main,
            alt_text: image.alt_text || '',
            order: image.order || 0
          });
        }
      });
      
      // Gửi thông tin ảnh cũ được cập nhật (chỉ trong edit mode)
      if (isEditMode && existingImages.length > 0) {
        formData.append('existing_images', JSON.stringify(existingImages));
      }
      
      // Gửi danh sách ảnh bị xóa (chỉ trong edit mode)
      if (isEditMode && deletedImageIds.length > 0) {
        formData.append('deleted_image_ids', JSON.stringify(deletedImageIds));
      }
      
      // Thêm variants
      formData.append('variants', JSON.stringify(variants));
      
      if (isEditMode) {
        // Update product
        await authAxios.put(`/admin/products/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        // Create product
        await authAxios.post('/admin/products/', formData, {
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
                      {Array.isArray(categories) && categories.map(cat => (
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
                      {Array.isArray(brands) && brands.map(brand => (
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
                onChange={(newImages) => {
                  // Track deleted existing images
                  if (isEditMode) {
                    const currentExistingIds = images
                      .filter(img => img.existingImageId)
                      .map(img => img.existingImageId);
                    const newExistingIds = newImages
                      .filter(img => img.existingImageId)
                      .map(img => img.existingImageId);
                    
                    const newlyDeleted = currentExistingIds.filter(
                      id => !newExistingIds.includes(id)
                    );
                    
                    if (newlyDeleted.length > 0) {
                      setDeletedImageIds(prev => [...prev, ...newlyDeleted]);
                    }
                  }
                  
                  setImages(newImages);
                }}
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