-- Update Expense Categories and Types to Match Blueprint
-- Run this script after creating the basic expense tables

-- Update expense categories to match your blueprint
INSERT INTO expense_categories (category_name, description) VALUES 
    ('People', 'Staff and labor related expenses'),
    ('Operations', 'Day-to-day operational expenses'),
    ('Utilities', 'Utility bills and services'),
    ('Assets', 'Asset depreciation and management'),
    ('Overheads', 'Fixed overhead costs')
ON CONFLICT (category_name) DO NOTHING;

-- Clear existing default expense types (optional - only if you want to start fresh)
-- DELETE FROM expense_types WHERE type_name IN ('Vehicle Trips', 'Fuel Purchase', 'Staff Salaries', 'General Expenses', 'Equipment Depreciation');

-- Insert all expense types from your blueprint
INSERT INTO expense_types (type_name, category_id, description) VALUES 
    -- People Category
    ('Payroll', (SELECT category_id FROM expense_categories WHERE category_name = 'People'), 'Regular staff salaries and benefits'),
    ('Casual Labourers', (SELECT category_id FROM expense_categories WHERE category_name = 'People'), 'Casual and temporary worker payments'),
    
    -- Operations Category  
    ('Waste', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Waste disposal and management trips'),
    ('Firewood', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Firewood purchases for operations'),
    ('Forklift Expenses', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Forklift fuel, service, and repairs'),
    ('Maintenance', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Equipment and facility maintenance'),
    ('Fuel', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Vehicle fuel and oil purchases'),
    ('Laboratory', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Laboratory supplies and equipment'),
    ('Shipment', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Shipping and delivery expenses'),
    ('Material Cost', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Raw materials and supplies'),
    ('Hired Machines', (SELECT category_id FROM expense_categories WHERE category_name = 'Operations'), 'Machine rental and hire costs'),
    
    -- Utilities Category
    ('Water', (SELECT category_id FROM expense_categories WHERE category_name = 'Utilities'), 'Water bills and usage'),
    ('Electricity Bill', (SELECT category_id FROM expense_categories WHERE category_name = 'Utilities'), 'Electricity and power costs'),
    
    -- Assets Category
    ('Machine Depreciation', (SELECT category_id FROM expense_categories WHERE category_name = 'Assets'), 'Depreciation of machinery and equipment'),
    
    -- Overheads Category
    ('Insurance', (SELECT category_id FROM expense_categories WHERE category_name = 'Overheads'), 'Insurance premiums and coverage'),
    ('Rent', (SELECT category_id FROM expense_categories WHERE category_name = 'Overheads'), 'Property and equipment rental'),
    ('Miscellaneous', (SELECT category_id FROM expense_categories WHERE category_name = 'Overheads'), 'Other miscellaneous expenses')
ON CONFLICT (type_name, category_id) DO NOTHING;

-- Update expense_trips table to support your blueprint requirements
ALTER TABLE expense_trips 
ADD COLUMN IF NOT EXISTS shipment_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS machine_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS days_used INT;

-- Add comments to clarify the blueprint mapping
COMMENT ON COLUMN expense_trips.trip_type IS 'For waste disposal, general trips';
COMMENT ON COLUMN expense_trips.shipment_type IS 'For shipment expenses';
COMMENT ON COLUMN expense_trips.machine_type IS 'For hired machines';
COMMENT ON COLUMN expense_trips.hire_date IS 'For hired machines start date';
COMMENT ON COLUMN expense_trips.days_used IS 'For hired machines duration';

-- Update expense_fuel table to support your blueprint
ALTER TABLE expense_fuel 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);

COMMENT ON COLUMN expense_fuel.item IS 'firewood, diesel, petrol, oil, spare parts, services, repairs';
COMMENT ON COLUMN expense_fuel.service_type IS 'Type of service for maintenance expenses';

-- Update expense_payroll to support casual laborers
ALTER TABLE expense_payroll 
ADD COLUMN IF NOT EXISTS worker_type VARCHAR(50) DEFAULT 'regular';

COMMENT ON COLUMN expense_payroll.worker_type IS 'regular, casual, temporary';
COMMENT ON COLUMN expense_payroll.staff_name IS 'Used when staff_id is null for casual workers';

-- Create a view to show the expense type mapping
CREATE OR REPLACE VIEW expense_type_mapping AS
SELECT 
    et.type_name,
    ec.category_name,
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
JOIN expense_categories ec ON et.category_id = ec.category_id
ORDER BY ec.category_name, et.type_name;

-- Insert sample data that follows the blueprint
INSERT INTO expenses (expense_date, type_id, amount, description, notes, approved_by, status) VALUES
    -- Flat expenses (Utilities and Overheads)
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Water'), 15000.00, 'Monthly water bill', 'January 2024 water usage', 'Manager', 'approved'),
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Electricity Bill'), 45000.00, 'Monthly electricity bill', 'January 2024 power consumption', 'Manager', 'approved'),
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Rent'), 50000.00, 'Monthly office rent', 'January 2024 rent payment', 'Manager', 'approved'),
    ('2024-01-15', (SELECT type_id FROM expense_types WHERE type_name = 'Insurance'), 25000.00, 'Monthly insurance premium', 'Equipment and liability insurance', 'Manager', 'approved')
ON CONFLICT DO NOTHING;

-- Display the mapping for verification
SELECT 'Expense Type Mapping Created' as status;
SELECT * FROM expense_type_mapping;