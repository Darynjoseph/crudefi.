const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in the server directory
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 5000,
  ssl: false
};

console.log('Database configuration:');
console.log('- Host:', dbConfig.host);
console.log('- Port:', dbConfig.port);
console.log('- User:', dbConfig.user);
console.log('- Database:', dbConfig.database);
console.log('- Password:', dbConfig.password ? '***set***' : 'NOT SET');
console.log('');

// Create a new pool
const pool = new Pool(dbConfig);

// Test the connection
async function testConnection() {
  let client;
  try {
    console.log('1. Connecting to the database...');
    const startTime = Date.now();
    client = await pool.connect();
    console.log(`   - Connected in ${Date.now() - startTime}ms`);
    
    console.log('2. Running test query...');
    const queryStartTime = Date.now();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log(`   - Query completed in ${Date.now() - queryStartTime}ms`);
    
    console.log('\n✅ Successfully connected to the database!');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   PostgreSQL version:', result.rows[0].postgres_version.split(' ').slice(0, 2).join(' '));
    
  } catch (error) {
    console.error('\n❌ Error connecting to the database:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === '28P01') {
      console.error('   Suggestion: Check if the database password is correct');
    } else if (error.code === '3D000') {
      console.error('   Suggestion: Verify the database exists and the user has access');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Suggestion: Check if PostgreSQL is running and accessible');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.release();
    }
    await pool.end();
  }
}

// Run the test
testConnection();
