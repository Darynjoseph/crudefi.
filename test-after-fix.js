const http = require('http');

// Test deliveries to add
const testDeliveries = [
  {
    date: '2025-01-15',
    supplier_name: 'Kakuzi PLC',
    supplier_contact: '+254-700-123456',
    vehicle_number: 'KBA 123A',
    fruit_type: 'Avocado',
    weight: 500,
    price_per_kg: 85,
    ticket_number: 'TK001',
    approved_by: 'John Manager',
    notes: 'High quality avocados from Kakuzi farms'
  },
  {
    date: '2025-01-16',
    supplier_name: 'Del Monte Kenya',
    supplier_contact: '+254-711-987654',
    vehicle_number: 'KBB 456B',
    fruit_type: 'Pineapple',
    weight: 800,
    price_per_kg: 45,
    ticket_number: 'TK002',
    approved_by: 'Sarah Director',
    notes: 'Fresh pineapples for export quality'
  },
  {
    date: '2025-01-17',
    supplier_name: 'Murang\'a Fruit Coop',
    supplier_contact: '+254-722-555333',
    vehicle_number: 'KBC 789C',
    fruit_type: 'Mango',
    weight: 350,
    price_per_kg: 65,
    ticket_number: 'TK003',
    approved_by: 'Mark Supervisor',
    notes: 'Premium Kent mangoes from Murang\'a region'
  }
];

function submitDelivery(deliveryData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(deliveryData);
    
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
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function waitForServer() {
  console.log('⏳ Waiting for server to start...');
  
  for (let i = 0; i < 10; i++) {
    try {
      const healthCheck = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 5000,
          path: '/test-db',
          method: 'GET'
        }, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
      });
      
      if (healthCheck) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (e) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`   Attempt ${i + 1}/10...`);
  }
  
  console.log('❌ Server not responding after 10 attempts');
  return false;
}

async function testFormAfterFix() {
  console.log('🧪 Testing form submission after database fixes...\n');
  
  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('❌ Cannot proceed - server not ready');
    return;
  }
  
  console.log('\n📝 Adding test delivery entries...\n');
  
  let successCount = 0;
  
  for (let i = 0; i < testDeliveries.length; i++) {
    const delivery = testDeliveries[i];
    const totalCost = delivery.weight * delivery.price_per_kg;
    
    console.log(`${i + 1}. ${delivery.supplier_name} - ${delivery.fruit_type}`);
    console.log(`   Weight: ${delivery.weight}kg, Price: KES ${delivery.price_per_kg}/kg, Total: KES ${totalCost.toLocaleString()}`);
    
    try {
      const result = await submitDelivery(delivery);
      
      if (result.status === 201 && result.data.success) {
        console.log(`   ✅ Successfully added! ID: ${result.data.data?.id}`);
        successCount++;
      } else {
        console.log(`   ❌ Failed! Status: ${result.status}`);
        console.log(`   Error: ${result.data.message || JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('📊 Results:');
  console.log(`   ✅ Successful: ${successCount}/${testDeliveries.length}`);
  console.log(`   💰 Total Value: KES ${testDeliveries.reduce((sum, d) => sum + (d.weight * d.price_per_kg), 0).toLocaleString()}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Form submission is now working!');
    console.log('👉 Visit http://localhost:5173 to see your deliveries');
    console.log('🍎 Try adding more deliveries using the form interface');
  }
}

testFormAfterFix();