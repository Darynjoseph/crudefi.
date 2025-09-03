const pool = require('./server/db');

async function debugCreateError() {
  console.log('🔍 Debugging create delivery error...\n');
  
  try {
    // First, check the table structure
    console.log('1. Checking table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'fruit_deliveries'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });
    
    // Test the exact insert query used by the controller
    console.log('\n2. Testing the insert query...');
    
    const testData = {
      date: '2025-01-15',
      supplier_name: 'Test Supplier',
      supplier_contact: null,
      vehicle_number: null,
      fruit_type: 'Avocado',
      weight: 100,
      price_per_kg: 50,
      ticket_number: null,
      approved_by: null,
      notes: null
    };
    
    console.log('📤 Test data:', JSON.stringify(testData, null, 2));
    
    try {
      const { rows } = await pool.query(
        `INSERT INTO fruit_deliveries 
          (date, supplier_name, supplier_contact, vehicle_number, fruit_type, 
           weight, price_per_kg, ticket_number, approved_by, notes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
         RETURNING *, (weight * price_per_kg) as total_cost`,
        [
          testData.date, 
          testData.supplier_name, 
          testData.supplier_contact, 
          testData.vehicle_number,
          testData.fruit_type, 
          testData.weight, 
          testData.price_per_kg, 
          testData.ticket_number,
          testData.approved_by, 
          testData.notes
        ]
      );
      
      console.log('✅ Insert successful!');
      console.log('📦 Result:', JSON.stringify(rows[0], null, 2));
      
    } catch (insertError) {
      console.log('❌ Insert failed:');
      console.log('   Error code:', insertError.code);
      console.log('   Error message:', insertError.message);
      console.log('   Error detail:', insertError.detail);
      console.log('   Error hint:', insertError.hint);
      console.log('   Full error:', insertError);
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  } finally {
    await pool.end();
  }
}

debugCreateError();