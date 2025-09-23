import React, { useState } from 'react';
import { Button, Card, Typography, Space, message, Input } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const TestConnectionPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin12');

  const addResult = (test, success, details) => {
    const result = {
      test,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testServerConnection = async () => {
    try {
      console.log('Testing server connection...');
      const response = await axios.get('http://localhost:8000/api/products/');
      addResult('Server Connection', true, `Status: ${response.status}, Products count: ${response.data.length}`);
      message.success('Server connection OK!');
    } catch (error) {
      console.error('Server connection error:', error);
      addResult('Server Connection', false, error.message);
      message.error('Server connection failed!');
    }
  };

  const testLogin = async () => {
    try {
      console.log('Testing login with:', { username, password });
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password
      });
      console.log('Login response:', response.data);
      addResult('Login Test', true, `Access token received: ${response.data.access ? 'YES' : 'NO'}`);
      message.success('Login successful!');
      
      // Test authenticated request
      const authResponse = await axios.get('http://localhost:8000/api/cart/', {
        headers: {
          'Authorization': `Bearer ${response.data.access}`
        }
      });
      addResult('Authenticated Request', true, `Cart data received: ${JSON.stringify(authResponse.data)}`);
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = 'Unknown error';
      if (error.response) {
        errorMsg = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMsg = 'No response from server';
      } else {
        errorMsg = error.message;
      }
      addResult('Login Test', false, errorMsg);
      message.error('Login failed!');
    }
  };

  const testRegister = async () => {
    const testUser = {
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      password2: 'testpass123',
      first_name: 'Test',
      last_name: 'User'
    };

    try {
      console.log('Testing register with:', testUser);
      const response = await axios.post('http://localhost:8000/api/register/', testUser);
      console.log('Register response:', response.data);
      addResult('Register Test', true, `User created successfully: ${JSON.stringify(response.data)}`);
      message.success('Register successful!');
    } catch (error) {
      console.error('Register error:', error);
      let errorMsg = 'Unknown error';
      if (error.response) {
        errorMsg = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
        console.log('Full error response:', error.response);
      } else if (error.request) {
        errorMsg = 'No response from server';  
        console.log('Request error:', error.request);
      } else {
        errorMsg = error.message;
      }
      addResult('Register Test', false, errorMsg);
      message.error('Register failed!');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>🔧 Connection Test</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Test Login Credentials:</Text>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Input 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                style={{ width: '150px' }}
              />
              <Input.Password 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
          </div>
          
          <Space wrap>
            <Button type="primary" onClick={testServerConnection}>
              Test Server
            </Button>
            <Button type="primary" onClick={testLogin}>
              Test Login
            </Button>
            <Button type="primary" onClick={testRegister}>
              Test Register
            </Button>
            <Button onClick={() => setTestResults([])}>
              Clear Results
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="Test Results">
        {testResults.length === 0 ? (
          <Text type="secondary">No tests run yet...</Text>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                margin: '8px 0',
                backgroundColor: result.success ? '#f6ffed' : '#fff2f0',
                border: `1px solid ${result.success ? '#b7eb8f' : '#ffccc7'}`,
                borderRadius: '4px'
              }}
            >
              <div>
                <Text strong>[{result.timestamp}] {result.test}: </Text>
                <Text type={result.success ? 'success' : 'danger'}>
                  {result.success ? '✅ SUCCESS' : '❌ FAILED'}
                </Text>
              </div>
              <div style={{ marginTop: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {result.details}
                </Text>
              </div>
            </div>
          ))
        )}
      </Card>
      
      <Card title="Backend Checklist" style={{ marginTop: '20px' }}>
        <ul>
          <li>Django server: http://localhost:8000</li>
          <li>Admin panel: http://localhost:8000/admin</li>  
          <li>API Products: http://localhost:8000/api/products/</li>
          <li>API Login: http://localhost:8000/api/token/</li>
          <li>API Register: http://localhost:8000/api/register/</li>
        </ul>
      </Card>
    </div>
  );
};

export default TestConnectionPage;