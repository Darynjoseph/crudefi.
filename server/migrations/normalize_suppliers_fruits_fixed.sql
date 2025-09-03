-- Migration: Normalize suppliers and fruits into separate tables (FIXED VERSION)
-- This script creates the new normalized structure for suppliers and fruits

-- 1. Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL UNIQUE,
    contact_info VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create fruits table
CREATE TABLE IF NOT EXISTS fruits (
    fruit_id SERIAL PRIMARY KEY,
    fruit_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Backup existing fruit_deliveries data
CREATE TABLE IF NOT EXISTS fruit_deliveries_backup AS 
SELECT * FROM fruit_deliveries;

-- 4. Populate suppliers table from existing data
INSERT INTO suppliers (supplier_name, contact_info, status)
SELECT DISTINCT 
    supplier_name,
    supplier_contact,
    'active'
FROM fruit_deliveries
WHERE supplier_name IS NOT NULL
ON CONFLICT (supplier_name) DO NOTHING;

-- 5. Populate fruits table from existing data
INSERT INTO fruits (fruit_name)
SELECT DISTINCT fruit_type
FROM fruit_deliveries
WHERE fruit_type IS NOT NULL
UNION
SELECT DISTINCT fruit_type
FROM oil_extraction_logs
WHERE fruit_type IS NOT NULL
ON CONFLICT (fruit_name) DO NOTHING;

-- 6. Add common fruit types that might be missing
INSERT INTO fruits (fruit_name) VALUES 
    ('Avocado'),
    ('Mango'),
    ('Mango Kernel'),
    ('Coconut'),
    ('Palm Kernel'),
    ('Sunflower'),
    ('Pineapple'),
    ('Passion Fruit')
ON CONFLICT (fruit_name) DO NOTHING;

-- 7. Add new foreign key columns to fruit_deliveries
ALTER TABLE fruit_deliveries 
ADD COLUMN IF NOT EXISTS supplier_id INTEGER,
ADD COLUMN IF NOT EXISTS fruit_id INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2);

-- 8. Populate the foreign key relationships
-- Update supplier_id
UPDATE fruit_deliveries 
SET supplier_id = s.supplier_id 
FROM suppliers s 
WHERE fruit_deliveries.supplier_name = s.supplier_name;

-- Update fruit_id
UPDATE fruit_deliveries 
SET fruit_id = f.fruit_id 
FROM fruits f 
WHERE fruit_deliveries.fruit_type = f.fruit_name;

-- Copy weight to weight_kg
UPDATE fruit_deliveries 
SET weight_kg = weight 
WHERE weight_kg IS NULL AND weight IS NOT NULL;

-- 9. Add foreign key constraints
ALTER TABLE fruit_deliveries 
ADD CONSTRAINT IF NOT EXISTS fk_fruit_deliveries_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id);

ALTER TABLE fruit_deliveries 
ADD CONSTRAINT IF NOT EXISTS fk_fruit_deliveries_fruit 
FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id);

-- 10. Update oil_extraction_logs to use fruit_id
ALTER TABLE oil_extraction_logs 
ADD COLUMN IF NOT EXISTS fruit_id INTEGER;

-- Populate fruit_id in oil_extraction_logs
UPDATE oil_extraction_logs 
SET fruit_id = f.fruit_id 
FROM fruits f 
WHERE oil_extraction_logs.fruit_type = f.fruit_name;

-- Add foreign key constraint for oil_extraction_logs
ALTER TABLE oil_extraction_logs 
ADD CONSTRAINT IF NOT EXISTS fk_oil_extraction_logs_fruit 
FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id);

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(supplier_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_fruits_name ON fruits(fruit_name);
CREATE INDEX IF NOT EXISTS idx_fruit_deliveries_supplier_id ON fruit_deliveries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_fruit_deliveries_fruit_id ON fruit_deliveries(fruit_id);
CREATE INDEX IF NOT EXISTS idx_oil_extraction_logs_fruit_id ON oil_extraction_logs(fruit_id);
CREATE INDEX IF NOT EXISTS idx_oil_extraction_logs_date ON oil_extraction_logs(date);

-- 12. Create views for easier querying
CREATE OR REPLACE VIEW fruit_deliveries_detailed AS
SELECT 
    fd.id,
    fd.date,
    s.supplier_name,
    fd.supplier_contact,
    fd.vehicle_number,
    f.fruit_name as fruit_type,
    fd.weight_kg,
    fd.price_per_kg,
    fd.total_cost,
    fd.ticket_number,
    fd.approved_by,
    fd.notes,
    fd.created_at,
    fd.updated_at,
    s.supplier_id,
    f.fruit_id
FROM fruit_deliveries fd
LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id;

CREATE OR REPLACE VIEW oil_extraction_logs_detailed AS
SELECT 
    oel.id,
    oel.date,
    f.fruit_name as fruit_type,
    oel.input_quantity,
    oel.oil_extracted,
    oel.supplied_oil,
    oel.waste,
    oel.notes,
    oel.created_at,
    oel.updated_at,
    f.fruit_id,
    -- Calculated fields
    ROUND((oel.oil_extracted * 0.92 / oel.input_quantity * 100)::numeric, 2) as yield_percent,
    ROUND(((oel.oil_extracted + oel.supplied_oil) * 0.92 / oel.input_quantity * 100)::numeric, 2) as efficiency_percent
FROM oil_extraction_logs oel
LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id;

-- 13. Add comments for documentation
COMMENT ON TABLE suppliers IS 'Normalized suppliers table';
COMMENT ON TABLE fruits IS 'Normalized fruits table';
COMMENT ON VIEW fruit_deliveries_detailed IS 'Detailed view of fruit deliveries with supplier and fruit names';
COMMENT ON VIEW oil_extraction_logs_detailed IS 'Detailed view of oil extraction logs with calculated metrics';
