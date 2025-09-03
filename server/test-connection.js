const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Log environment variables for debugging
console.log('=== Environment Variables ===');
console.log('DB_HOST:', process.env.DB_HOST ? '***set***' : 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER ? '***set***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '5000');
console.log('============================\n');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Add more detailed logging for the pool
  log: (...messages) => console.log('[POOL]', ...messages),
  // Log when a client is checked out from the pool
  onConnect: (client) => {
    console.log('[POOL] Client connected');
    client.on('notice', (msg) => console.log('[NOTICE]', msg));
    client.on('error', (err) => console.error('[CLIENT ERROR]', err));
  }
};

console.log('=== Database Configuration ===');
console.log(JSON.stringify({
  ...dbConfig,
  password: dbConfig.password ? '***' : 'NOT SET',
  passwordType: typeof dbConfig.password,
  passwordLength: dbConfig.password ? dbConfig.password.length : 0
}, null, 2));
console.log('=============================\n');

// Create a new pool
const pool = new Pool(dbConfig);

// Add event listeners to the pool
pool.on('connect', () => {
  console.log('[POOL] Connected to database');});

pool.on('acquire', (client) => {
  console.log(`[POOL] Client acquired (ID: ${client.processID})`);
});

pool.on('error', (err) => {
  console.error('[POOL ERROR] Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection
async function testConnection() {
  let client;
  try {
    console.log('\n=== Testing Database Connection ===');
    
    // Get a client from the pool
    console.log('1. Getting client from pool...');
    client = await pool.connect();
    console.log('   - Client obtained successfully');
    
    // Run a simple query
    console.log('2. Executing test query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('   - Query executed successfully');
    
    // Log the result
    console.log('\n=== Query Result ===');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].postgres_version);
    console.log('===================');
    
    return { success: true, result: result.rows[0] };
  } catch (error) {
    console.error('\n=== Connection Failed ===');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack.split('\n').slice(0, 3).join('\n') + '\n...');
    
    // Add more specific error handling
    if (error.code === '28P01') {
      console.error('Suggestion: Check if the database password is correct');
    } else if (error.code === '3D000') {
      console.error('Suggestion: Verify the database name is correct and the database exists');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Suggestion: Check if PostgreSQL is running and accessible at the specified host and port');
    } else if (error.message.includes('password must be a string')) {
      console.error('Suggestion: The database password is not being passed as a string. Check your .env file for any special characters or formatting issues.');
    }
    
    return { success: false, error };
  } finally {
    // Release the client back to the pool
    if (client) {
      console.log('\n3. Releasing client back to pool...');
      await client.release();
      console.log('   - Client released');
    }
    
    // End the pool
    console.log('4. Ending pool...');
    await pool.end();
    console.log('   - Pool ended');
    
    console.log('\n=== Test Complete ===');
  }
}

// Run the test
testConnection()
  .then(({ success }) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
