const http = require('http');

function testFruitAPI() {
  console.log('🍎 Testing fruit deliveries API endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/fruit-deliveries',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`\n📡 Response status: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📦 Response body:');
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Success:', jsonData.success);
        console.log('📊 Total deliveries:', jsonData.total);
        console.log('📋 Sample data:', jsonData.data ? jsonData.data.slice(0, 1) : 'No data');
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

testFruitAPI();