import React, { useState } from 'react';
import { Button, Card, message, Space } from 'antd';
import axios from 'axios';

const QuickRegisterTest = () => {
  const [loading, setLoading] = useState(false);

  const testWithExactSameData = async () => {
    setLoading(true);
    
    // Exact same data that worked in test page
    const testData = {
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      password2: 'testpass123',
      first_name: 'Test',
      last_name: 'User'
    };

    console.log('Sending exact same data as test page:', testData);

    try {
      const response = await axios.post('http://localhost:8000/api/register/', testData);
      console.log('SUCCESS:', response.data);
      message.success('Đăng ký thành công với data giống test page!');
    } catch (error) {
      console.error('FAILED with same data:', error);
      if (error.response) {
        console.log('Error response:', error.response.data);
        message.error(`Failed: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error('Network error');
      }
    }
    
    setLoading(false);
  };

  const testWithFormData = async () => {
    setLoading(true);

    // Simulating form data like RegisterPage
    const formData = {
      username: 'testform123',
      email: 'testform@example.com', 
      password: 'testpass123',
      password2: 'testpass123',
      first_name: 'Form',
      last_name: 'Test'
    };

    console.log('Sending form-like data:', formData);

    try {
      const response = await axios.post('http://localhost:8000/api/register/', formData);
      console.log('Form SUCCESS:', response.data);
      message.success('Đăng ký thành công với form data!');
    } catch (error) {
      console.error('Form FAILED:', error);
      if (error.response) {
        console.log('Form Error response:', error.response.data);
        message.error(`Form Failed: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error('Form Network error');
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Card title="🧪 Quick Register Debug">
        <Space direction="vertical" style={{ width: '100%' }}>
          <p>Test register với cùng data như test page thành công:</p>
          
          <Button 
            type="primary" 
            onClick={testWithExactSameData}
            loading={loading}
            block
          >
            Test với exact same data
          </Button>

          <Button 
            onClick={testWithFormData}
            loading={loading}
            block
          >
            Test với form-like data
          </Button>

          <p style={{ fontSize: '12px', color: '#666' }}>
            Mở Console (F12) để xem logs chi tiết
          </p>
        </Space>
      </Card>
    </div>
  );
};

export default QuickRegisterTest;