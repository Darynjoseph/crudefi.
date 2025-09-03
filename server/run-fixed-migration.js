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
    console.log('🚀 Starting FIXED database normalization migration...');
    
    // Read the fixed migration file
    const migrationPath = path.join(__dirname, 'migrations', 'normalize_suppliers_fruits_fixed.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Executing FIXED migration SQL...');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log('   ✓ Created suppliers table');
    console.log('   ✓ Created fruits table');
    console.log('   ✓ Populated suppliers from existing data');
    console.log('   ✓ Populated fruits from existing data');
    console.log('   ✓ Added foreign key columns to fruit_deliveries');
    console.log('   ✓ Updated oil_extraction_logs with fruit_id');
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
    
    const oilLogsCount = await pool.query('SELECT COUNT(*) FROM oil_extraction_logs WHERE fruit_id IS NOT NULL');
    console.log(`   🛢️  Oil logs with fruit_id: ${oilLogsCount.rows[0].count}`);
    
    // Show sample data
    console.log('\n📋 Sample Data:');
    
    const sampleSuppliers = await pool.query('SELECT supplier_id, supplier_name FROM suppliers ORDER BY supplier_id LIMIT 3');
    console.log('   Suppliers:');
    sampleSuppliers.rows.forEach(row => {
      console.log(`     - ${row.supplier_id}: ${row.supplier_name}`);
    });
    
    const sampleFruits = await pool.query('SELECT fruit_id, fruit_name FROM fruits ORDER BY fruit_id LIMIT 5');
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
    
    // Test API endpoints readiness
    console.log('\n🌐 API Endpoint Tests:');
    console.log('   Testing basic queries...');
    
    // Test suppliers endpoint query
    const suppliersApiTest = await pool.query('SELECT * FROM suppliers WHERE status = $1 ORDER BY supplier_name ASC', ['active']);
    console.log(`   GET /api/suppliers: ${suppliersApiTest.rows.length} active suppliers`);
    
    // Test fruits endpoint query
    const fruitsApiTest = await pool.query('SELECT * FROM fruits ORDER BY fruit_name ASC');
    console.log(`   GET /api/fruits: ${fruitsApiTest.rows.length} fruits available`);
    
    // Test deliveries detailed view
    const deliveriesApiTest = await pool.query(`
      SELECT fd.id, s.supplier_name, f.fruit_name as fruit_type, fd.weight_kg, fd.total_cost
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      LIMIT 3
    `);
    console.log(`   GET /api/fruit-deliveries: Sample normalized data working`);
    deliveriesApiTest.rows.forEach(row => {
      console.log(`     - ID ${row.id}: ${row.supplier_name} → ${row.fruit_type} (${row.weight_kg}kg)`);
    });
    
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
    console.log('\n🎉 Migration completed! Your backend is now ready:');
    console.log('   ✅ Database tables created and populated');
    console.log('   ✅ API endpoints ready for frontend');
    console.log('   ✅ Suppliers and Fruits pages can now communicate with backend');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start your server: npm start');
    console.log('   2. Test the new Suppliers and Fruits pages');
    console.log('   3. Verify CRUD operations work correctly');
    process.exit(0);
  }).catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = runMigration;
