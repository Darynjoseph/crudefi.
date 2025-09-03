const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

console.log('Attempting to connect with configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  password: dbConfig.password ? '***set***' : 'NOT SET',
});

// Create a new pool
const pool = new Pool(dbConfig);

// Test the connection
async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to the database');
    
    // Run a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', result.rows[0].current_time);
    
    // Check if the test user exists and has admin privileges
    const userResult = await client.query(
      'SELECT usename, usesuper, usecreatedb FROM pg_user WHERE usename = $1',
      [dbConfig.user]
    );
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('\nTest user details:', {
        username: user.usename,
        isSuperuser: user.usesuper,
        canCreateDB: user.usecreatedb
      });
    } else {
      console.log('\nTest user not found in the database');
    }
    
  } catch (error) {
    console.error('Error connecting to the database:', {
      message: error.message,
      code: error.code,
      stack: error.stack.split('\n')[0] // Just show the first line of the stack trace
    });
  } finally {
    if (client) {
      await client.release();
    }
    await pool.end();
  }
}

// Run the test
testConnection();
