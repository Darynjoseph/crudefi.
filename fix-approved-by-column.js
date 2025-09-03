const pool = require('./server/db');

async function fixApprovedByColumn() {
  try {
    console.log('🔧 Fixing approved_by column type...\n');
    
    // First check current column type
    const columnCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'fruit_deliveries' 
      AND column_name = 'approved_by'
    `);
    
    console.log('📋 Current column type:', columnCheck.rows[0]);
    
    // Change approved_by from integer to varchar to accept names
    console.log('🔄 Changing approved_by from integer to varchar...');
    
    await pool.query(`
      ALTER TABLE fruit_deliveries 
      ALTER COLUMN approved_by TYPE VARCHAR(255) 
      USING approved_by::VARCHAR
    `);
    
    console.log('✅ Column type changed successfully!');
    
    // Verify the change
    const verifyCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'fruit_deliveries' 
      AND column_name = 'approved_by'
    `);
    
    console.log('📋 New column type:', verifyCheck.rows[0]);
    
    console.log('\n🎉 Fix completed! Now you can use names in the "Approved By" field.');
    
  } catch (error) {
    console.log('❌ Error fixing column:', error.message);
    console.log('Full error:', error);
  } finally {
    await pool.end();
  }
}

fixApprovedByColumn();