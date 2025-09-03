#!/usr/bin/env node
/**
 * Database Setup Script for CrudeFi
 * This script initializes the fruit_deliveries table and populates it with sample data
 */

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runSQL(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`✅ Successfully executed: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error executing ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('🔧 Setting up CrudeFi database...\n');

    // Test database connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Initialize fruit_deliveries table
    console.log('📦 Initializing fruit_deliveries table...');
    await runSQL(path.join(__dirname, '../database/init_fruit_deliveries.sql'));
    
    // Check if data was inserted
    const result = await pool.query('SELECT COUNT(*) FROM fruit_deliveries');
    const count = parseInt(result.rows[0].count);
    
    console.log(`\n📊 Database setup complete!`);
    console.log(`📈 Sample deliveries created: ${count}`);
    console.log(`\n🚀 Your fruit delivery system is ready to use!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Start the server: npm start`);
    console.log(`   2. Access the fruit deliveries page in your app`);
    console.log(`   3. Test adding new deliveries through the UI`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };