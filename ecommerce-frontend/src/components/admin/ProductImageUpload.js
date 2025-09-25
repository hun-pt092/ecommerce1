import React, { useState } from 'react';
import {
  Upload,
  Button,
  Card,
  Image,
  Input,
  Typography,
  message,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  DragOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Text } = Typography;

// Sortable Item component
const SortableImageItem = ({ image, onRemove, setAsMain, updateAltText, handlePreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card
        ref={setNodeRef}
        style={style}
        size="small"
        cover={
          <div style={{ position: 'relative' }}>
            <Image
              src={image.url}
              alt={image.alt_text || image.name}
              height={120}
              style={{ objectFit: 'cover' }}
              preview={false}
            />
            
            {/* Main image badge */}
            {image.is_main && (
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  background: '#52c41a',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                <StarOutlined /> Ảnh chính
              </div>
            )}
            
            {/* Action buttons */}
            <div
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                display: 'flex',
                gap: 4,
              }}
            >
              <Button
                type="primary"
                ghost
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(image.url)}
              />
              <Popconfirm
                title="Xóa ảnh này?"
                onConfirm={() => onRemove(image.uid)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </div>
            
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              style={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: 4,
                borderRadius: 4,
                cursor: 'grab',
              }}
            >
              <DragOutlined />
            </div>
          </div>
        }
        actions={[
          !image.is_main && (
            <Button
              type="link"
              size="small"
              onClick={() => setAsMain(image.uid)}
            >
              Đặt làm ảnh chính
            </Button>
          ),
        ].filter(Boolean)}
      >
        <Input
          placeholder="Mô tả ảnh (Alt text)"
          value={image.alt_text}
          onChange={(e) => updateAltText(image.uid, e.target.value)}
          size="small"
        />
      </Card>
    </Col>
  );
};

const ProductImageUpload = ({ images = [], onChange }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Xử lý upload file
  const handleUpload = ({ file, onSuccess, onError }) => {
    try {
      // Kiểm tra loại file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ có thể upload file ảnh!');
        onError(new Error('Invalid file type'));
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        onError(new Error('File too large'));
        return;
      }

      // Tạo preview URL
      const previewUrl = URL.createObjectURL(file);
      
      const newImage = {
        uid: file.uid,
        name: file.name,
        file: file,
        url: previewUrl,
        is_main: images.length === 0, // Ảnh đầu tiên là ảnh chính
        alt_text: '',
        order: images.length,
      };

      onChange([...images, newImage]);
      onSuccess();
      
    } catch (error) {
      console.error('Upload error:', error);
      onError(error);
    }
  };

  // Xóa ảnh
  const handleRemove = (uid) => {
    const updatedImages = images.filter(img => img.uid !== uid);
    
    // Nếu xóa ảnh chính, đặt ảnh đầu tiên làm ảnh chính
    if (updatedImages.length > 0) {
      const removedImage = images.find(img => img.uid === uid);
      if (removedImage?.is_main && updatedImages.length > 0) {
        updatedImages[0].is_main = true;
      }
    }
    
    onChange(updatedImages);
  };

  // Đặt làm ảnh chính
  const setAsMain = (uid) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_main: img.uid === uid
    }));
    onChange(updatedImages);
  };

  // Cập nhật alt text
  const updateAltText = (uid, altText) => {
    const updatedImages = images.map(img => 
      img.uid === uid ? { ...img, alt_text: altText } : img
    );
    onChange(updatedImages);
  };

  // Sensors cho drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Xử lý drag and drop để sắp xếp thứ tự
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex(img => img.uid === active.id);
      const newIndex = images.findIndex(img => img.uid === over.id);
      
      const newImages = arrayMove(images, oldIndex, newIndex);
      
      // Cập nhật order
      const updatedImages = newImages.map((img, index) => ({
        ...img,
        order: index
      }));

      onChange(updatedImages);
    }
  };

  // Preview ảnh
  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  return (
    <div>
      {/* Upload button */}
      <Upload
        customRequest={handleUpload}
        listType="picture-card"
        showUploadList={false}
        multiple
        accept="image/*"
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload ảnh</div>
        </div>
      </Upload>

      {/* Image list */}
      {images.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Danh sách ảnh ({images.length})</Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Kéo thả để sắp xếp thứ tự
          </Text>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map(img => img.uid)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  {images.map((image) => (
                    <SortableImageItem
                      key={image.uid}
                      image={image}
                      onRemove={handleRemove}
                      setAsMain={setAsMain}
                      updateAltText={updateAltText}
                      handlePreview={handlePreview}
                    />
                  ))}
                </Row>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Preview modal */}
      <Image
        style={{ display: 'none' }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          onVisibleChange: setPreviewVisible,
        }}
      />

      {/* Hướng dẫn */}
      {images.length === 0 && (
        <div style={{ 
          marginTop: 16, 
          padding: 16, 
          background: '#f5f5f5', 
          borderRadius: 8,
          textAlign: 'center' 
        }}>
          <Text type="secondary">
            Chưa có ảnh nào. Click "Upload ảnh" để thêm ảnh sản phẩm.
            <br />
            Ảnh đầu tiên sẽ tự động là ảnh chính.
          </Text>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;