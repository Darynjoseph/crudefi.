const http = require('http');

// Test data for delivery entries
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
  },
  {
    date: '2025-01-18',
    supplier_name: 'Flamingo Horticulture',
    supplier_contact: '+254-733-777888',
    vehicle_number: 'KBD 321D',
    fruit_type: 'Passion Fruit',
    weight: 200,
    price_per_kg: 120,
    ticket_number: 'TK004',
    approved_by: 'Lisa Manager',
    notes: 'Organic passion fruits for juice production'
  },
  {
    date: '2025-01-19',
    supplier_name: 'Nyeri Highland Farms',
    supplier_contact: '+254-744-444555',
    vehicle_number: 'KBE 654E',
    fruit_type: 'Orange',
    weight: 600,
    price_per_kg: 55,
    ticket_number: 'TK005',
    approved_by: 'Peter Coordinator',
    notes: 'Valencia oranges from highland farms'
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
        'Content-Length': Buffer.byteLength(data),
        'Origin': 'http://localhost:5173'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testFormSubmission() {
  console.log('🧪 Testing form submission and adding test delivery entries...\n');
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < testDeliveries.length; i++) {
      const delivery = testDeliveries[i];
      console.log(`${i + 1}. Adding delivery: ${delivery.supplier_name} - ${delivery.fruit_type}`);
      
      try {
        const result = await submitDelivery(delivery);
        
        if (result.status === 201 && result.data.success) {
          console.log(`   ✅ Success! ID: ${result.data.data?.id}, Total: KES ${delivery.weight * delivery.price_per_kg}`);
          successCount++;
        } else {
          console.log(`   ❌ Failed! Status: ${result.status}, Message: ${result.data.message || 'Unknown error'}`);
          console.log(`   Response: ${JSON.stringify(result.data)}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Results Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📈 Total Value Added: KES ${testDeliveries.reduce((sum, d) => sum + (d.weight * d.price_per_kg), 0).toLocaleString()}`);
    
    // Test getting all deliveries to verify they were added
    console.log('\n🔍 Verifying deliveries were added...');
    
    const verifyOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/fruit-deliveries',
      method: 'GET'
    };

    const verifyReq = http.request(verifyOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`📋 Total deliveries in database: ${result.total || 0}`);
          console.log('\n🎉 Test completed! Check your frontend at http://localhost:5173');
        } catch (e) {
          console.log('❌ Error verifying deliveries');
        }
      });
    });

    verifyReq.on('error', (error) => {
      console.log('❌ Error verifying:', error.message);
    });

    verifyReq.end();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testFormSubmission();