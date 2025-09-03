const pool = require('./db');

async function fixConstraints() {
  try {
    console.log('🔍 Checking foreign key constraints...\n');
    
    // Check all constraints on fruit_deliveries table
    const constraints = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'fruit_deliveries'
    `);
    
    console.log('📋 Current constraints:');
    constraints.rows.forEach(c => {
      console.log(`   - ${c.constraint_name}: ${c.constraint_type}`);
    });
    
    // Check foreign key details
    const fkDetails = await pool.query(`
      SELECT kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu 
        ON kcu.constraint_name = ccu.constraint_name
      WHERE kcu.table_name = 'fruit_deliveries' 
        AND kcu.constraint_name = 'fruit_deliveries_approved_by_fkey'
    `);
    
    if (fkDetails.rows.length > 0) {
      console.log('\n🔗 Foreign key details:');
      console.log(`   Column: ${fkDetails.rows[0].column_name}`);
      console.log(`   References: ${fkDetails.rows[0].foreign_table_name}.${fkDetails.rows[0].foreign_column_name}`);
    }
    
    // Check if users table exists
    const usersTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    
    console.log(`\n👥 Users table exists: ${usersTable.rows.length > 0 ? 'Yes' : 'No'}`);
    
    // Solution 1: Drop the foreign key constraint
    console.log('\n🔧 Removing foreign key constraint...');
    await pool.query(`
      ALTER TABLE fruit_deliveries 
      DROP CONSTRAINT fruit_deliveries_approved_by_fkey
    `);
    console.log('✅ Foreign key constraint removed');
    
    // Solution 2: Change the column type to varchar
    console.log('🔄 Changing approved_by to varchar...');
    await pool.query(`
      ALTER TABLE fruit_deliveries 
      ALTER COLUMN approved_by TYPE VARCHAR(255) 
      USING approved_by::VARCHAR
    `);
    console.log('✅ Column type changed to varchar');
    
    // Verify the change
    const verifyCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'fruit_deliveries' 
      AND column_name = 'approved_by'
    `);
    
    console.log('\n📋 New column type:', verifyCheck.rows[0]);
    
    console.log('\n🎉 Fix completed successfully!');
    console.log('✅ You can now use names like "John Manager" in the Approved By field');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Full error:', error);
  } finally {
    await pool.end();
  }
}

fixConstraints();