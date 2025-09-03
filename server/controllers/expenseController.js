const pool = require('../db');

// Validation helper functions
function validateExpenseData(data) {
  const errors = [];
  
  if (!data.expense_date) {
    errors.push('Expense date is required');
  }
  
  if (!data.type_id || isNaN(parseInt(data.type_id))) {
    errors.push('Valid expense type is required');
  }
  
  if (data.amount !== undefined && (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) < 0)) {
    errors.push('Amount must be a valid positive number');
  }
  
  return errors;
}

// GET all expenses with filtering and search
exports.getAll = async (req, res) => {
  try {
    const { type_id, dateFrom, dateTo, status, search } = req.query;
    
    let query = `
      SELECT e.*, et.type_name, ec.name,
             COALESCE(e.amount, 0) + 
             COALESCE((SELECT SUM(total) FROM expense_line_items WHERE expense_id = e.expense_id), 0) +
             COALESCE((SELECT SUM(total) FROM expense_trips WHERE expense_id = e.expense_id), 0) +
             COALESCE((SELECT SUM(total) FROM expense_fuel WHERE expense_id = e.expense_id), 0) +
             COALESCE((SELECT SUM(net_amount) FROM expense_payroll WHERE expense_id = e.expense_id), 0) +
             COALESCE((SELECT SUM(depreciation_amount) FROM expense_depreciation WHERE expense_id = e.expense_id), 0) as total_amount
      FROM expenses e
      JOIN expense_types et ON e.type_id = et.type_id
      JOIN expense_categories ec ON et.category_id = ec.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add filters
    if (type_id) {
      paramCount++;
      query += ` AND e.type_id = $${paramCount}`;
      params.push(type_id);
    }

    if (status) {
      paramCount++;
      query += ` AND e.status = $${paramCount}`;
      params.push(status);
    }

    if (dateFrom) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      params.push(dateTo);
    }

    if (search) {
      paramCount++;
      query += ` AND (e.description ILIKE $${paramCount} OR e.notes ILIKE $${paramCount} OR et.type_name ILIKE $${paramCount} OR ec.category_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY e.expense_date DESC, e.created_at DESC';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error('Error in expenses getAll:', err);
    res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,   // show real error
    stack: err.stack      // optional
  });
  }
};

