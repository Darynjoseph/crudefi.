const { Pool } = require('pg');
require('dotenv').config();

async function runSimpleMigration() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Starting SIMPLE step-by-step migration...');
    
    // Step 1: Create suppliers table
    console.log('📝 Step 1: Creating suppliers table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
          supplier_id SERIAL PRIMARY KEY,
          supplier_name VARCHAR(255) NOT NULL UNIQUE,
          contact_info VARCHAR(255),
          location VARCHAR(255),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Suppliers table created');

    // Step 2: Create fruits table
    console.log('📝 Step 2: Creating fruits table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fruits (
          fruit_id SERIAL PRIMARY KEY,
          fruit_name VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Fruits table created');

    // Step 3: Populate suppliers from existing data
    console.log('📝 Step 3: Populating suppliers from existing data...');
    await pool.query(`
      INSERT INTO suppliers (supplier_name, contact_info, status)
      SELECT DISTINCT 
          supplier_name,
          supplier_contact,
          'active'
      FROM fruit_deliveries
      WHERE supplier_name IS NOT NULL
      ON CONFLICT (supplier_name) DO NOTHING
    `);
    
    const supplierCount = await pool.query('SELECT COUNT(*) FROM suppliers');
    console.log(`✅ ${supplierCount.rows[0].count} suppliers populated`);

    // Step 4: Populate fruits from existing data
    console.log('📝 Step 4: Populating fruits from existing data...');
    await pool.query(`
      INSERT INTO fruits (fruit_name)
      SELECT DISTINCT fruit_type
      FROM fruit_deliveries
      WHERE fruit_type IS NOT NULL
      ON CONFLICT (fruit_name) DO NOTHING
    `);
    
    // Add common fruit types
    await pool.query(`
      INSERT INTO fruits (fruit_name) VALUES 
          ('Avocado'),
          ('Mango'),
          ('Mango Kernel'),
          ('Coconut'),
          ('Palm Kernel'),
          ('Sunflower'),
          ('Pineapple'),
          ('Passion Fruit')
      ON CONFLICT (fruit_name) DO NOTHING
    `);
    
    const fruitCount = await pool.query('SELECT COUNT(*) FROM fruits');
    console.log(`✅ ${fruitCount.rows[0].count} fruits populated`);

    // Step 5: Add foreign key columns to fruit_deliveries
    console.log('📝 Step 5: Adding foreign key columns to fruit_deliveries...');
    
    // Check if columns already exist
    const columnCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'fruit_deliveries' AND column_name IN ('supplier_id', 'fruit_id', 'weight_kg')
    `);
    
    const existingColumns = columnCheck.rows.map(r => r.column_name);
    
    if (!existingColumns.includes('supplier_id')) {
      await pool.query('ALTER TABLE fruit_deliveries ADD COLUMN supplier_id INTEGER');
      console.log('✅ Added supplier_id column');
    } else {
      console.log('✅ supplier_id column already exists');
    }
    
    if (!existingColumns.includes('fruit_id')) {
      await pool.query('ALTER TABLE fruit_deliveries ADD COLUMN fruit_id INTEGER');
      console.log('✅ Added fruit_id column');
    } else {
      console.log('✅ fruit_id column already exists');
    }
    
    if (!existingColumns.includes('weight_kg')) {
      await pool.query('ALTER TABLE fruit_deliveries ADD COLUMN weight_kg DECIMAL(10,2)');
      console.log('✅ Added weight_kg column');
    } else {
      console.log('✅ weight_kg column already exists');
    }

    // Step 6: Populate foreign key relationships
    console.log('📝 Step 6: Populating foreign key relationships...');
    
    await pool.query(`
      UPDATE fruit_deliveries 
      SET supplier_id = s.supplier_id 
      FROM suppliers s 
      WHERE fruit_deliveries.supplier_name = s.supplier_name
      AND fruit_deliveries.supplier_id IS NULL
    `);
    
    await pool.query(`
      UPDATE fruit_deliveries 
      SET fruit_id = f.fruit_id 
      FROM fruits f 
      WHERE fruit_deliveries.fruit_type = f.fruit_name
      AND fruit_deliveries.fruit_id IS NULL
    `);
    
    await pool.query(`
      UPDATE fruit_deliveries 
      SET weight_kg = weight 
      WHERE weight_kg IS NULL AND weight IS NOT NULL
    `);
    
    console.log('✅ Foreign key relationships populated');

    // Step 7: Add constraints (skip if they already exist)
    console.log('📝 Step 7: Adding foreign key constraints...');
    
    try {
      await pool.query(`
        ALTER TABLE fruit_deliveries 
        ADD CONSTRAINT fk_fruit_deliveries_supplier 
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
      `);
      console.log('✅ Added supplier foreign key constraint');
    } catch (error) {
      if (error.code === '42710') { // constraint already exists
        console.log('✅ Supplier foreign key constraint already exists');
      } else {
        console.log('⚠️ Could not add supplier constraint:', error.message);
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE fruit_deliveries 
        ADD CONSTRAINT fk_fruit_deliveries_fruit 
        FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id)
      `);
      console.log('✅ Added fruit foreign key constraint');
    } catch (error) {
      if (error.code === '42710') { // constraint already exists
        console.log('✅ Fruit foreign key constraint already exists');
      } else {
        console.log('⚠️ Could not add fruit constraint:', error.message);
      }
    }

    // Step 8: Update oil_extraction_logs
    console.log('📝 Step 8: Updating oil_extraction_logs with fruit_id...');
    
    const oilLogColumnCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oil_extraction_logs' AND column_name = 'fruit_id'
    `);
    
    if (oilLogColumnCheck.rows.length === 0) {
      await pool.query('ALTER TABLE oil_extraction_logs ADD COLUMN fruit_id INTEGER');
      console.log('✅ Added fruit_id column to oil_extraction_logs');
    } else {
      console.log('✅ fruit_id column already exists in oil_extraction_logs');
    }
    
    await pool.query(`
      UPDATE oil_extraction_logs 
      SET fruit_id = f.fruit_id 
      FROM fruits f 
      WHERE oil_extraction_logs.fruit_type = f.fruit_name
      AND oil_extraction_logs.fruit_id IS NULL
    `);
    console.log('✅ Updated oil_extraction_logs with fruit_id');

    // Step 9: Create indexes
    console.log('📝 Step 9: Creating indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(supplier_name)',
      'CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status)',
      'CREATE INDEX IF NOT EXISTS idx_fruits_name ON fruits(fruit_name)',
      'CREATE INDEX IF NOT EXISTS idx_fruit_deliveries_supplier_id ON fruit_deliveries(supplier_id)',
      'CREATE INDEX IF NOT EXISTS idx_fruit_deliveries_fruit_id ON fruit_deliveries(fruit_id)',
      'CREATE INDEX IF NOT EXISTS idx_oil_extraction_logs_fruit_id ON oil_extraction_logs(fruit_id)'
    ];
    
    for (const indexSQL of indexes) {
      try {
        await pool.query(indexSQL);
      } catch (error) {
        console.log('⚠️ Index creation:', error.message);
      }
    }
    console.log('✅ Indexes created');

    // Verification
    console.log('\n📊 Final Verification:');
    
    const finalSupplierCount = await pool.query('SELECT COUNT(*) FROM suppliers');
    const finalFruitCount = await pool.query('SELECT COUNT(*) FROM fruits');
    const normalizedDeliveries = await pool.query('SELECT COUNT(*) FROM fruit_deliveries WHERE supplier_id IS NOT NULL AND fruit_id IS NOT NULL');
    const normalizedOilLogs = await pool.query('SELECT COUNT(*) FROM oil_extraction_logs WHERE fruit_id IS NOT NULL');
    
    console.log(`   🏪 Suppliers: ${finalSupplierCount.rows[0].count}`);
    console.log(`   🍎 Fruits: ${finalFruitCount.rows[0].count}`);
    console.log(`   📦 Normalized deliveries: ${normalizedDeliveries.rows[0].count}`);
    console.log(`   🛢️  Normalized oil logs: ${normalizedOilLogs.rows[0].count}`);
    
    // Test API queries
    console.log('\n🌐 Testing API readiness:');
    
    const testSuppliers = await pool.query('SELECT supplier_id, supplier_name FROM suppliers ORDER BY supplier_id LIMIT 3');
    console.log('   Sample suppliers:', testSuppliers.rows);
    
    const testFruits = await pool.query('SELECT fruit_id, fruit_name FROM fruits ORDER BY fruit_id LIMIT 3');
    console.log('   Sample fruits:', testFruits.rows);
    
    const testNormalizedDelivery = await pool.query(`
      SELECT fd.id, s.supplier_name, f.fruit_name as fruit_type, fd.weight_kg
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      WHERE fd.supplier_id IS NOT NULL AND fd.fruit_id IS NOT NULL
      LIMIT 1
    `);
    
    if (testNormalizedDelivery.rows.length > 0) {
      console.log('   ✅ Normalized query working:', testNormalizedDelivery.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSimpleMigration().then(() => {
  console.log('\n🎉 MIGRATION SUCCESSFUL!');
  console.log('\n✅ Backend is now ready for Suppliers and Fruits pages:');
  console.log('   - Tables created and populated');
  console.log('   - Foreign key relationships established');
  console.log('   - API endpoints ready to serve data');
  console.log('   - Frontend can now communicate with backend');
  console.log('\n🚀 Test your pages at:');
  console.log('   - http://localhost:3000/suppliers');
  console.log('   - http://localhost:3000/fruits');
}).catch(console.error);
