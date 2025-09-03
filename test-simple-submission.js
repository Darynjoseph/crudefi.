const http = require('http');

// Very simple test data
const simpleDelivery = {
  date: '2025-01-15',
  supplier_name: 'Test Supplier',
  fruit_type: 'Avocado',
  weight: 100,
  price_per_kg: 50
};

function testSimpleSubmission() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(simpleDelivery);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/fruit-deliveries',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    console.log('🧪 Testing simple delivery submission...');
    console.log('📤 Sending data:', JSON.stringify(simpleDelivery, null, 2));

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📡 Response Status: ${res.statusCode}`);
        console.log(`📦 Response Body: ${responseData}`);
        
        try {
          const jsonData = JSON.parse(responseData);
          console.log('📋 Parsed Response:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('⚠️  Response is not valid JSON');
        }
        
        resolve({
          status: res.statusCode,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test if the server is running first
function testServerHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/test-db',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('🏥 Server Health Check:', res.statusCode === 200 ? '✅ Healthy' : '❌ Unhealthy');
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (error) => {
      console.log('🏥 Server Health Check: ❌ Unreachable');
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    // Test server health first
    await testServerHealth();
    
    // Then test delivery submission
    await testSimpleSubmission();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTests();