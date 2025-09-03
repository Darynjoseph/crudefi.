const pool = require('../db');

// GET all suppliers with filtering
exports.getAll = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add filters
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (supplier_name ILIKE $${paramCount} OR contact_info ILIKE $${paramCount} OR location ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY supplier_name ASC';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error('Error in getAll suppliers:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET one supplier
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM suppliers WHERE supplier_id = $1', 
      [id]
    );
    
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in getOne supplier:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// POST - Create new supplier
exports.create = async (req, res) => {
  try {
    const { supplier_name, contact_info, location, status = 'active' } = req.body;

    // Input validation
    if (!supplier_name || supplier_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    // Check if supplier already exists
    const existingSupplier = await pool.query(
      'SELECT supplier_id FROM suppliers WHERE supplier_name = $1',
      [supplier_name.trim()]
    );

    if (existingSupplier.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Supplier with this name already exists'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO suppliers (supplier_name, contact_info, location, status, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [supplier_name.trim(), contact_info, location, status]
    );

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in create supplier:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// PUT - Update supplier
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, contact_info, location, status } = req.body;

    // Input validation
    if (!supplier_name || supplier_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    // Check if supplier exists
    const existingSupplier = await pool.query(
      'SELECT supplier_id FROM suppliers WHERE supplier_id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if name is taken by another supplier
    const nameCheck = await pool.query(
      'SELECT supplier_id FROM suppliers WHERE supplier_name = $1 AND supplier_id != $2',
      [supplier_name.trim(), id]
    );

    if (nameCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Supplier with this name already exists'
      });
    }

    const { rows } = await pool.query(
      `UPDATE suppliers 
       SET supplier_name = $1, contact_info = $2, location = $3, status = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE supplier_id = $5 
       RETURNING *`,
      [supplier_name.trim(), contact_info, location, status, id]
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in update supplier:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// DELETE supplier
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const existingSupplier = await pool.query(
      'SELECT supplier_id FROM suppliers WHERE supplier_id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier has associated deliveries
    const deliveryCheck = await pool.query(
      'SELECT id FROM fruit_deliveries WHERE supplier_id = $1 LIMIT 1',
      [id]
    );

    if (deliveryCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete supplier with associated deliveries. Consider marking as inactive instead.'
      });
    }

    await pool.query('DELETE FROM suppliers WHERE supplier_id = $1', [id]);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (err) {
    console.error('Error in delete supplier:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET supplier statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_suppliers,
        COUNT(*) FILTER (WHERE status = 'active') as active_suppliers,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_suppliers
      FROM suppliers
    `);

    const deliveryStats = await pool.query(`
      SELECT 
        s.supplier_name,
        COUNT(fd.id) as delivery_count,
        COALESCE(SUM(fd.total_cost), 0) as total_value,
        MAX(fd.date) as last_delivery_date
      FROM suppliers s
      LEFT JOIN fruit_deliveries fd ON s.supplier_id = fd.supplier_id
      WHERE s.status = 'active'
      GROUP BY s.supplier_id, s.supplier_name
      ORDER BY delivery_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        top_suppliers: deliveryStats.rows
      }
    });
  } catch (err) {
    console.error('Error in getStats suppliers:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
