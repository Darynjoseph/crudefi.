# Expense Management Blueprint Implementation Guide

## Overview

This guide shows exactly how to implement each expense type from your blueprint using the expense management system.

## Expense Type Mappings

### 🧑‍💼 PEOPLE Category

#### 1. Payroll

- **Table**: `expenses` + `expense_payroll`
- **Usage**: Regular staff salaries

```json
{
  "expense_date": "2024-01-31",
  "type_id": "[Payroll type_id]",
  "description": "January 2024 Staff Salaries",
  "approved_by": "HR Manager",
  "payroll": [
    {
      "staff_id": 1,
      "worker_type": "regular",
      "days_worked": 22,
      "rate_per_day": 1500.0,
      "gross_amount": 33000.0,
      "deductions": 3000.0,
      "net_amount": 30000.0
    }
  ]
}
```

#### 2. Casual Labourers

- **Table**: `expenses` + `expense_payroll`
- **Usage**: Temporary and casual workers

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Casual Labourers type_id]",
  "description": "Casual workers for harvest season",
  "payroll": [
    {
      "staff_id": null,
      "staff_name": "John Casual Worker",
      "worker_type": "casual",
      "days_worked": 5,
      "rate_per_day": 800.0,
      "gross_amount": 4000.0,
      "deductions": 0.0,
      "net_amount": 4000.0
    }
  ]
}
```

### 🏭 OPERATIONS Category

#### 3. Waste

- **Table**: `expenses` + `expense_trips`
- **Usage**: Waste disposal trips

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Waste type_id]",
  "description": "Weekly waste disposal",
  "trips": [
    {
      "trip_date": "2024-01-15",
      "trip_type": "Waste Disposal",
      "destination": "Waste Management Center",
      "trips_count": 2,
      "cost_per_trip": 1500.0,
      "total": 3000.0
    }
  ]
}
```

#### 4. Firewood

- **Table**: `expenses` + `expense_fuel`
- **Usage**: Firewood purchases

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Firewood type_id]",
  "description": "Firewood for processing",
  "fuel": [
    {
      "item": "Firewood",
      "quantity": 100.0,
      "unit_cost": 50.0,
      "total": 5000.0
    }
  ]
}
```

#### 5. Forklift Expenses

- **Table**: `expenses` + `expense_fuel`
- **Usage**: Forklift fuel, service, repairs

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Forklift Expenses type_id]",
  "description": "Forklift maintenance and fuel",
  "fuel": [
    {
      "item": "Diesel",
      "quantity": 50.0,
      "unit_cost": 150.0,
      "total": 7500.0
    },
    {
      "item": "Service",
      "service_type": "Monthly maintenance",
      "quantity": 1.0,
      "unit_cost": 5000.0,
      "total": 5000.0
    }
  ]
}
```

#### 6. Maintenance

- **Table**: `expenses` + `expense_fuel`
- **Usage**: Equipment and facility maintenance

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Maintenance type_id]",
  "description": "Equipment maintenance",
  "fuel": [
    {
      "item": "Spare Parts",
      "service_type": "Belt replacement",
      "quantity": 2.0,
      "unit_cost": 2500.0,
      "total": 5000.0
    },
    {
      "item": "Repair Service",
      "service_type": "Motor repair",
      "quantity": 1.0,
      "unit_cost": 8000.0,
      "total": 8000.0
    }
  ]
}
```

#### 7. Fuel

- **Table**: `expenses` + `expense_fuel`
- **Usage**: Vehicle fuel purchases

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Fuel type_id]",
  "description": "Vehicle fuel purchase",
  "fuel": [
    {
      "item": "Diesel",
      "quantity": 200.0,
      "unit_cost": 150.0,
      "total": 30000.0
    },
    {
      "item": "Petrol",
      "quantity": 50.0,
      "unit_cost": 160.0,
      "total": 8000.0
    }
  ]
}
```

#### 8. Laboratory

- **Table**: `expenses` + `expense_line_items`
- **Usage**: Lab supplies and equipment

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Laboratory type_id]",
  "description": "Laboratory supplies purchase",
  "line_items": [
    {
      "item_name": "Test Kits",
      "qty": 10.0,
      "unit_price": 500.0,
      "discount": 250.0,
      "total": 4750.0
    },
    {
      "item_name": "Chemicals",
      "qty": 5.0,
      "unit_price": 1200.0,
      "discount": 0.0,
      "total": 6000.0
    }
  ]
}
```

#### 9. Shipment

- **Table**: `expenses` + `expense_trips`
- **Usage**: Shipping and delivery expenses

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Shipment type_id]",
  "description": "Product shipments to customers",
  "trips": [
    {
      "trip_date": "2024-01-15",
      "shipment_type": "Customer Delivery",
      "destination": "Nairobi",
      "trips_count": 3,
      "cost_per_trip": 2500.0,
      "total": 7500.0
    }
  ]
}
```

