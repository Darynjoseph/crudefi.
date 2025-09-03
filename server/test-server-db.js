// Test the exact same database connection that the server uses
const pool = require('./db');

async function testServerDatabase() {
  console.log('🔍 Testing database with server configuration...');
  
  try {
    console.log('📡 Making the same query as /test-db endpoint...');
    const result = await pool.query("SELECT NOW()");
    console.log('✅ Query successful!');
    console.log('⏰ Current time from DB:', result.rows[0].now);
    console.log('📋 Full result:', JSON.stringify(result.rows[0], null, 2));
    
  } catch (err) {
    console.log('❌ Database query failed:');
    console.log('🔍 Error details:');
    console.log('  - Code:', err.code);
    console.log('  - Message:', err.message);
    console.log('  - Stack:', err.stack);
    console.log('  - Full error object:', err);
  }
  
  // Don't close the pool since it might be used by the server
  console.log('\n✅ Test completed');
}

testServerDatabase();