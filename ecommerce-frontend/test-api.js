// Test API endpoints
const testAPI = async () => {
  const baseURL = 'http://localhost:8000/api/';
  
  console.log('Testing API endpoints...');
  
  // Test 1: Check if server is running
  try {
    const response = await fetch(baseURL + 'products/');
    console.log('✅ Server is running, Products endpoint status:', response.status);
    const data = await response.json();
    console.log('Products data:', data);
  } catch (error) {
    console.log('❌ Server not running or products endpoint error:', error.message);
  }
  
  // Test 2: Test register endpoint
  try {
    const registerData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'testpass123',
      password2: 'testpass123',
      first_name: 'Test',
      last_name: 'User'
    };
    
    const response = await fetch(baseURL + 'register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    });
    
    console.log('Register endpoint status:', response.status);
    const data = await response.json();
    console.log('Register response:', data);
    
    if (response.status === 201) {
      console.log('✅ Register endpoint working');
    } else {
      console.log('⚠️ Register endpoint returned:', response.status);
    }
  } catch (error) {
    console.log('❌ Register endpoint error:', error.message);
  }
  
  // Test 3: Test login endpoint
  try {
    const loginData = {
      username: 'admin',
      password: 'admin12'
    };
    
    const response = await fetch(baseURL + 'token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('Login endpoint status:', response.status);
    const data = await response.json();
    console.log('Login response:', data);
    
    if (response.status === 200 && data.access) {
      console.log('✅ Login endpoint working');
    } else {
      console.log('⚠️ Login endpoint issue');
    }
  } catch (error) {
    console.log('❌ Login endpoint error:', error.message);
  }
};

// Run tests
testAPI();