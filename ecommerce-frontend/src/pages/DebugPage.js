import React, { useState } from 'react';
import { Button, Card, Typography, Space, message } from 'antd';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const DebugPage = () => {
  const [results, setResults] = useState([]);

  const addResult = (test, status, data) => {
    setResults(prev => [...prev, { test, status, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testServerConnection = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/products/');
      addResult('Server Connection', '✅ SUCCESS', `Status: ${response.status}, Products: ${response.data.length}`);
    } catch (error) {
      addResult('Server Connection', '❌ ERROR', error.message);
    }
  };

  const testRegister = async () => {
    try {
      const testData = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'testpass123',
        password2: 'testpass123',
        first_name: 'Test',
        last_name: 'User'
      };

      const response = await axios.post('http://localhost:8000/api/register/', testData);
      addResult('Register API', '✅ SUCCESS', `Status: ${response.status}, User created`);
      message.success('Test register thành công!');
    } catch (error) {
      addResult('Register API', '❌ ERROR', error.response?.data || error.message);
      console.error('Register error:', error);
    }
  };

  const testLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: 'admin',
        password: 'admin12'
      });
      addResult('Login API', '✅ SUCCESS', `Status: ${response.status}, Token received`);
      message.success('Test login thành công!');
    } catch (error) {
      addResult('Login API', '❌ ERROR', error.response?.data || error.message);
      console.error('Login error:', error);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>🔧 API Debug Tool</Title>
      <Paragraph>
        Công cụ này giúp test các API endpoint để debug lỗi đăng nhập và đăng ký.
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Card title="Test Controls">
          <Space wrap>
            <Button onClick={testServerConnection} type="primary">
              Test Server Connection
            </Button>
            <Button onClick={testLogin} type="primary">
              Test Login API
            </Button>
            <Button onClick={testRegister} type="primary">
              Test Register API
            </Button>
            <Button onClick={clearResults} danger>
              Clear Results
            </Button>
          </Space>
        </Card>

        <Card title="Test Results">
          {results.length === 0 ? (
            <Text type="secondary">Chưa có kết quả test nào...</Text>
          ) : (
            <div>
              {results.map((result, index) => (
                <div key={index} style={{ 
                  marginBottom: '12px', 
                  padding: '8px', 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '4px',
                  backgroundColor: result.status.includes('SUCCESS') ? '#f6ffed' : '#fff2f0'
                }}>
                  <Text strong>[{result.timestamp}] {result.test}: </Text>
                  <Text type={result.status.includes('SUCCESS') ? 'success' : 'danger'}>
                    {result.status}
                  </Text>
                  <br />
                  <Text type="secondary">
                    {typeof result.data === 'object' 
                      ? JSON.stringify(result.data, null, 2) 
                      : result.data
                    }
                  </Text>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Backend Checklist">
          <ul>
            <li>✅ Django server đang chạy tại http://localhost:8000</li>
            <li>✅ CORS được cấu hình cho localhost:3000</li>
            <li>✅ REST Framework và JWT được cài đặt</li>
            <li>⚠️ Database được migrate (python manage.py migrate)</li>
            <li>⚠️ Superuser đã được tạo (python manage.py createsuperuser)</li>
          </ul>
        </Card>
      </Space>
    </div>
  );
};

export default DebugPage;