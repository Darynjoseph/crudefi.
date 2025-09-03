const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Starting database normalization migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'normalize_suppliers_fruits.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Executing migration SQL...');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log('   ✓ Created suppliers table');
    console.log('   ✓ Created fruits table');
    console.log('   ✓ Created oil_extraction_logs table');
    console.log('   ✓ Populated suppliers from existing data');
    console.log('   ✓ Populated fruits from existing data');
    console.log('   ✓ Updated fruit_deliveries with foreign keys');
    console.log('   ✓ Updated oil_extraction_logs with foreign keys');
    console.log('   ✓ Created indexes for performance');
    console.log('   ✓ Created detailed views');
    
    // Verify the migration by showing counts
    console.log('\n📊 Data Verification:');
    
    const suppliersCount = await pool.query('SELECT COUNT(*) FROM suppliers');
    console.log(`   🏪 Suppliers: ${suppliersCount.rows[0].count}`);
    
    const fruitsCount = await pool.query('SELECT COUNT(*) FROM fruits');
    console.log(`   🍎 Fruits: ${fruitsCount.rows[0].count}`);
    
    const deliveriesCount = await pool.query('SELECT COUNT(*) FROM fruit_deliveries WHERE supplier_id IS NOT NULL AND fruit_id IS NOT NULL');
    console.log(`   📦 Deliveries with normalized references: ${deliveriesCount.rows[0].count}`);
    
    const oilLogsCount = await pool.query('SELECT COUNT(*) FROM oil_extraction_logs');
    console.log(`   🛢️  Oil extraction logs: ${oilLogsCount.rows[0].count}`);
    
    // Show sample data
    console.log('\n📋 Sample Data:');
    
    const sampleSuppliers = await pool.query('SELECT supplier_id, supplier_name FROM suppliers LIMIT 3');
    console.log('   Suppliers:');
    sampleSuppliers.rows.forEach(row => {
      console.log(`     - ${row.supplier_id}: ${row.supplier_name}`);
    });
    
    const sampleFruits = await pool.query('SELECT fruit_id, fruit_name FROM fruits LIMIT 5');
    console.log('   Fruits:');
    sampleFruits.rows.forEach(row => {
      console.log(`     - ${row.fruit_id}: ${row.fruit_name}`);
    });
    
    // Test the views
    console.log('\n🔍 Testing Views:');
    const viewTest = await pool.query('SELECT COUNT(*) FROM fruit_deliveries_detailed');
    console.log(`   fruit_deliveries_detailed view: ${viewTest.rows[0].count} records`);
    
    const oilViewTest = await pool.query('SELECT COUNT(*) FROM oil_extraction_logs_detailed');
    console.log(`   oil_extraction_logs_detailed view: ${oilViewTest.rows[0].count} records`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔗 Database connection closed.');
  }
}

// Run if called directly
if (require.main === module) {
  runMigration().then(() => {
    console.log('\n🎉 Migration completed! You can now:');
    console.log('   1. Replace the old controllers with the updated ones');
    console.log('   2. Update the frontend components to use the new API structure');
    console.log('   3. Test the normalized data structure');
    process.exit(0);
  }).catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = runMigration;
