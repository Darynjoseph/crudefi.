const pool = require('../db');

// Validation helper functions
function validateExpenseTypeData(data) {
  const errors = [];
  
  if (!data.type_name || data.type_name.trim().length < 2) {
    errors.push('Type name must be at least 2 characters long');
  } else if (data.type_name.trim().length > 100) {
    errors.push('Type name must be 100 characters or less');
  }
  
  if (!data.category_id || isNaN(parseInt(data.category_id))) {
    errors.push('Valid category is required');
  }
  
  return errors;
}

// GET all expense types with category information
exports.getAll = async (req, res) => {
  try {
    const { category_id, search } = req.query;
    
    let query = `
      SELECT et.*, ec.category_name
      FROM expense_types et
      JOIN expense_categories ec ON et.category_id = ec.category_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add filters
    if (category_id) {
      paramCount++;
      query += ` AND et.category_id = $${paramCount}`;
      params.push(category_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (et.type_name ILIKE $${paramCount} OR et.description ILIKE $${paramCount} OR ec.category_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY ec.category_name, et.type_name';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error('Error in expense types getAll:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET one expense type
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT et.*, ec.category_name
       FROM expense_types et
       JOIN expense_categories ec ON et.category_id = ec.category_id
       WHERE et.type_id = $1`, 
      [id]
    );
    
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Expense type not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in expense types getOne:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// CREATE new expense type
exports.create = async (req, res) => {
  try {
    // Validate input data
    const validationErrors = validateExpenseTypeData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    const { type_name, category_id, description } = req.body;

    // Check for duplicate type name within the same category
    const duplicateCheck = await pool.query(
      `SELECT type_id FROM expense_types WHERE type_name = $1 AND category_id = $2`,
      [type_name, category_id]
    );
    
    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Expense type already exists in this category'
      });
    }

    // Verify category exists
    const categoryCheck = await pool.query(
      `SELECT category_id FROM expense_categories WHERE category_id = $1`,
      [category_id]
    );
    
    if (categoryCheck.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    const result = await pool.query(
      `INSERT INTO expense_types (type_name, category_id, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [type_name, category_id, description]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Expense type created successfully'
    });
  } catch (err) {
    console.error('Error in expense types create:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        message: 'Expense type already exists in this category'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

// UPDATE expense type
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input data
    const validationErrors = validateExpenseTypeData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    const { type_name, category_id, description } = req.body;

    // Check for duplicate type name within the same category (excluding current record)
    const duplicateCheck = await pool.query(
      `SELECT type_id FROM expense_types WHERE type_name = $1 AND category_id = $2 AND type_id != $3`,
      [type_name, category_id, id]
    );
    
    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Expense type already exists in this category'
      });
    }

    // Verify category exists
    const categoryCheck = await pool.query(
      `SELECT category_id FROM expense_categories WHERE category_id = $1`,
      [category_id]
    );
    
    if (categoryCheck.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    const result = await pool.query(
      `UPDATE expense_types 
       SET type_name = $1, category_id = $2, description = $3, updated_at = NOW()
       WHERE type_id = $4 RETURNING *`,
      [type_name, category_id, description, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense type not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Expense type updated successfully'
    });
  } catch (err) {
    console.error('Error in expense types update:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        message: 'Expense type already exists in this category'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

// DELETE expense type
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if expense type is being used by any expenses
    const usageCheck = await pool.query(
      `SELECT expense_id FROM expenses WHERE type_id = $1 LIMIT 1`,
      [id]
    );
    
    if (usageCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete expense type that is being used by existing expenses'
      });
    }

    const result = await pool.query('DELETE FROM expense_types WHERE type_id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense type not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense type deleted successfully'
    });
  } catch (err) {
    console.error('Error in expense types remove:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET expense type statistics
exports.getStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_types,
        COUNT(DISTINCT et.category_id) as categories_used,
        COUNT(e.expense_id) as total_expenses_using_types
      FROM expense_types et
      LEFT JOIN expenses e ON et.type_id = e.type_id
    `;

    const { rows } = await pool.query(statsQuery);
    const stats = rows[0];

    res.json({
      success: true,
      data: {
        totalTypes: parseInt(stats.total_types),
        categoriesUsed: parseInt(stats.categories_used),
        totalExpensesUsingTypes: parseInt(stats.total_expenses_using_types)
      }
    });
  } catch (err) {
    console.error('Error in expense types getStats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};