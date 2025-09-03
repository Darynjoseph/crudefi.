const http = require('http');

function testAPI() {
  console.log('🔍 Testing API endpoint: http://localhost:5000/test-db');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/test-db',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`\n📡 Response status: ${res.statusCode}`);
    console.log(`📋 Response headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📦 Response body:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });

  req.end();
}

// Wait a moment for server to start, then test
setTimeout(testAPI, 2000);