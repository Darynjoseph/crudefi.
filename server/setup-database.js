const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Read and execute the fruit deliveries SQL file
    const sqlFile = path.join(__dirname, 'database', 'init_fruit_deliveries.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sqlContent);
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created and sample data inserted.');
    
    // Test the connection by querying the fruit deliveries table
    const result = await pool.query('SELECT COUNT(*) as count FROM fruit_deliveries');
    console.log(`📈 Found ${result.rows[0].count} fruit delivery records`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();