# 🗃️ Database Normalization Complete Guide

## 📋 Overview

This guide documents the complete normalization of the CrudeFi database structure, separating suppliers and fruits into their own tables while maintaining full functionality and improving data integrity.

## 🏗️ New Database Structure

### 1. **Suppliers Table**

```sql
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL UNIQUE,
    contact_info VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **Fruits Table**

```sql
CREATE TABLE fruits (
    fruit_id SERIAL PRIMARY KEY,
    fruit_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **Updated Fruit Deliveries Table**

```sql
-- New foreign key columns added
ALTER TABLE fruit_deliveries
ADD COLUMN supplier_id INTEGER REFERENCES suppliers(supplier_id),
ADD COLUMN fruit_id INTEGER REFERENCES fruits(fruit_id),
ADD COLUMN weight_kg DECIMAL(10,2),  -- normalized column name
ADD COLUMN total_cost DECIMAL(10,2); -- calculated field
```

### 4. **Updated Oil Extraction Logs Table**

```sql
CREATE TABLE oil_extraction_logs (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    fruit_id INTEGER REFERENCES fruits(fruit_id),
    input_quantity_kg DECIMAL(10,2) NOT NULL,
    oil_extracted_l DECIMAL(10,2) NOT NULL,
    supplied_oil_l DECIMAL(10,2) DEFAULT 0,
    waste_kg DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Migration Process

### Step 1: Run the Migration

```bash
cd server
node run-normalization-migration.js
```

This will:

- ✅ Create new `suppliers` and `fruits` tables
- ✅ Populate them with existing data
- ✅ Add foreign key columns to existing tables
- ✅ Create performance indexes
- ✅ Create detailed views for easy querying
- ✅ Backup existing data

### Step 2: Update Controllers

Replace the old controllers with the updated versions:

```bash
# Backup old controllers
mv controllers/fruitDeliveryController.js controllers/fruitDeliveryController_old.js
mv controllers/oilExtractionController.js controllers/oilExtractionController_old.js

# Use updated controllers
mv controllers/fruitDeliveryController_updated.js controllers/fruitDeliveryController.js
mv controllers/oilExtractionController_updated.js controllers/oilExtractionController.js
```

### Step 3: Update Frontend Components

Replace the old type definitions and API utilities:

```bash
# In client/src/lib/types/
mv delivery.ts delivery_old.ts
mv delivery_normalized.ts delivery.ts

# In client/src/lib/utils/
mv deliveryApi.ts deliveryApi_old.ts
mv deliveryApi_normalized.ts deliveryApi.ts

# Update component imports
# Replace SupplierSelect with SupplierSelect_normalized
# Replace FruitSelect with FruitSelect_normalized
```

## 🚀 New API Endpoints

### Suppliers API (`/api/suppliers`)

- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `GET /api/suppliers/stats` - Get supplier statistics

### Fruits API (`/api/fruits`)

- `GET /api/fruits` - Get all fruits
- `GET /api/fruits/:id` - Get single fruit
- `POST /api/fruits` - Create fruit
- `PUT /api/fruits/:id` - Update fruit
- `DELETE /api/fruits/:id` - Delete fruit
- `GET /api/fruits/stats` - Get fruit statistics

### Updated Fruit Deliveries API (`/api/fruit-deliveries`)

Now uses `supplier_id` and `fruit_id` instead of text fields:

```json
{
  "date": "2024-01-15",
  "supplier_id": 1,
  "fruit_id": 2,
  "weight_kg": 500.0,
  "price_per_kg": 85.0,
  "supplier_contact": "+254 711 123456",
  "vehicle_number": "KBA 123A",
  "ticket_number": "TKT001",
  "approved_by": "John Manager",
  "notes": "High quality fruits"
}
```

### Updated Oil Extraction API (`/api/oil-extraction`)

Now uses `fruit_id` and includes calculated yield/efficiency:

```json
{
  "date": "2024-01-15",
  "fruit_id": 1,
  "input_quantity_kg": 500.0,
  "oil_extracted_l": 65.0,
  "supplied_oil_l": 60.0,
  "waste_kg": 380.0,
  "notes": "High quality batch",
  "created_by": "John Staff"
}
```

## 📊 Database Views

Two convenient views are created for easy querying:

### `fruit_deliveries_detailed`

Combines fruit deliveries with supplier and fruit names:

```sql
SELECT * FROM fruit_deliveries_detailed;
-- Returns: id, date, supplier_name, fruit_type, weight_kg, etc.
```

### `oil_extraction_logs_detailed`

Combines oil logs with fruit names and calculated metrics:

```sql
SELECT * FROM oil_extraction_logs_detailed;
-- Returns: id, date, fruit_type, input_quantity_kg, yield_percent, efficiency_percent, etc.
```

## 🎯 Benefits of Normalization

### 1. **Data Integrity**

- ✅ No more duplicate supplier/fruit names
- ✅ Consistent spelling and formatting
- ✅ Foreign key constraints prevent invalid references

### 2. **Performance**

- ✅ Faster queries with proper indexes
- ✅ Reduced storage space
- ✅ Better query optimization

### 3. **Maintainability**

- ✅ Easy to update supplier information in one place
- ✅ Add new fruits without modifying existing code
- ✅ Better data analysis capabilities

### 4. **Enhanced Features**

- ✅ Supplier management interface
- ✅ Fruit type management
- ✅ Advanced reporting and statistics
- ✅ Better data validation

## 🔧 Frontend Updates Required

### 1. **Form Components**

- Update `AddDeliveryForm` to use `SupplierSelect_normalized` and `FruitSelect_normalized`
- Handle supplier/fruit creation within forms
- Update form validation for IDs instead of text

### 2. **Display Components**

- Update tables to show joined data (supplier_name, fruit_type)
- Update filters to work with new structure
- Add supplier/fruit management pages

### 3. **API Calls**

- Replace old API calls with normalized versions
- Handle new response formats
- Add error handling for foreign key constraints

## 🚨 Migration Checklist

- [ ] Run database migration script
- [ ] Update server controllers
- [ ] Update route handlers
- [ ] Test API endpoints
- [ ] Update frontend types
- [ ] Update API utilities
- [ ] Update form components
- [ ] Update display components
- [ ] Test CRUD operations
- [ ] Test data integrity
- [ ] Update oil logs page
- [ ] Test complete workflow

## 🔄 Rollback Plan

If issues arise, you can rollback by:

1. **Database**: Use the `fruit_deliveries_backup` table
2. **Controllers**: Use the `_old.js` backup files
3. **Frontend**: Use the `_old.ts` backup files

## 🎉 Next Steps

1. **Complete the migration** using the provided scripts
2. **Test all functionality** thoroughly
3. **Add supplier/fruit management pages** to the admin panel
4. **Update oil logs page** to use the new structure
5. **Enhance reporting** with the new normalized data

The normalization provides a solid foundation for future enhancements and ensures data consistency across your CrudeFi system! 🌟
