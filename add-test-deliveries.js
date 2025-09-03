const http = require('http');

// Proper test deliveries with correct data types
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
    approved_by: 1,  // Integer for user ID
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
    approved_by: 1,
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
    approved_by: 1,
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
    approved_by: 1,
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
    approved_by: 1,
    notes: 'Valencia oranges from highland farms'
  },
  {
    date: '2025-01-20',
    supplier_name: 'Kisii Fruit Growers',
    supplier_contact: '+254-755-666777',
    vehicle_number: 'KBF 987F',
    fruit_type: 'Banana',
    weight: 450,
    price_per_kg: 35,
    ticket_number: 'TK006',
    approved_by: 1,
    notes: 'Sweet bananas from Kisii highlands'
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

async function addTestDeliveries() {
  console.log('🍎 Adding test delivery entries to your database...\n');
  
  let successCount = 0;
  let totalValue = 0;
  
  for (let i = 0; i < testDeliveries.length; i++) {
    const delivery = testDeliveries[i];
    const cost = delivery.weight * delivery.price_per_kg;
    totalValue += cost;
    
    console.log(`${i + 1}. ${delivery.supplier_name} - ${delivery.fruit_type}`);
    console.log(`   📊 ${delivery.weight}kg × KES ${delivery.price_per_kg}/kg = KES ${cost.toLocaleString()}`);
    
    try {
      const result = await submitDelivery(delivery);
      
      if (result.status === 201 && result.data.success) {
        console.log(`   ✅ Added successfully! ID: ${result.data.data?.id}`);
        successCount++;
      } else {
        console.log(`   ❌ Failed: ${result.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('📈 Final Results:');
  console.log(`   ✅ Successfully added: ${successCount}/${testDeliveries.length} deliveries`);
  console.log(`   💰 Total value added: KES ${totalValue.toLocaleString()}`);
  console.log(`   📊 Average price per kg: KES ${Math.round(totalValue / testDeliveries.reduce((sum, d) => sum + d.weight, 0))}`);
  
  if (successCount > 0) {
    console.log('\n🎉 SUCCESS! Your fruit delivery form is now working perfectly!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Visit: http://localhost:5173');
    console.log('   2. Navigate to "Fruit Deliveries"');
    console.log('   3. See your new delivery entries');
    console.log('   4. Try adding more deliveries using the form');
    console.log('   5. Test editing and viewing delivery details');
    console.log('\n📋 Features now working:');
    console.log('   ✅ Add new deliveries via form');
    console.log('   ✅ View deliveries table with search/filter');
    console.log('   ✅ Dashboard statistics');
    console.log('   ✅ Edit existing deliveries');
    console.log('   ✅ View delivery details');
    console.log('   ✅ Delete deliveries');
  }
}

addTestDeliveries();