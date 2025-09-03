-- Create all required tables for CrudeFi application

-- Fruit Deliveries table
CREATE TABLE IF NOT EXISTS fruit_deliveries (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(255),
    vehicle_number VARCHAR(50),
    fruit_type VARCHAR(100) NOT NULL,
    weight DECIMAL(10,2) NOT NULL CHECK (weight > 0),
    price_per_kg DECIMAL(10,2) NOT NULL CHECK (price_per_kg > 0),
    ticket_number VARCHAR(100),
    approved_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table (needed for staff)
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    base_daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    role_name VARCHAR(100) REFERENCES roles(role_name),
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Terminated')),
    address TEXT,
    emergency_contact VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
    shift_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(staff_id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL DEFAULT 'Regular',
    start_time TIME NOT NULL,
    end_time TIME,
    break_duration INTEGER DEFAULT 0,
    role_rate DECIMAL(10,2) NOT NULL,
    shift_status VARCHAR(20) DEFAULT 'Open' CHECK (shift_status IN ('Open', 'Closed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salary records table (referenced by controllers)
CREATE TABLE IF NOT EXISTS salary_records (
    salary_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(staff_id) ON DELETE CASCADE,
    shift_id INTEGER REFERENCES shifts(shift_id) ON DELETE CASCADE,
    base_amount DECIMAL(10,2) NOT NULL,
    overtime_amount DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (role_name, base_daily_rate, description) VALUES 
    ('Manager', 2500.00, 'Management position'),
    ('Supervisor', 1800.00, 'Supervisory position'),
    ('Worker', 1200.00, 'General worker'),
    ('Driver', 1500.00, 'Vehicle driver'),
    ('Security', 1000.00, 'Security personnel')
ON CONFLICT (role_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fruit_deliveries_date ON fruit_deliveries(date);
CREATE INDEX IF NOT EXISTS idx_fruit_deliveries_supplier ON fruit_deliveries(supplier_name);
CREATE INDEX IF NOT EXISTS idx_staff_national_id ON staff(national_id);
CREATE INDEX IF NOT EXISTS idx_shifts_staff_date ON shifts(staff_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(shift_status);
CREATE INDEX IF NOT EXISTS idx_salary_records_staff ON salary_records(staff_id);

-- Insert sample data for testing
INSERT INTO fruit_deliveries (date, supplier_name, supplier_contact, vehicle_number, fruit_type, weight, price_per_kg, ticket_number, approved_by, notes) VALUES
    ('2024-01-15', 'Kakuzi PLC', '+254 711 123456', 'KBA 123A', 'Avocado', 500.00, 85.00, 'TKT001', 'John Manager', 'Premium quality avocados'),
    ('2024-01-16', 'Del Monte Kenya', '+254 722 789012', 'KCA 456B', 'Pineapple', 300.00, 65.00, 'TKT002', 'Jane Supervisor', 'Fresh pineapples')
ON CONFLICT DO NOTHING;

INSERT INTO staff (first_name, last_name, national_id, phone_number, email, role_name, hire_date, status) VALUES
    ('John', 'Doe', '12345678', '+254 700 111222', 'john.doe@company.com', 'Manager', '2023-01-15', 'Active'),
    ('Jane', 'Smith', '87654321', '+254 700 333444', 'jane.smith@company.com', 'Supervisor', '2023-02-01', 'Active'),
    ('Bob', 'Wilson', '11223344', '+254 700 555666', 'bob.wilson@company.com', 'Worker', '2023-03-01', 'Active')
ON CONFLICT (national_id) DO NOTHING;

COMMENT ON TABLE fruit_deliveries IS 'Stores fruit delivery records';
COMMENT ON TABLE staff IS 'Stores employee information';
COMMENT ON TABLE shifts IS 'Stores work shift records';
COMMENT ON TABLE salary_records IS 'Stores salary calculation records';