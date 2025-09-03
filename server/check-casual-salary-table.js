require('dotenv').config();
const pool = require('./db');

async function checkCasualSalaryTable() {
  try {
    console.log('🔍 Checking casual_staff_salary table structure...');
    
    // Get table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'casual_staff_salary' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 casual_staff_salary table structure:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(not null)' : '(nullable)'}`);
    });
    
    // Get sample data
    const sampleData = await pool.query('SELECT * FROM casual_staff_salary LIMIT 3');
    console.log(`\n📊 Sample data (${sampleData.rows.length} records):`);
    if (sampleData.rows.length > 0) {
      console.log(JSON.stringify(sampleData.rows[0], null, 2));
    }
    
    // Count records
    const countResult = await pool.query('SELECT COUNT(*) as count FROM casual_staff_salary');
    console.log(`\n📈 Total records: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  } finally {
    await pool.end();
  }
}

checkCasualSalaryTable();