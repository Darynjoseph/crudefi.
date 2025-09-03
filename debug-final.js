const http = require('http');

// Test with minimal data that matches table structure exactly
const minimalDelivery = {
  date: '2025-01-15',
  supplier_name: 'Test Supplier',
  fruit_type: 'Avocado',
  weight: 100,
  price_per_kg: 50
  // Only required fields, no optional ones
};

function testMinimal() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(minimalDelivery);
    
    console.log('🧪 Testing minimal delivery data...');
    console.log('📤 Sending:', JSON.stringify(minimalDelivery, null, 2));
    
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

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📦 Response: ${responseData}`);
        
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Also test with approved_by as integer
const deliveryWithIntegerApprover = {
  date: '2025-01-15',
  supplier_name: 'Test Supplier 2',
  fruit_type: 'Mango',
  weight: 200,
  price_per_kg: 60,
  approved_by: 1  // Integer instead of string
};

function testWithInteger() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(deliveryWithIntegerApprover);
    
    console.log('\n🧪 Testing with integer approved_by...');
    console.log('📤 Sending:', JSON.stringify(deliveryWithIntegerApprover, null, 2));
    
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

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📦 Response: ${responseData}`);
        
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runFinalDebug() {
  try {
    // Test minimal data first
    const result1 = await testMinimal();
    
    if (result1.status === 201) {
      console.log('✅ Minimal data worked! The fix is successful!');
    }
    
    // Test with integer approved_by
    const result2 = await testWithInteger();
    
    if (result2.status === 201) {
      console.log('✅ Integer approved_by worked!');
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   Minimal: ${result1.status === 201 ? '✅ Success' : '❌ Failed'}`);
    console.log(`   With integer: ${result2.status === 201 ? '✅ Success' : '❌ Failed'}`);
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

runFinalDebug();