const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = 5001; // Different port to avoid conflict with main server

// Middleware to log environment variables
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Environment variables in middleware:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_PORT:', process.env.DB_PORT);
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
  console.log('========================\n');
  next();
});

// Test endpoint to check environment variables
app.get('/env', (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***set***' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    cwd: process.cwd(),
    __dirname: __dirname,
    envPath: path.resolve(__dirname, '.env')
  });
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  console.log('\n=== Testing Database Connection ===');
  
  // Log environment variables at time of request
  console.log('Environment variables in /test-db:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_PORT:', process.env.DB_PORT);
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
  
  // Create a new pool with the same configuration as in the main app
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

  let client;
  try {
    console.log('Attempting to connect to database...');
    client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('Query results:', result.rows[0]);
    
    res.json({
      status: 'success',
      current_time: result.rows[0].current_time,
      postgres_version: result.rows[0].postgres_version,
      environment: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        NODE_ENV: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      status: 'error',
      error: error.message,
      code: error.code,
      environment: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        NODE_ENV: process.env.NODE_ENV,
        PASSWORD_SET: !!process.env.DB_PASSWORD,
        PASSWORD_TYPE: typeof process.env.DB_PASSWORD
      }
    });
    
  } finally {
    if (client) {
      try {
        console.log('Releasing client back to pool');
        client.release();
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
    
    console.log('=== Test completed ===\n');
  }
});

// Start the test server
app.listen(PORT, () => {
  console.log(`\n=== Test server running on http://localhost:${PORT} ===`);
  console.log('Environment variables at startup:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_PORT:', process.env.DB_PORT);
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('===================================\n');
  console.log('Test endpoints:');
  console.log(`- http://localhost:${PORT}/env`);
  console.log(`- http://localhost:${PORT}/test-db`);
  console.log('\nPress Ctrl+C to stop the server\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
