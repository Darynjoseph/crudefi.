const pool = require('./db');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    
    // Test if fruit_deliveries table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'fruit_deliveries'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) as count FROM fruit_deliveries');
      console.log(`📊 fruit_deliveries table found with ${count.rows[0].count} records`);
    } else {
      console.log('⚠️  fruit_deliveries table not found. Run setup-database.js first.');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure PostgreSQL is running and database is configured');
    process.exit(1);
  }
}

// Test database connection before starting server
testDatabaseConnection().then(() => {
  // Start the main server
  require('./index.js');
});