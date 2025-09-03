// Load environment variables first, before any other imports
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env file in the server directory
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Failed to load .env file:', result.error);
  process.exit(1);
}

// Create a logs directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logDir, 'server.log'), { flags: 'a' });

// Custom logging function that writes to both console and file
const log = (...args) => {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Log to console (original console.log)
  const originalConsoleLog = console._originalLog || console.log;
  originalConsoleLog.apply(console, args);
  
  // Write to log file
  logStream.write(logMessage);
};

// Preserve original console.log and replace with our custom logger
console._originalLog = console.log;
console.log = log;

const express = require('express');
const cors = require('cors');

// Log process info
log('=== Server starting ===');
log('Node version:', process.version);
log('Platform:', process.platform);
log('Current working directory:', process.cwd());
log('Environment:', process.env.NODE_ENV || 'development');

// Log environment variables (without sensitive data)
log('Environment variables:');
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('DB_') || key === 'NODE_ENV' || key === 'PORT') {
    log(`  ${key}=${key.includes('PASSWORD') ? '***' : value}`);
  }
});

const { Pool } = require('pg');
const { addPermissionHelpers } = require('./middleware/authMiddleware');

// Create a connection string for the database
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Log the connection string (without password) for debugging
console.log('Database connection string:', 
  `postgresql://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
);

// Create the pool with the connection string
const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idle_in_transaction_session_timeout: 10000
});

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const app = express();
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// Add permission helpers to authenticated requests
app.use(addPermissionHelpers);

// MOCK USER FOR TESTING PERMISSIONS (DISABLE IN PRODUCTION)
// Uncomment the lines below for testing without authentication

app.use((req, res, next) => {
  req.user = {
    id: 1,
    name: 'Test User ',
    email: 'test@example.com',
    role: 'admin' // Change this for testing: 'manager', 'staff', 'viewer'
  };
  next();
});


// TEST DB CONNECTION - SIMPLIFIED VERSION
app.get("/test-db-simple", async (req, res) => {
  const { Pool } = require('pg');
  
  // Log environment variables for debugging
  console.log('Environment variables in /test-db-simple:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_PORT:', process.env.DB_PORT);
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  
  const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  
  console.log('Using connection string:', 
    `postgresql://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  );
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });
  
  try {
    console.log('Getting client from pool...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    console.log('Executing test query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    
    console.log('Query result:', result.rows[0]);
    
    client.release();
    await pool.end();
    
    res.json({
      status: '✅ Connected to DB',
      time: result.rows[0].current_time,
      postgresVersion: result.rows[0].postgres_version,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Log additional debug info
    console.log('Debug info:');
    console.log('- Connection string type:', typeof connectionString);
    console.log('- Password type:', typeof process.env.DB_PASSWORD);
    console.log('- Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
    
    res.status(500).json({
      status: '❌ DB Connection failed',
      error: error.message,
      debug: {
        connectionStringType: typeof connectionString,
        passwordType: typeof process.env.DB_PASSWORD,
        passwordLength: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0
      }
    });
  }
});

app.get("/test-db", async (req, res) => {
  // Simple request logging
  console.log('\n=== /test-db endpoint called ===');
  console.log('Environment:');
  console.log(`- DB_HOST: ${process.env.DB_HOST ? '***set***' : 'NOT SET'}`);
  console.log(`- DB_PORT: ${process.env.DB_PORT || 'NOT SET'}`);
  console.log(`- DB_USER: ${process.env.DB_USER ? '***set***' : 'NOT SET'}`);
  console.log(`- DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  
  let client;
  try {
    console.log('\n1. Getting client from central pool...');
    const startTime = Date.now();
    
    // Get a client from the central pool
    client = await pool.connect();
    const connectionTime = Date.now() - startTime;
    
    console.log(`   - Client obtained in ${connectionTime}ms`);
    console.log(`   - Client process ID: ${client.processID}`);
    
    // Execute a simple test query
    console.log('\n2. Executing test query...');
    const queryStartTime = Date.now();
    const result = await client.query("SELECT NOW() as current_time, version() as postgres_version");
    const queryTime = Date.now() - queryStartTime;
    
    console.log(`   - Query completed in ${queryTime}ms`);
    console.log(`   - PostgreSQL Version: ${result.rows[0].postgres_version}`);
    
    // Prepare and send success response
    const response = { 
      status: "✅ Connected to database successfully",
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      connectionTime: `${connectionTime}ms`,
      queryTime: `${queryTime}ms`,
      postgresVersion: result.rows[0].postgres_version,
      currentTime: result.rows[0].current_time
    };
    
    console.log('\n3. Sending successful response');
    res.json(response);
    
  } catch (error) {
    console.error('\n❌ Database connection error:', error.message);
    
    // Log the error with stack trace
    const errorDetails = {
      message: error.message,
      code: error.code,
      stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') + '\n...' : 'No stack trace'
    };
    
    console.error('Error details:', errorDetails);
    
    // Prepare error response
    const errorResponse = {
      status: "❌ DB Connection failed",
      error: error.message,
      details: {
        code: error.code,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        nodeEnv: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    };
    
    // Add more details for specific error types
    if (error.code === '28P01') { // Invalid password
      errorResponse.details.suggestion = 'Check if the database password in .env is correct';
    } else if (error.code === '3D000') { // Database does not exist
      errorResponse.details.suggestion = 'Verify the database name in .env exists';
    } else if (error.code === 'ECONNREFUSED') {
      errorResponse.details.suggestion = 'Check if PostgreSQL is running and accessible';
    } else if (error.message.includes('password must be a string')) {
      errorResponse.details.suggestion = 'The database password is not being passed as a string. Check your .env file for any special characters or formatting issues.';
    }
    
    res.status(500).json(errorResponse);
    
  } finally {
    log('7. Cleaning up resources...');
    try {
      if (client) {
        log('   - Releasing client back to pool');
        await client.release();
        log('   - Client released');
      }
      if (testPool) {
        log('   - Ending pool');
        await testPool.end();
        log('   - Pool ended');
      }
    } catch (cleanupError) {
      log('Error during cleanup:', cleanupError);
    }
    
    log('=== /test-db request completed ===\n');
    
    // Close the log file stream
    logStream.end();
    log(`Log file closed: ${logFile}`);
  }
});

// ROUTES
const pettyCashRoutes = require('./routes/pettyCashRoutes');
app.use('/api/petty-cash', pettyCashRoutes);

// Staff routes (required for Staff Management page)
const staffRoutes = require('./routes/staffRoutes');
app.use('/api/staff', staffRoutes);

const shiftRoutes = require('./routes/shiftRoutes');
app.use('/api/shifts', shiftRoutes);

const salaryRoutes = require('./routes/salaryRoutes');
app.use('/api/salary', salaryRoutes);

const fruitDeliveryRoutes = require('./routes/fruitDeliveryRoutes');
app.use('/api/fruit-deliveries', fruitDeliveryRoutes);

const supplierRoutes = require('./routes/supplierRoutes');
app.use('/api/suppliers', supplierRoutes);

const fruitRoutes = require('./routes/fruitRoutes');
app.use('/api/fruits', fruitRoutes);

const oilRoutes = require('./routes/oilExtractionRoutes');
app.use('/api/oil-extraction', oilRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const miscExpenseRoutes = require('./routes/miscExpenseRoutes');
app.use('/api/misc-expenses', miscExpenseRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const rolesRoutes = require('./routes/rolesRoutes');
app.use('/api/roles', rolesRoutes);

// Expense management routes
const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

const expenseTypeRoutes = require('./routes/expenseTypeRoutes');
app.use('/api/expense-types', expenseTypeRoutes);

const expenseCategoryRoutes = require('./routes/expenseCategoryRoutes');
app.use('/api/expense-categories', expenseCategoryRoutes);

const assetRoutes = require('./routes/assetRoutes');
app.use('/api/assets', assetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler - fixed for Express v5 compatibility
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Direct database connection test endpoint
app.get('/test-db-direct', async (req, res) => {
  console.log('\n=== /test-db-direct endpoint called ===');
  
  try {
    // Log environment variables
    console.log('Environment variables in request context:');
    console.log('- DB_HOST:', process.env.DB_HOST || 'NOT SET');
    console.log('- DB_PORT:', process.env.DB_PORT || 'NOT SET');
    console.log('- DB_USER:', process.env.DB_USER || 'NOT SET');
    console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
    console.log('- DB_NAME:', process.env.DB_NAME || 'NOT SET');
    
    // Direct database connection test
    console.log('\nAttempting direct database connection...');
    
    // Use the existing pool configuration
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD || ''), // Ensure password is a string
      database: process.env.DB_NAME,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    // Run a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Query result:', result.rows[0]);
    
    // Release the client back to the pool
    await client.release();
    
    // End the pool
    await pool.end();
    
    // Send success response
    res.json({
      status: 'success',
      message: 'Database connection successful',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', {
      message: error.message,
      code: error.code,
      stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') + '\n...' : 'No stack trace',
      errorType: error.constructor.name,
      additionalInfo: {
        isPasswordMissing: !process.env.DB_PASSWORD,
        isPasswordString: typeof process.env.DB_PASSWORD === 'string',
        isPasswordEmpty: process.env.DB_PASSWORD === ''
      }
    });
    
    // Send error response
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        additionalInfo: {
          isPasswordMissing: !process.env.DB_PASSWORD,
          isPasswordString: typeof process.env.DB_PASSWORD === 'string',
          isPasswordEmpty: process.env.DB_PASSWORD === ''
        }
      } : undefined
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n=== Server Information ===`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`👤 Database User: ${process.env.DB_USER}`);
  console.log(`🔗 Test endpoints:`);
  console.log(`   - http://localhost:${PORT}/test-db`);
  console.log(`   - http://localhost:${PORT}/test-db-direct`);
  console.log(`==========================\n`);
});
