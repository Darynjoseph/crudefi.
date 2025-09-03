-- Expense Management System Tables
-- Run this script to create all expense-related tables

-- First, create expense_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS expense_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO expense_categories (category_name, description) VALUES 
    ('Transport', 'Vehicle and transportation related expenses'),
    ('Fuel', 'Fuel and vehicle maintenance expenses'),
    ('Payroll', 'Staff salaries and benefits'),
    ('Operations', 'General operational expenses'),
    ('Depreciation', 'Asset depreciation expenses'),
    ('Miscellaneous', 'Other miscellaneous expenses')
ON CONFLICT (category_name) DO NOTHING;

-- Create expense_types table
CREATE TABLE IF NOT EXISTS expense_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL REFERENCES expense_categories(category_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(type_name, category_id)
);

-- Insert default expense types
INSERT INTO expense_types (type_name, category_id, description) VALUES 
    ('Vehicle Trips', 1, 'Transportation and trip expenses'),
    ('Fuel Purchase', 2, 'Fuel and oil purchases'),
    ('Staff Salaries', 3, 'Employee salary payments'),
    ('General Expenses', 4, 'General operational costs'),
    ('Equipment Depreciation', 5, 'Depreciation of company assets')
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
    cost_per_trip NUMERIC(12,2) DEFAULT 0,
    trips_count INT DEFAULT 1,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create expense_fuel table
CREATE TABLE IF NOT EXISTS expense_fuel (
    fuel_id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
    item VARCHAR(100) NOT NULL,         -- e.g. fuel, filter, oil
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
    days_worked INT DEFAULT 0,
    rate_per_day NUMERIC(12,2) DEFAULT 0,
    gross_amount NUMERIC(12,2) DEFAULT 0,
    deductions NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    asset_id SERIAL PRIMARY KEY,
    asset_name VARCHAR(200) NOT NULL,
    asset_code VARCHAR(50) UNIQUE,
    purchase_date DATE NOT NULL,
    cost NUMERIC(12,2) NOT NULL,
    useful_life_years INT DEFAULT 5,
    depreciation_method VARCHAR(50) DEFAULT 'straight_line',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disposed', 'sold')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- Insert sample data for testing
INSERT INTO expenses (expense_date, type_id, amount, description, notes, approved_by) VALUES
    ('2024-01-15', 1, 5000.00, 'Monthly transport expenses', 'Various trips for business operations', 'Manager'),
    ('2024-01-16', 2, 15000.00, 'Fuel purchase', 'Diesel for company vehicles', 'Manager'),
    ('2024-01-17', 3, 45000.00, 'Staff salaries', 'Monthly salary payments', 'HR Manager')
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE expense_categories IS 'Categories for organizing expense types';
COMMENT ON TABLE expense_types IS 'Specific types of expenses within categories';
COMMENT ON TABLE expenses IS 'Main expense records';
COMMENT ON TABLE expense_line_items IS 'Itemized breakdown of expenses';
COMMENT ON TABLE expense_trips IS 'Trip-specific expense details';
COMMENT ON TABLE expense_fuel IS 'Fuel and vehicle maintenance expenses';
COMMENT ON TABLE expense_payroll IS 'Payroll expense details';
COMMENT ON TABLE assets IS 'Company assets for depreciation tracking';
COMMENT ON TABLE expense_depreciation IS 'Depreciation expense records';