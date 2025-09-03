# Expense Management System

## Overview

This comprehensive expense management system has been added to your CrudeFi application, following your existing patterns and architecture. The system supports complex expense tracking with multiple expense types and detailed breakdowns.

## Database Tables Created

### Core Tables

1. **expense_categories** - Categories for organizing expense types
2. **expense_types** - Specific types of expenses within categories
3. **expenses** - Main expense records
4. **assets** - Company assets for depreciation tracking

### Detail Tables

5. **expense_line_items** - Itemized breakdown of expenses
6. **expense_trips** - Trip-specific expense details
7. **expense_fuel** - Fuel and vehicle maintenance expenses
8. **expense_payroll** - Payroll expense details
9. **expense_depreciation** - Depreciation expense records

## API Endpoints

### Expenses (`/api/expenses`)

- `GET /` - List all expenses with filtering (type_id, dateFrom, dateTo, status, search)
- `GET /:id` - Get single expense with all related data
- `POST /` - Create new expense with related data
- `PUT /:id` - Update expense and related data
- `DELETE /:id` - Delete expense
- `GET /stats` - Get expense statistics

### Expense Types (`/api/expense-types`)

- `GET /` - List all expense types with categories (category_id, search filters)
- `GET /:id` - Get single expense type
- `POST /` - Create new expense type
- `PUT /:id` - Update expense type
- `DELETE /:id` - Delete expense type (if not in use)
- `GET /stats` - Get expense type statistics

### Expense Categories (`/api/expense-categories`)

- `GET /` - List all expense categories
- `GET /:id` - Get single expense category
- `POST /` - Create new expense category
- `PUT /:id` - Update expense category
- `DELETE /:id` - Delete expense category (if not in use)

### Assets (`/api/assets`)

- `GET /` - List all assets with depreciation info (status, search filters)
- `GET /:id` - Get single asset with depreciation history
- `POST /` - Create new asset
- `PUT /:id` - Update asset
- `DELETE /:id` - Delete asset (if no depreciation records)
- `GET /stats` - Get asset statistics
- `GET /:id/depreciation` - Calculate suggested depreciation for asset

## Features

### Complex Expense Structure

Each expense can have multiple types of related data:

- **Line Items**: Itemized purchases with quantity, unit price, discounts
- **Trips**: Transportation expenses with trip counts and costs
- **Fuel**: Fuel and maintenance items with quantities and costs
- **Payroll**: Staff salary details with deductions
- **Depreciation**: Asset depreciation entries

### Expense Example JSON Structure

```json
{
  "expense_date": "2024-01-15",
  "type_id": 1,
  "amount": 1000.0,
  "description": "Monthly operational expenses",
  "notes": "Various business expenses",
  "approved_by": "Manager",
  "status": "approved",
  "line_items": [
    {
      "item_name": "Office Supplies",
      "qty": 10,
      "unit_price": 50.0,
      "discount": 5.0,
      "total": 495.0
    }
  ],
  "trips": [
    {
      "trip_date": "2024-01-15",
      "trip_type": "Business Meeting",
      "destination": "Nairobi",
      "cost_per_trip": 500.0,
      "trips_count": 2,
      "total": 1000.0
    }
  ],
  "fuel": [
    {
      "item": "Diesel",
      "quantity": 50.0,
      "unit_cost": 150.0,
      "total": 7500.0
    }
  ],
  "payroll": [
    {
      "staff_id": 1,
      "days_worked": 22,
      "rate_per_day": 1500.0,
      "gross_amount": 33000.0,
      "deductions": 3000.0,
      "net_amount": 30000.0
    }
  ],
  "depreciation": [
    {
      "asset_id": 1,
      "depreciation_amount": 5000.0,
      "period": "2024-01-31"
    }
  ]
}
```

### Asset Management

- Track company assets with purchase details
- Calculate depreciation using straight-line method
- Monitor asset book values and depreciation history
- Support for different asset statuses (active, disposed, sold)

### Permissions

Following your existing role-based access control:

- **Admin**: Full access to all expense operations
- **Manager**: Can read, create, update expenses; manage types and assets
- **Staff**: Can read and create expenses
- **Viewer**: Read-only access to expenses

## Installation Steps

1. **Create Database Tables**:

   ```bash
   # Run the SQL script in your PostgreSQL database
   psql -U postgres -d crudefi -f server/create-expense-tables.sql
   ```

2. **Server is Already Configured**:

   - Routes are mounted in `server/index.js`
   - Permissions are added to `server/config/roles.js`
   - Controllers and routes follow your existing patterns

3. **Restart Your Server**:
   ```bash
   cd server
   npm start
   ```

## Default Data

The system creates default categories and types:

- **Transport**: Vehicle and transportation expenses
- **Fuel**: Fuel and vehicle maintenance
- **Payroll**: Staff salaries and benefits
- **Operations**: General operational expenses
- **Depreciation**: Asset depreciation expenses

## Integration with Existing System

- Uses your existing authentication middleware
- Follows your permission-based access control
- Integrates with existing staff table for payroll expenses
- Maintains your coding patterns and error handling
- Uses the same database connection pool

## Testing the API

All endpoints are now available and can be tested using your frontend or API testing tools like Postman. The system is fully integrated with your existing authentication and permission system.

Example API calls:

```bash
# Get all expenses
GET http://localhost:5000/api/expenses

# Create new expense
POST http://localhost:5000/api/expenses
Content-Type: application/json

# Get expense statistics
GET http://localhost:5000/api/expenses/stats
```

The system is ready for frontend integration and follows all your established patterns!
