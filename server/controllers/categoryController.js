const pool = require('../db');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    console.log('[expense-categories] getCategories called');
    const result = await pool.query(
      'SELECT id, name, description, created_at FROM expense_categories ORDER BY id'
    );
    const data = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      created_at: r.created_at,
    }));
    console.log('[expense-categories] getCategories result count:', data.length);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[expense-categories] getCategories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// Add new category
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log('[expense-categories] addCategory payload:', { name, description });
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    // Check for duplicate category name
    const duplicateCheck = await pool.query('SELECT 1 FROM expense_categories WHERE LOWER(name) = LOWER($1) LIMIT 1', [name.trim()]);
    if (duplicateCheck.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    const result = await pool.query(
      'INSERT INTO expense_categories (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at',
      [name.trim(), description || null]
    );
    const row = result.rows[0];
    const data = { id: row.id, name: row.name, description: row.description, created_at: row.created_at };
    res.status(201).json({ success: true, data, message: 'Category created successfully' });
  } catch (err) {
    console.error('[expense-categories] addCategory error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to add category' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    console.log('[expense-categories] updateCategory params:', { id }, 'payload:', { name, description });
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const result = await pool.query(
      'UPDATE expense_categories SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, created_at',
      [name.trim(), description || null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const row = result.rows[0];
    const data = { id: row.id, name: row.name, description: row.description, created_at: row.created_at };
    res.json({ success: true, data, message: 'Category updated successfully' });
  } catch (err) {
    console.error('[expense-categories] updateCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[expense-categories] deleteCategory params:', { id });
  // Check if any types exist for this category
  const typeCheck = await pool.query('SELECT 1 FROM expense_types WHERE category_id = $1 LIMIT 1', [id]);
    if (typeCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete category with existing types. Please delete or reassign all types first.'
      });
    }
    const del = await pool.query('DELETE FROM expense_categories WHERE id = $1', [id]);
    if (del.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error('[expense-categories] deleteCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};
