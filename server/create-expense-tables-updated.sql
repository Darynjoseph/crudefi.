-- Updated Expense Management System Tables
-- Works with existing database structure

-- Update existing expense_categories table to add description if it doesn't exist
ALTER TABLE expense_categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Insert additional categories for the expense blueprint
INSERT INTO expense_categories (name, description) VALUES 
    ('People', 'Staff and labor related expenses'),
    ('Operations', 'Day-to-day operational expenses'),
    ('Utilities', 'Utility bills and services'),
    ('Overheads', 'Fixed overhead costs')
ON CONFLICT (name) DO NOTHING;

-- Create expense_types table (referencing existing expense_categories)
CREATE TABLE IF NOT EXISTS expense_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL REFERENCES expense_categories(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(type_name, category_id)
);

-- Insert expense types from your blueprint
INSERT INTO expense_types (type_name, category_id, description) VALUES 
    -- People Category
    ('Payroll', (SELECT id FROM expense_categories WHERE name = 'People'), 'Regular staff salaries and benefits'),
    ('Casual Labourers', (SELECT id FROM expense_categories WHERE name = 'People'), 'Casual and temporary worker payments'),
    
    -- Operations Category  
    ('Waste', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Waste disposal and management trips'),
    ('Firewood', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Firewood purchases for operations'),
    ('Forklift Expenses', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Forklift fuel, service, and repairs'),
    ('Maintenance', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Equipment and facility maintenance'),
    ('Fuel', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Vehicle fuel and oil purchases'),
    ('Laboratory', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Laboratory supplies and equipment'),
    ('Shipment', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Shipping and delivery expenses'),
    ('Material Cost', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Raw materials and supplies'),
    ('Hired Machines', (SELECT id FROM expense_categories WHERE name = 'Operations'), 'Machine rental and hire costs'),
    
    -- Utilities Category
    ('Water', (SELECT id FROM expense_categories WHERE name = 'Utilities'), 'Water bills and usage'),
    ('Electricity Bill', (SELECT id FROM expense_categories WHERE name = 'Utilities'), 'Electricity and power costs'),
    
    -- Assets Category (use existing or create)
    ('Machine Depreciation', (SELECT id FROM expense_categories WHERE name = 'Assets' OR name = 'Depreciation'), 'Depreciation of machinery and equipment'),
    
    -- Overheads Category
    ('Insurance', (SELECT id FROM expense_categories WHERE name = 'Overheads'), 'Insurance premiums and coverage'),
    ('Rent', (SELECT id FROM expense_categories WHERE name = 'Overheads'), 'Property and equipment rental'),
    ('Miscellaneous', (SELECT id FROM expense_categories WHERE name = 'Overheads'), 'Other miscellaneous expenses')
ON CONFLICT (type_name, category_id) DO NOTHING;

-- Create main expenses table
CREATE TABLE IF NOT EXISTS expenses (
    expense_id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    type_id INT NOT NULL REFERENCES expense_types(type_id),
    amount NUMERIC(12,2) DEFAULT 0, -- for flat expenses
    description TEXT,
    notes TEXT,
    created_by INT,       -- optional: user who recorded
    approved_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create expense_line_items table
CREATE TABLE IF NOT EXISTS expense_line_items (
    line_id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    qty NUMERIC(10,2) DEFAULT 1,
    unit_price NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create expense_trips table
CREATE TABLE IF NOT EXISTS expense_trips (
    trip_id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
    trip_date DATE NOT NULL,
    trip_type VARCHAR(100),
    destination VARCHAR(200),
    shipment_type VARCHAR(100),
    machine_type VARCHAR(100),
    hire_date DATE,
    days_used INT,
    cost_per_trip NUMERIC(12,2) DEFAULT 0,
    trips_count INT DEFAULT 1,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create expense_fuel table
CREATE TABLE IF NOT EXISTS expense_fuel (
    fuel_id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
    item VARCHAR(100) NOT NULL,         -- e.g. fuel, filter, oil, spare parts
    service_type VARCHAR(100),          -- for maintenance services
    quantity NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create expense_payroll table
CREATE TABLE IF NOT EXISTS expense_payroll (
    payroll_id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
    staff_id INT REFERENCES staff(staff_id),
    staff_name VARCHAR(255), -- fallback if staff_id is null
    worker_type VARCHAR(50) DEFAULT 'regular',
    days_worked INT DEFAULT 0,
    rate_per_day NUMERIC(12,2) DEFAULT 0,
    gross_amount NUMERIC(12,2) DEFAULT 0,
    deductions NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Update existing assets table if needed
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS asset_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS useful_life_years INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS depreciation_method VARCHAR(50) DEFAULT 'straight_line',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add constraint for asset status if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_status_check') THEN
        ALTER TABLE assets ADD CONSTRAINT assets_status_check 
        CHECK (status IN ('active', 'disposed', 'sold'));
    END IF;
END $$;

-- Create expense_depreciation table
CREATE TABLE IF NOT EXISTS expense_depreciation (
    dep_id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
    asset_id INT NOT NULL REFERENCES assets(asset_id),
    depreciation_amount NUMERIC(12,2) NOT NULL,
    period DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expense_line_items_expense ON expense_line_items(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_trips_expense ON expense_trips(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_fuel_expense ON expense_fuel(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_payroll_expense ON expense_payroll(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_payroll_staff ON expense_payroll(staff_id);
CREATE INDEX IF NOT EXISTS idx_expense_depreciation_expense ON expense_depreciation(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_depreciation_asset ON expense_depreciation(asset_id);

-- Create the expense type mapping view
CREATE OR REPLACE VIEW expense_type_mapping AS
SELECT 
    et.type_name,
    ec.name as category_name,
    CASE 
        WHEN et.type_name IN ('Payroll', 'Casual Labourers') THEN 'expense_payroll'
        WHEN et.type_name IN ('Waste', 'Shipment', 'Hired Machines') THEN 'expense_trips'
        WHEN et.type_name IN ('Firewood', 'Forklift Expenses', 'Maintenance', 'Fuel') THEN 'expense_fuel'
        WHEN et.type_name IN ('Laboratory', 'Material Cost', 'Miscellaneous') THEN 'expense_line_items'
        WHEN et.type_name = 'Machine Depreciation' THEN 'expense_depreciation'
        WHEN et.type_name IN ('Water', 'Electricity Bill', 'Insurance', 'Rent') THEN 'expenses_only'
        ELSE 'expenses_only'
    END as detail_table,
    CASE 
        WHEN et.type_name IN ('Payroll', 'Casual Labourers') THEN 'staff_id, days_worked, rate_per_day, gross_amount, deductions, net_amount'
        WHEN et.type_name = 'Waste' THEN 'trip_date, trip_type, trips_count, cost_per_trip, total'
        WHEN et.type_name = 'Shipment' THEN 'trip_date, shipment_type, trips_count, cost_per_trip, total'
        WHEN et.type_name = 'Hired Machines' THEN 'machine_type, hire_date, days_used, cost_per_trip (cost_per_day), total'
        WHEN et.type_name IN ('Firewood', 'Fuel') THEN 'item, quantity, unit_cost, total'
        WHEN et.type_name IN ('Forklift Expenses', 'Maintenance') THEN 'item (fuel/service/repair/spare part), quantity, unit_cost, total'
        WHEN et.type_name IN ('Laboratory', 'Material Cost', 'Miscellaneous') THEN 'item_name, qty, unit_price, discount, total'
        WHEN et.type_name = 'Machine Depreciation' THEN 'asset_id, depreciation_amount, period'
        WHEN et.type_name IN ('Water', 'Electricity Bill', 'Insurance', 'Rent') THEN 'amount (flat expense)'
        ELSE 'amount (flat expense)'
    END as key_columns
FROM expense_types et
JOIN expense_categories ec ON et.category_id = ec.id
ORDER BY ec.name, et.type_name;

-- Insert sample data for flat expenses
INSERT INTO expenses (expense_date, type_id, amount, description, notes, approved_by, status) VALUES
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Water'), 15000.00, 'Monthly water bill', 'January 2024 water usage', 'Manager', 'approved'),
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Electricity Bill'), 45000.00, 'Monthly electricity bill', 'January 2024 power consumption', 'Manager', 'approved'),
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Rent'), 50000.00, 'Monthly office rent', 'January 2024 rent payment', 'Manager', 'approved'),
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Insurance'), 25000.00, 'Monthly insurance premium', 'Equipment and liability insurance', 'Manager', 'approved')
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE expense_types IS 'Specific types of expenses within categories';
COMMENT ON TABLE expenses IS 'Main expense records';
COMMENT ON TABLE expense_line_items IS 'Itemized breakdown of expenses';
COMMENT ON TABLE expense_trips IS 'Trip-specific expense details';
COMMENT ON TABLE expense_fuel IS 'Fuel and vehicle maintenance expenses';
COMMENT ON TABLE expense_payroll IS 'Payroll expense details';
COMMENT ON TABLE expense_depreciation IS 'Depreciation expense records';

-- Display success message and mapping
SELECT 'Expense Management System Created Successfully!' as status;
SELECT 'Expense Type Mapping:' as info;
SELECT * FROM expense_type_mapping;