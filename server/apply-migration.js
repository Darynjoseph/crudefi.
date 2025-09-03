const pool = require('./db');

async function applyMigration() {
  try {
    console.log('🔄 Applying database migration for role-based payments...');
    
    // Step 1: Add role_rate column to shifts table
    console.log('📝 Adding role_rate column to shifts table...');
    try {
      await pool.query('ALTER TABLE shifts ADD COLUMN role_rate DECIMAL');
      console.log('✅ Added role_rate column');
    } catch (error) {
      console.log(`⚠️  role_rate column might already exist: ${error.message}`);
    }
    
    // Step 2: Add unique constraint to salary_records
    console.log('📝 Adding unique constraint to salary_records...');
    try {
      await pool.query('ALTER TABLE salary_records ADD CONSTRAINT unique_salary_per_shift UNIQUE (shift_id)');
      console.log('✅ Added unique constraint');
    } catch (error) {
      console.log(`⚠️  Constraint might already exist: ${error.message}`);
    }
    
    // Step 3: Add foreign key constraint for role
    console.log('📝 Adding foreign key constraint for role...');
    try {
      await pool.query('ALTER TABLE shifts ADD CONSTRAINT fk_shifts_role FOREIGN KEY (role) REFERENCES roles(role_name)');
      console.log('✅ Added foreign key constraint');
    } catch (error) {
      console.log(`⚠️  Foreign key might already exist: ${error.message}`);
    }
    
    // Step 4: Update existing shifts with default role (if any exist)
    console.log('📝 Checking for existing shifts without roles...');
    const shiftsWithoutRole = await pool.query('SELECT COUNT(*) FROM shifts WHERE role IS NULL');
    const count = parseInt(shiftsWithoutRole.rows[0].count);
    
    if (count > 0) {
      console.log(`📝 Found ${count} shifts without roles. Setting default role...`);
      
      // Get the first available role
      const firstRole = await pool.query('SELECT role_name, base_daily_rate FROM roles LIMIT 1');
      
      if (firstRole.rows.length > 0) {
        const { role_name, base_daily_rate } = firstRole.rows[0];
        await pool.query(
          'UPDATE shifts SET role = $1, role_rate = $2 WHERE role IS NULL',
          [role_name, base_daily_rate]
        );
        console.log(`✅ Updated ${count} shifts with default role: ${role_name}`);
      } else {
        console.log('⚠️  No roles found in roles table. Please create roles first.');
      }
    } else {
      console.log('✅ No shifts need role updates');
    }
    
    // Step 5: Make role and role_rate NOT NULL
    console.log('📝 Setting role and role_rate as NOT NULL...');
    try {
      await pool.query('ALTER TABLE shifts ALTER COLUMN role SET NOT NULL');
      console.log('✅ Set role as NOT NULL');
    } catch (error) {
      console.log(`⚠️  Role NOT NULL constraint: ${error.message}`);
    }
    
    try {
      await pool.query('ALTER TABLE shifts ALTER COLUMN role_rate SET NOT NULL');
      console.log('✅ Set role_rate as NOT NULL');
    } catch (error) {
      console.log(`⚠️  Role_rate NOT NULL constraint: ${error.message}`);
    }
    
    // Step 6: Add check constraint for positive role_rate
    console.log('📝 Adding check constraint for positive role_rate...');
    try {
      await pool.query('ALTER TABLE shifts ADD CONSTRAINT check_positive_role_rate CHECK (role_rate > 0)');
      console.log('✅ Added positive role_rate constraint');
    } catch (error) {
      console.log(`⚠️  Check constraint might already exist: ${error.message}`);
    }
    
    // Step 7: Add index for performance
    console.log('📝 Adding index on role column...');
    try {
      await pool.query('CREATE INDEX idx_shifts_role ON shifts(role)');
      console.log('✅ Added role index');
    } catch (error) {
      console.log(`⚠️  Index might already exist: ${error.message}`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Test the final structure
    console.log('\n🔍 Final table structure verification...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'shifts' 
      AND column_name IN ('role', 'role_rate')
      ORDER BY column_name
    `);
    
    console.log('📋 Final shifts table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    // Check constraints
    const constraints = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'shifts' 
      AND constraint_name IN ('fk_shifts_role', 'check_positive_role_rate')
    `);
    
    console.log('📋 Constraints:');
    constraints.rows.forEach(row => {
      console.log(`  - ${row.constraint_name}: ${row.constraint_type}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