// GET one expense with all related data
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get main expense data
    const expenseQuery = `
      SELECT e.*, et.type_name, ec.name
      FROM expenses e
      JOIN expense_types et ON e.type_id = et.type_id
      JOIN expense_categories ec ON et.category_id = ec.category_id
      WHERE e.expense_id = $1
    `;
    const { rows: expenseRows } = await pool.query(expenseQuery, [id]);
    
    if (!expenseRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const expense = expenseRows[0];

    // Get related data
    const [lineItems, trips, fuel, payroll, depreciation] = await Promise.all([
      pool.query('SELECT * FROM expense_line_items WHERE expense_id = $1 ORDER BY line_id', [id]),
      pool.query('SELECT * FROM expense_trips WHERE expense_id = $1 ORDER BY trip_date', [id]),
      pool.query('SELECT * FROM expense_fuel WHERE expense_id = $1 ORDER BY fuel_id', [id]),
      pool.query(`
        SELECT ep.*, s.first_name, s.last_name 
        FROM expense_payroll ep 
        LEFT JOIN staff s ON ep.staff_id = s.staff_id 
        WHERE ep.expense_id = $1 
        ORDER BY ep.payroll_id
      `, [id]),
      pool.query(`
        SELECT ed.*, a.asset_name 
        FROM expense_depreciation ed 
        JOIN assets a ON ed.asset_id = a.asset_id 
        WHERE ed.expense_id = $1 
        ORDER BY ed.period
      `, [id])
    ]);

    expense.line_items = lineItems.rows;
    expense.trips = trips.rows;
    expense.fuel = fuel.rows;
    expense.payroll = payroll.rows;
    expense.depreciation = depreciation.rows;

    res.json({
      success: true,
      data: expense
    });
  } catch (err) {
    console.error('Error in expenses getOne:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// CREATE new expense
exports.create = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Validate input data
    const validationErrors = validateExpenseData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    const { 
      expense_date, 
      type_id, 
      amount = 0, 
      description, 
      notes, 
      approved_by,
      status = 'pending',
      line_items = [],
      trips = [],
      fuel = [],
      payroll = [],
      depreciation = []
    } = req.body;

    // Insert main expense
    const expenseResult = await client.query(
      `INSERT INTO expenses (expense_date, type_id, amount, description, notes, approved_by, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [expense_date, type_id, amount, description, notes, approved_by, status, req.user?.id]
    );

    const expense = expenseResult.rows[0];
    const expenseId = expense.expense_id;

    // Insert related data
    if (line_items.length > 0) {
      for (const item of line_items) {
        await client.query(
          `INSERT INTO expense_line_items (expense_id, item_name, qty, unit_price, discount, total)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [expenseId, item.item_name, item.qty || 1, item.unit_price || 0, item.discount || 0, item.total]
        );
      }
    }

    if (trips.length > 0) {
      for (const trip of trips) {
        await client.query(
          `INSERT INTO expense_trips (expense_id, trip_date, trip_type, destination, cost_per_trip, trips_count, total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [expenseId, trip.trip_date, trip.trip_type, trip.destination, trip.cost_per_trip || 0, trip.trips_count || 1, trip.total]
        );
      }
    }

    if (fuel.length > 0) {
      for (const fuelItem of fuel) {
        await client.query(
          `INSERT INTO expense_fuel (expense_id, item, quantity, unit_cost, total)
           VALUES ($1, $2, $3, $4, $5)`,
          [expenseId, fuelItem.item, fuelItem.quantity || 0, fuelItem.unit_cost || 0, fuelItem.total]
        );
      }
    }

    if (payroll.length > 0) {
      for (const payrollItem of payroll) {
        await client.query(
          `INSERT INTO expense_payroll (expense_id, staff_id, staff_name, days_worked, rate_per_day, gross_amount, deductions, net_amount)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [expenseId, payrollItem.staff_id, payrollItem.staff_name, payrollItem.days_worked || 0, 
           payrollItem.rate_per_day || 0, payrollItem.gross_amount || 0, payrollItem.deductions || 0, payrollItem.net_amount]
        );
      }
    }

    if (depreciation.length > 0) {
      for (const depItem of depreciation) {
        await client.query(
          `INSERT INTO expense_depreciation (expense_id, asset_id, depreciation_amount, period)
           VALUES ($1, $2, $3, $4)`,
          [expenseId, depItem.asset_id, depItem.depreciation_amount, depItem.period]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in expenses create:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
};

// UPDATE expense
exports.update = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Validate input data
    const validationErrors = validateExpenseData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    const { 
      expense_date, 
      type_id, 
      amount = 0, 
      description, 
      notes, 
      approved_by,
      status,
      line_items = [],
      trips = [],
      fuel = [],
      payroll = [],
      depreciation = []
    } = req.body;

    // Update main expense
    const result = await client.query(
      `UPDATE expenses 
       SET expense_date = $1, type_id = $2, amount = $3, description = $4, notes = $5, 
           approved_by = $6, status = $7, updated_at = NOW()
       WHERE expense_id = $8 RETURNING *`,
      [expense_date, type_id, amount, description, notes, approved_by, status, id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Delete existing related data
    await Promise.all([
      client.query('DELETE FROM expense_line_items WHERE expense_id = $1', [id]),
      client.query('DELETE FROM expense_trips WHERE expense_id = $1', [id]),
      client.query('DELETE FROM expense_fuel WHERE expense_id = $1', [id]),
      client.query('DELETE FROM expense_payroll WHERE expense_id = $1', [id]),
      client.query('DELETE FROM expense_depreciation WHERE expense_id = $1', [id])
    ]);

    // Insert updated related data (same logic as create)
    if (line_items.length > 0) {
      for (const item of line_items) {
        await client.query(
          `INSERT INTO expense_line_items (expense_id, item_name, qty, unit_price, discount, total)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, item.item_name, item.qty || 1, item.unit_price || 0, item.discount || 0, item.total]
        );
      }
    }

    if (trips.length > 0) {
      for (const trip of trips) {
        await client.query(
          `INSERT INTO expense_trips (expense_id, trip_date, trip_type, destination, cost_per_trip, trips_count, total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, trip.trip_date, trip.trip_type, trip.destination, trip.cost_per_trip || 0, trip.trips_count || 1, trip.total]
        );
      }
    }

    if (fuel.length > 0) {
      for (const fuelItem of fuel) {
        await client.query(
          `INSERT INTO expense_fuel (expense_id, item, quantity, unit_cost, total)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, fuelItem.item, fuelItem.quantity || 0, fuelItem.unit_cost || 0, fuelItem.total]
        );
      }
    }

    if (payroll.length > 0) {
      for (const payrollItem of payroll) {
        await client.query(
          `INSERT INTO expense_payroll (expense_id, staff_id, staff_name, days_worked, rate_per_day, gross_amount, deductions, net_amount)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, payrollItem.staff_id, payrollItem.staff_name, payrollItem.days_worked || 0, 
           payrollItem.rate_per_day || 0, payrollItem.gross_amount || 0, payrollItem.deductions || 0, payrollItem.net_amount]
        );
      }
    }

    if (depreciation.length > 0) {
      for (const depItem of depreciation) {
        await client.query(
          `INSERT INTO expense_depreciation (expense_id, asset_id, depreciation_amount, period)
           VALUES ($1, $2, $3, $4)`,
          [id, depItem.asset_id, depItem.depreciation_amount, depItem.period]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Expense updated successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in expenses update:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
};

// DELETE expense
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expenses WHERE expense_id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (err) {
    console.error('Error in expenses remove:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET expense statistics
exports.getStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_expenses,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_expenses,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_expenses,
        COUNT(CASE WHEN expense_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as expenses_this_month,
        COALESCE(SUM(
          COALESCE(amount, 0) + 
          COALESCE((SELECT SUM(total) FROM expense_line_items WHERE expense_id = expenses.expense_id), 0) +
          COALESCE((SELECT SUM(total) FROM expense_trips WHERE expense_id = expenses.expense_id), 0) +
          COALESCE((SELECT SUM(total) FROM expense_fuel WHERE expense_id = expenses.expense_id), 0) +
          COALESCE((SELECT SUM(net_amount) FROM expense_payroll WHERE expense_id = expenses.expense_id), 0) +
          COALESCE((SELECT SUM(depreciation_amount) FROM expense_depreciation WHERE expense_id = expenses.expense_id), 0)
        ), 0) as total_amount,
        COALESCE(SUM(
          CASE WHEN status = 'approved' THEN
            COALESCE(amount, 0) + 
            COALESCE((SELECT SUM(total) FROM expense_line_items WHERE expense_id = expenses.expense_id), 0) +
            COALESCE((SELECT SUM(total) FROM expense_trips WHERE expense_id = expenses.expense_id), 0) +
            COALESCE((SELECT SUM(total) FROM expense_fuel WHERE expense_id = expenses.expense_id), 0) +
            COALESCE((SELECT SUM(net_amount) FROM expense_payroll WHERE expense_id = expenses.expense_id), 0) +
            COALESCE((SELECT SUM(depreciation_amount) FROM expense_depreciation WHERE expense_id = expenses.expense_id), 0)
          ELSE 0 END
        ), 0) as approved_amount
      FROM expenses
    `;

    const { rows } = await pool.query(statsQuery);
    const stats = rows[0];

    res.json({
      success: true,
      data: {
        totalExpenses: parseInt(stats.total_expenses),
        approvedExpenses: parseInt(stats.approved_expenses),
        pendingExpenses: parseInt(stats.pending_expenses),
        expensesThisMonth: parseInt(stats.expenses_this_month),
        totalAmount: parseFloat(stats.total_amount),
        approvedAmount: parseFloat(stats.approved_amount)
      }
    });
  } catch (err) {
    console.error('Error in expenses getStats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};