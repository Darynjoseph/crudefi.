const { Pool } = require('pg');

// Database configuration using connection string for better reliability
const createDbConfig = () => {
  try {
    // Get all environment variables
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT, 10) || 5432;
    const user = process.env.DB_USER || 'postgres';
    
    // Ensure password is properly handled
    let password = '';
    if (process.env.DB_PASSWORD) {
      // Convert to string and trim
      password = String(process.env.DB_PASSWORD).trim();
      // Log the first and last character of the password (for debugging, not logging the actual password)
      console.log(`Password length: ${password.length}, first char: '${password.charAt(0)}', last char: '${password.charAt(password.length - 1)}'`);
    } else {
      console.log('WARNING: No database password provided in environment variables');
    }
    
    const database = process.env.DB_NAME || 'crudefi_db';
    const ssl = process.env.NODE_ENV === 'production' ? '?sslmode=require' : '';

    // Log configuration (without sensitive data)
    console.log('Database configuration:');
    console.log('- Host:', host);
    console.log('- Port:', port);
    console.log('- User:', user);
    console.log('- Database:', database);
    console.log('- Password:', password ? '***set***' : 'NOT SET');
    console.log('- Password type:', typeof password);
    console.log('- SSL:', ssl ? 'enabled' : 'disabled');

    // Create connection string with proper encoding
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    const connectionString = `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}${ssl}`;
    
    // Log a redacted version of the connection string for debugging
    const redactedConnectionString = `postgresql://${encodedUser}:*****@${host}:${port}/${database}${ssl}`;
    console.log('Using connection string:', redactedConnectionString);
    
    return {
      // Use connection string for connection
      connectionString,
      // Also provide individual parameters as a fallback
      host,
      port,
      user,
      password,
      database,
      // Additional pool configuration
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      // SSL configuration
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false
    };
  } catch (error) {
    console.error('Error creating database configuration:', error);
    throw error;
  }
};

// Create the pool with the connection string
const pool = new Pool(createDbConfig());

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
