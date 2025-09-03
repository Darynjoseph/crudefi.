const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Debug: Log the current working directory and .env file path
console.log('Current working directory:', process.cwd());
console.log('Loading .env from:', path.resolve(__dirname, '.env'));

console.log('🔍 Testing database connection...');
console.log('Database configuration:');
console.log('- Host:', process.env.DB_HOST);
console.log('- Port:', process.env.DB_PORT);
console.log('- User:', process.env.DB_USER);
console.log('- Database:', process.env.DB_NAME);
console.log('- Password:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function testConnection() {
  try {
    console.log('\n🔌 Attempting to connect to PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗃️  PostgreSQL version:', result.rows[0].postgres_version);
    
    client.release();
    console.log('\n🎉 Database connection test passed!');
  } catch (error) {
    console.log('\n❌ Database connection failed:');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();