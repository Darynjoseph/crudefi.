const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Log environment variables for debugging
console.log('Environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Create a connection string instead of using an object
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('\nConnection string:', 
  `postgresql://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
);

// Create a new pool with the connection string
const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idle_in_transaction_session_timeout: 10000
});

// Test the connection
async function testConnection() {
  let client;
  try {
    console.log('\n🔌 Attempting to connect to database...');
    
    // Test getting a client from the pool
    console.log('Getting client from pool...');
    client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    // Test a simple query
    console.log('Executing test query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗃️  PostgreSQL version:', result.rows[0].postgres_version);
    
    console.log('\n🎉 Database connection test passed!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log additional debug info
    console.log('\nDebug info:');
    console.log('- Connection string type:', typeof connectionString);
    console.log('- Password type:', typeof process.env.DB_PASSWORD);
    console.log('- Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
    
  } finally {
    // Release the client back to the pool
    if (client) {
      try {
        console.log('Releasing client back to pool');
        await client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    // End the pool
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
