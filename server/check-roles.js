const pool = require('./db');

async function checkRoles() {
  try {
    console.log('🔍 Checking roles table...');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Roles table does not exist');
      return;
    }
    
    console.log('✅ Roles table exists');
    
    // Get table structure
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'roles' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Table structure:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Get records
    const records = await pool.query('SELECT * FROM roles ORDER BY role_name');
    
    console.log(`\n📊 Records found: ${records.rows.length}`);
    if (records.rows.length > 0) {
      console.log('\n🗂️  Role records:');
      records.rows.forEach(role => {
        console.log(`  - ${role.role_name}: KES ${role.base_daily_rate} per day (ID: ${role.role_id})`);
      });
    } else {
      console.log('📝 No role records found in the table');
    }
    
  } catch (error) {
    console.error('❌ Error checking roles:', error.message);
  } finally {
    await pool.end();
  }
}

checkRoles();