#### 10. Material Cost

- **Table**: `expenses` + `expense_line_items`
- **Usage**: Raw materials and supplies

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Material Cost type_id]",
  "description": "Raw materials purchase",
  "line_items": [
    {
      "item_name": "Packaging Materials",
      "qty": 1000.0,
      "unit_price": 15.0,
      "discount": 1000.0,
      "total": 14000.0
    },
    {
      "item_name": "Processing Aids",
      "qty": 50.0,
      "unit_price": 200.0,
      "discount": 0.0,
      "total": 10000.0
    }
  ]
}
```

#### 11. Hired Machines

- **Table**: `expenses` + `expense_trips`
- **Usage**: Machine rental and hire

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Hired Machines type_id]",
  "description": "Excavator hire for site work",
  "trips": [
    {
      "machine_type": "Excavator",
      "hire_date": "2024-01-15",
      "days_used": 3,
      "cost_per_trip": 5000.0,
      "total": 15000.0
    }
  ]
}
```

### 🔌 UTILITIES Category

#### 12. Water (Flat Expense)

- **Table**: `expenses` only
- **Usage**: Water bills

```json
{
  "expense_date": "2024-01-31",
  "type_id": "[Water type_id]",
  "amount": 15000.0,
  "description": "January 2024 water bill",
  "notes": "Monthly water usage"
}
```

#### 13. Electricity Bill (Flat Expense)

- **Table**: `expenses` only
- **Usage**: Electricity costs

```json
{
  "expense_date": "2024-01-31",
  "type_id": "[Electricity Bill type_id]",
  "amount": 45000.0,
  "description": "January 2024 electricity bill",
  "notes": "Monthly power consumption"
}
```

### 🏭 ASSETS Category

#### 14. Machine Depreciation

- **Table**: `expenses` + `expense_depreciation`
- **Usage**: Asset depreciation entries

```json
{
  "expense_date": "2024-01-31",
  "type_id": "[Machine Depreciation type_id]",
  "description": "Monthly depreciation for processing equipment",
  "depreciation": [
    {
      "asset_id": 1,
      "depreciation_amount": 5000.0,
      "period": "2024-01-31"
    },
    {
      "asset_id": 2,
      "depreciation_amount": 3000.0,
      "period": "2024-01-31"
    }
  ]
}
```

### 🏢 OVERHEADS Category

#### 15. Insurance (Flat Expense)

- **Table**: `expenses` only

```json
{
  "expense_date": "2024-01-31",
  "type_id": "[Insurance type_id]",
  "amount": 25000.0,
  "description": "Monthly insurance premium",
  "notes": "Equipment and liability insurance"
}
```

#### 16. Rent (Flat Expense)

- **Table**: `expenses` only

```json
{
  "expense_date": "2024-01-31",
  "type_id": "[Rent type_id]",
  "amount": 50000.0,
  "description": "Monthly office rent",
  "notes": "January 2024 rent payment"
}
```

#### 17. Miscellaneous

- **Table**: `expenses` + `expense_line_items`
- **Usage**: Other miscellaneous expenses

```json
{
  "expense_date": "2024-01-15",
  "type_id": "[Miscellaneous type_id]",
  "description": "Various miscellaneous expenses",
  "line_items": [
    {
      "item_name": "Office Supplies",
      "qty": 1.0,
      "unit_price": 2500.0,
      "discount": 0.0,
      "total": 2500.0
    },
    {
      "item_name": "Communication Expenses",
      "qty": 1.0,
      "unit_price": 3000.0,
      "discount": 0.0,
      "total": 3000.0
    }
  ]
}
```

## Implementation Steps

1. **Run the Blueprint SQL**:

   ```bash
   psql -U postgres -d crudefi -f server/create-expense-tables.sql
   psql -U postgres -d crudefi -f server/update-expense-types-blueprint.sql
   ```

2. **View the Expense Type Mapping**:

   ```sql
   SELECT * FROM expense_type_mapping;
   ```

3. **Test API Endpoints**:
   - All endpoints support the blueprint structure
   - Use the JSON examples above for testing
   - Each expense type automatically uses the correct detail table

## Key Benefits

✅ **Flexible Structure**: Each expense type uses the most appropriate detail table
✅ **Flat Expenses**: Simple expenses (utilities, rent) stay simple
✅ **Complex Expenses**: Detailed expenses capture all necessary information
✅ **Consistent API**: Same endpoints work for all expense types
✅ **Automatic Totaling**: System calculates totals from all detail tables
✅ **Blueprint Compliance**: Exactly matches your expense mapping requirements

The system is now fully aligned with your expense blueprint and ready for production use!
