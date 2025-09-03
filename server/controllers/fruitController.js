const pool = require('../db');

// GET all fruits
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM fruits WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND fruit_name ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY fruit_name ASC';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error('Error in getAll fruits:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET one fruit
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM fruits WHERE fruit_id = $1', 
      [id]
    );
    
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Fruit not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in getOne fruit:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// POST - Create new fruit
exports.create = async (req, res) => {
  try {
    const { fruit_name } = req.body;

    // Input validation
    if (!fruit_name || fruit_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Fruit name is required'
      });
    }

    // Check if fruit already exists
    const existingFruit = await pool.query(
      'SELECT fruit_id FROM fruits WHERE fruit_name = $1',
      [fruit_name.trim()]
    );

    if (existingFruit.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Fruit with this name already exists'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO fruits (fruit_name, updated_at) 
       VALUES ($1, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [fruit_name.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Fruit created successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in create fruit:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// PUT - Update fruit
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { fruit_name } = req.body;

    // Input validation
    if (!fruit_name || fruit_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Fruit name is required'
      });
    }

    // Check if fruit exists
    const existingFruit = await pool.query(
      'SELECT fruit_id FROM fruits WHERE fruit_id = $1',
      [id]
    );

    if (existingFruit.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fruit not found'
      });
    }

    // Check if name is taken by another fruit
    const nameCheck = await pool.query(
      'SELECT fruit_id FROM fruits WHERE fruit_name = $1 AND fruit_id != $2',
      [fruit_name.trim(), id]
    );

    if (nameCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Fruit with this name already exists'
      });
    }

    const { rows } = await pool.query(
      `UPDATE fruits 
       SET fruit_name = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE fruit_id = $2 
       RETURNING *`,
      [fruit_name.trim(), id]
    );

    res.json({
      success: true,
      message: 'Fruit updated successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in update fruit:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// DELETE fruit
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if fruit exists
    const existingFruit = await pool.query(
      'SELECT fruit_id FROM fruits WHERE fruit_id = $1',
      [id]
    );

    if (existingFruit.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fruit not found'
      });
    }

    // Check if fruit has associated deliveries
    const deliveryCheck = await pool.query(
      'SELECT id FROM fruit_deliveries WHERE fruit_id = $1 LIMIT 1',
      [id]
    );

    if (deliveryCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete fruit with associated deliveries or oil extraction logs'
      });
    }

    // Check if fruit has associated oil extraction logs
    const oilLogCheck = await pool.query(
      'SELECT id FROM oil_extraction_logs WHERE fruit_id = $1 LIMIT 1',
      [id]
    );

    if (oilLogCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete fruit with associated oil extraction logs'
      });
    }

    await pool.query('DELETE FROM fruits WHERE fruit_id = $1', [id]);

    res.json({
      success: true,
      message: 'Fruit deleted successfully'
    });
  } catch (err) {
    console.error('Error in delete fruit:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET fruit statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_fruits
      FROM fruits
    `);

    const deliveryStats = await pool.query(`
      SELECT 
        f.fruit_name,
        COUNT(fd.id) as delivery_count,
        COALESCE(SUM(fd.weight_kg), 0) as total_weight_kg,
        COALESCE(SUM(fd.total_cost), 0) as total_value,
        MAX(fd.date) as last_delivery_date
      FROM fruits f
      LEFT JOIN fruit_deliveries fd ON f.fruit_id = fd.fruit_id
      GROUP BY f.fruit_id, f.fruit_name
      ORDER BY delivery_count DESC
    `);

    const oilStats = await pool.query(`
      SELECT 
        f.fruit_name,
        COUNT(oel.id) as extraction_count,
        COALESCE(SUM(oel.input_quantity), 0) as total_input_kg,
        COALESCE(SUM(oel.oil_extracted), 0) as total_oil_extracted_l,
        ROUND(AVG((oel.oil_extracted * 0.92 / oel.input_quantity * 100)::numeric), 2) as avg_yield_percent
      FROM fruits f
      LEFT JOIN oil_extraction_logs oel ON f.fruit_id = oel.fruit_id AND oel.input_quantity > 0
      GROUP BY f.fruit_id, f.fruit_name
      ORDER BY extraction_count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        delivery_stats: deliveryStats.rows,
        oil_extraction_stats: oilStats.rows
      }
    });
  } catch (err) {
    console.error('Error in getStats fruits:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
