import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Typography,
  Space,
  Divider,
  message,
  Spin
} from 'antd';
import { 
  EnvironmentOutlined, 
  ArrowLeftOutlined, 
  ArrowRightOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddressForm = ({ onSubmit, onPrevious, loading }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // API endpoints for Vietnam administrative divisions
  const API_BASE = 'https://provinces.open-api.vn/api';

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await axios.get(`${API_BASE}/p/`);
      setProvinces(response.data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      message.error('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    if (!provinceCode) return;
    
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    form.setFieldsValue({ district: undefined, ward: undefined });
    
    try {
      const response = await axios.get(`${API_BASE}/p/${provinceCode}?depth=2`);
      setDistricts(response.data?.districts || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      message.error('Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtCode) => {
    if (!districtCode) return;
    
    setLoadingWards(true);
    setWards([]);
    form.setFieldsValue({ ward: undefined });
    
    try {
      const response = await axios.get(`${API_BASE}/d/${districtCode}?depth=2`);
      setWards(response.data?.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
      message.error('Không thể tải danh sách phường/xã');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (value, option) => {
    setSelectedProvince(option);
    setSelectedDistrict(null);
    form.setFieldsValue({ district: undefined, ward: undefined });
    fetchDistricts(value);
  };

  const handleDistrictChange = (value, option) => {
    setSelectedDistrict(option);
    form.setFieldsValue({ ward: undefined });
    fetchWards(value);
  };

  const handleSubmit = (values) => {
    const addressData = {
      ...values,
      province_name: selectedProvince?.name || '',
      district_name: selectedDistrict?.name || '',
      ward_name: wards.find(w => w.code === values.ward)?.name || '',
      full_address: `${values.detailed_address}, ${wards.find(w => w.code === values.ward)?.name || ''}, ${selectedDistrict?.name || ''}, ${selectedProvince?.name || ''}`
    };
    
    onSubmit(addressData);
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Card 
          title={
            <Space>
              <EnvironmentOutlined />
              <span>Thông tin giao hàng</span>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {/* Personal Information */}
            <Title level={5} style={{ marginBottom: '16px' }}>
              Thông tin người nhận
            </Title>
            
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="full_name"
                  label="Họ và tên"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên' },
                    { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên"
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone_number"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                  ]}
                >
                  <Input 
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email (không bắt buộc)"
              rules={[
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input 
                placeholder="Nhập email để nhận thông báo"
                size="large"
              />
            </Form.Item>

            <Divider />

            {/* Address Information */}
            <Title level={5} style={{ marginBottom: '16px' }}>
              Địa chỉ giao hàng
            </Title>

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="province"
                  label="Tỉnh/Thành phố"
                  rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                >
                  <Select
                    placeholder="Chọn tỉnh/thành phố"
                    size="large"
                    loading={loadingProvinces}
                    showSearch
                    optionFilterProp="children"
                    onChange={handleProvinceChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {provinces.map(province => (
                      <Option key={province.code} value={province.code} name={province.name}>
                        {province.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item
                  name="district"
                  label="Quận/Huyện"
                  rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                >
                  <Select
                    placeholder="Chọn quận/huyện"
                    size="large"
                    loading={loadingDistricts}
                    disabled={!selectedProvince}
                    showSearch
                    optionFilterProp="children"
                    onChange={handleDistrictChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {districts.map(district => (
                      <Option key={district.code} value={district.code} name={district.name}>
                        {district.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item
                  name="ward"
                  label="Phường/Xã"
                  rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                >
                  <Select
                    placeholder="Chọn phường/xã"
                    size="large"
                    loading={loadingWards}
                    disabled={!selectedDistrict}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {wards.map(ward => (
                      <Option key={ward.code} value={ward.code}>
                        {ward.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="detailed_address"
              label="Địa chỉ cụ thể"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ cụ thể' },
                { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự' }
              ]}
            >
              <Input 
                prefix={<HomeOutlined />}
                placeholder="Số nhà, tên đường, xóm, khu vực..."
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Ghi chú (không bắt buộc)"
            >
              <TextArea 
                rows={3}
                placeholder="Ghi chú thêm cho người giao hàng (tầng, lối đi, thời gian giao hàng...)"
                maxLength={200}
                showCount
              />
            </Form.Item>

            {/* Form Actions */}
            <div style={{ marginTop: '24px' }}>
              <Space>
                <Button 
                  icon={<ArrowLeftOutlined />}
                  onClick={onPrevious}
                >
                  Quay lại
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<ArrowRightOutlined />}
                  loading={loading}
                  size="large"
                >
                  Tiếp tục thanh toán
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Col>

      {/* Address Guide */}
      <Col xs={24} lg={8}>
        <Card title="Hướng dẫn nhập địa chỉ">
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ marginBottom: '8px' }}>
              📍 Cách nhập địa chỉ chính xác:
            </Title>
            <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              1. Chọn Tỉnh/Thành phố nơi bạn sinh sống<br/>
              2. Chọn Quận/Huyện tương ứng<br/>
              3. Chọn Phường/Xã chính xác<br/>
              4. Nhập số nhà, tên đường, khu vực cụ thể
            </Text>
          </div>

          <Divider />

          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ marginBottom: '8px' }}>
              📝 Ví dụ địa chỉ cụ thể:
            </Title>
            <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              • "123 Nguyễn Văn Cừ, Khu phố 1"<br/>
              • "Số 45 đường Lê Lợi, Tổ 3"<br/>
              • "Chung cư ABC, Tầng 5, Căn 501"
            </Text>
          </div>

          <Divider />

          <div>
            <Title level={5} style={{ marginBottom: '8px' }}>
              🚚 Lưu ý giao hàng:
            </Title>
            <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              • Thời gian giao hàng: 1-3 ngày làm việc<br/>
              • Phí ship: 30.000₫ toàn quốc<br/>
              • Hỗ trợ giao hàng 24/7
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default AddressForm;