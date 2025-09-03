const pool = require('./db');

async function checkTable() {
  try {
    console.log('🔍 Checking fruit_deliveries table structure...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'fruit_deliveries'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table columns:');
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Test a simple insert
    console.log('\n🧪 Testing direct insert...');
    
    try {
      const insertResult = await pool.query(
        `INSERT INTO fruit_deliveries 
          (date, supplier_name, fruit_type, weight, price_per_kg, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        ['2025-01-15', 'Test Supplier', 'Avocado', 100, 50]
      );
      
      console.log('✅ Direct insert successful!');
      console.log('📦 Created delivery ID:', insertResult.rows[0].id);
      
      // Clean up the test record
      await pool.query('DELETE FROM fruit_deliveries WHERE id = $1', [insertResult.rows[0].id]);
      console.log('🧹 Cleaned up test record');
      
    } catch (insertError) {
      console.log('❌ Direct insert failed:');
      console.log('   Code:', insertError.code);
      console.log('   Message:', insertError.message);
      console.log('   Detail:', insertError.detail);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();