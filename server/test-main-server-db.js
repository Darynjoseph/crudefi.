// test-main-server-db.js
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables the same way as in the main server
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Log environment variables for debugging
console.log('Environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Create a pool with the same configuration as in the main server
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idle_in_transaction_session_timeout: 10000
});

// Test the connection
async function testConnection() {
  let client;
  try {
    console.log('\n🔌 Attempting to connect to database...');
    client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗃️  PostgreSQL version:', result.rows[0].postgres_version);
    
    console.log('\n🎉 Database connection test passed!');
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    if (client) {
      try {
        console.log('Releasing client back to pool');
        await client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    try {
      console.log('Ending pool...');
      await pool.end();
      console.log('Pool ended successfully');
    } catch (endError) {
      console.error('Error ending pool:', endError);
    }
  }
}

// Run the test
testConnection();
