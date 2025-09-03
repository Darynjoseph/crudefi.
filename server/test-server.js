// Minimal test server to verify routes
require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Create the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication middleware for testing
app.use((req, res, next) => {
  req.user = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };
  next();
});

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
app.get('/test-connection', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    res.json({
      status: 'success',
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Load and use routes
const fruitDeliveryRoutes = require('./routes/fruitDeliveryRoutes');
app.use('/api/fruit-deliveries', fruitDeliveryRoutes);

const staffRoutes = require('./routes/staffRoutes');
app.use('/api/staff', staffRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`\n=== Test Server Running on port ${PORT} ===`);
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`- Test endpoints:`);
  console.log(`  - http://localhost:${PORT}/test-connection`);
  console.log(`  - http://localhost:${PORT}/api/fruit-deliveries`);
  console.log(`  - http://localhost:${PORT}/api/staff`);
  console.log('===================================\n');
});
