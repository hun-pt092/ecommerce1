import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Upload,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import authAxios from '../../api/AuthAxios';

const { Title } = Typography;
const { TextArea } = Input;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Columns cho table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        image ? (
          <Image
            src={image}
            alt="Category"
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="https://via.placeholder.com/50x50?text=No+Image"
          />
        ) : (
          <div style={{ 
            width: 50, 
            height: 50, 
            background: '#f0f0f0', 
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderOutlined style={{ fontSize: 20, color: '#999' }} />
          </div>
        )
      ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.slug && (
            <div style={{ fontSize: 12, color: '#999' }}>
              Slug: {record.slug}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <div style={{ maxWidth: 300 }}>
          {text || <span style={{ color: '#999' }}>Chưa có mô tả</span>}
        </div>
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
      title: 'Số sản phẩm',
      key: 'product_count',
      width: 120,
      render: (_, record) => (
        <Tag color="blue">
          {record.product_count || 0} sản phẩm
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa danh mục này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get('/categories/');
      const categoriesData = response.data.results || response.data || [];
      
      // Get product count for each category
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const productsResponse = await authAxios.get(`/products/?category=${category.id}`);
            const products = productsResponse.data.results || productsResponse.data || [];
            return {
              ...category,
              product_count: Array.isArray(products) ? products.length : 0
            };
          } catch (error) {
            return { ...category, product_count: 0 };
          }
        })
      );
      
      setCategories(categoriesWithCount);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('is_active', values.is_active ? 'true' : 'false');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingCategory) {
        // Update
        await authAxios.put(`/categories/${editingCategory.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Cập nhật danh mục thành công!');
      } else {
        // Create
        await authAxios.post('/categories/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Thêm danh mục thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      message.error(editingCategory ? 'Không thể cập nhật danh mục' : 'Không thể thêm danh mục');
      console.error('Error submitting category:', error);
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      is_active: category.is_active,
    });
    setImagePreview(category.image);
    setIsModalVisible(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await authAxios.delete(`/categories/${id}/`);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      if (error.response?.status === 400) {
        message.error('Không thể xóa danh mục đang có sản phẩm');
      } else {
        message.error('Không thể xóa danh mục');
      }
      console.error('Error deleting category:', error);
    }
  };

  // Handle image upload
  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle modal close
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            <FolderOutlined /> Quản lý Danh mục
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            size="large"
          >
            Thêm danh mục mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_active: true,
          }}
        >
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="VD: Áo thun, Quần jean, Giày dép..." size="large" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về danh mục..."
            />
          </Form.Item>

          <Form.Item
            label="Ảnh danh mục"
          >
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleImageChange}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="category"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
