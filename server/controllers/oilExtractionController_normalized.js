const pool = require('../db');

// GET all oil extraction logs (updated for normalized structure)
exports.getAll = async (req, res) => {
  try {
    const { fruit_type, dateFrom, dateTo, search } = req.query;
    
    // Use JOIN to get fruit name
    let query = `
      SELECT 
        oel.*,
        f.fruit_name as fruit_type
      FROM oil_extraction_logs oel
      LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add filters
    if (fruit_type) {
      paramCount++;
      query += ` AND f.fruit_name ILIKE $${paramCount}`;
      params.push(`%${fruit_type}%`);
    }

    if (dateFrom) {
      paramCount++;
      query += ` AND oel.date >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND oel.date <= $${paramCount}`;
      params.push(dateTo);
    }

    if (search) {
      paramCount++;
      query += ` AND (f.fruit_name ILIKE $${paramCount} OR oel.notes ILIKE $${paramCount} OR oel.id::text ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY oel.date DESC, oel.id DESC';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching oil extraction logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching oil extraction logs',
      error: error.message
    });
  }
};

// GET one oil extraction log by ID (updated for normalized structure)
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        oel.*,
        f.fruit_name as fruit_type
      FROM oil_extraction_logs oel
      LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id
      WHERE oel.id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oil extraction log not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching oil extraction log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching oil extraction log',
      error: error.message
    });
  }
};

// CREATE new oil extraction log (updated for normalized structure)
exports.create = async (req, res) => {
  try {
    const {
      date,
      fruit_id,
      input_quantity,
      oil_extracted,
      supplied_oil,
      waste,
      notes
    } = req.body;

    // Validate required fields
    if (!date || !fruit_id || !input_quantity || !oil_extracted) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: date, fruit_id, input_quantity, oil_extracted'
      });
    }

    // Validate that fruit exists
    const fruitCheck = await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id = $1', [fruit_id]);
    if (fruitCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fruit_id. Fruit does not exist.'
      });
    }

    // Insert new oil extraction log
    const insertQuery = `
      INSERT INTO oil_extraction_logs (
        date, fruit_id, input_quantity, oil_extracted, 
        supplied_oil, waste, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      date,
      fruit_id,
      input_quantity,
      oil_extracted,
      supplied_oil || 0,
      waste || 0,
      notes
    ]);

    // Get the complete record with fruit name
    const completeRecord = await pool.query(`
      SELECT 
        oel.*,
        f.fruit_name as fruit_type
      FROM oil_extraction_logs oel
      LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id
      WHERE oel.id = $1
    `, [rows[0].id]);

    res.status(201).json({
      success: true,
      data: completeRecord.rows[0],
      message: 'Oil extraction log created successfully'
    });
  } catch (error) {
    console.error('Error creating oil extraction log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating oil extraction log',
      error: error.message
    });
  }
};

// UPDATE oil extraction log (updated for normalized structure)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      fruit_id,
      input_quantity,
      oil_extracted,
      supplied_oil,
      waste,
      notes
    } = req.body;

    // Check if log exists
    const existingLog = await pool.query('SELECT id FROM oil_extraction_logs WHERE id = $1', [id]);
    if (existingLog.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oil extraction log not found'
      });
    }

    // Validate fruit_id if provided
    if (fruit_id) {
      const fruitCheck = await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id = $1', [fruit_id]);
      if (fruitCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fruit_id. Fruit does not exist.'
        });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (date !== undefined) {
      paramCount++;
      updateFields.push(`date = $${paramCount}`);
      params.push(date);
    }
    if (fruit_id !== undefined) {
      paramCount++;
      updateFields.push(`fruit_id = $${paramCount}`);
      params.push(fruit_id);
    }
    if (input_quantity !== undefined) {
      paramCount++;
      updateFields.push(`input_quantity = $${paramCount}`);
      params.push(input_quantity);
    }
    if (oil_extracted !== undefined) {
      paramCount++;
      updateFields.push(`oil_extracted = $${paramCount}`);
      params.push(oil_extracted);
    }
    if (supplied_oil !== undefined) {
      paramCount++;
      updateFields.push(`supplied_oil = $${paramCount}`);
      params.push(supplied_oil);
    }
    if (waste !== undefined) {
      paramCount++;
      updateFields.push(`waste = $${paramCount}`);
      params.push(waste);
    }
    if (notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      params.push(notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    params.push(new Date());

    // Add ID for WHERE clause
    paramCount++;
    params.push(id);

    const updateQuery = `
      UPDATE oil_extraction_logs 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    await pool.query(updateQuery, params);

    // Get the complete updated record with fruit name
    const completeRecord = await pool.query(`
      SELECT 
        oel.*,
        f.fruit_name as fruit_type
      FROM oil_extraction_logs oel
      LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id
      WHERE oel.id = $1
    `, [id]);

    res.json({
      success: true,
      data: completeRecord.rows[0],
      message: 'Oil extraction log updated successfully'
    });
  } catch (error) {
    console.error('Error updating oil extraction log:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating oil extraction log',
      error: error.message
    });
  }
};

// DELETE oil extraction log
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if log exists
    const existingLog = await pool.query('SELECT id FROM oil_extraction_logs WHERE id = $1', [id]);
    if (existingLog.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oil extraction log not found'
      });
    }

    await pool.query('DELETE FROM oil_extraction_logs WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Oil extraction log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting oil extraction log:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting oil extraction log',
      error: error.message
    });
  }
};

// GET oil extraction statistics (updated for normalized structure)
exports.getStats = async (req, res) => {
  try {
    // Overview stats
    const overviewQuery = `
      SELECT 
        COUNT(*) as total_logs,
        COALESCE(SUM(input_quantity), 0) as total_input_kg,
        COALESCE(SUM(oil_extracted), 0) as total_oil_extracted_l,
        COALESCE(SUM(supplied_oil), 0) as total_supplied_oil_l,
        COALESCE(SUM(waste), 0) as total_waste_kg,
        CASE 
          WHEN SUM(input_quantity) > 0 
          THEN ROUND((SUM(oil_extracted) * 0.92 / SUM(input_quantity) * 100)::numeric, 2)
          ELSE 0 
        END as avg_yield_percent,
        COUNT(CASE WHEN DATE(date) = CURRENT_DATE THEN 1 END) as logs_today,
        COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as logs_this_week
      FROM oil_extraction_logs
    `;

    const overviewResult = await pool.query(overviewQuery);

    // Fruit stats
    const fruitStatsQuery = `
      SELECT 
        f.fruit_name,
        COUNT(oel.id) as extraction_count,
        COALESCE(SUM(oel.input_quantity), 0) as total_input_kg,
        COALESCE(SUM(oel.oil_extracted), 0) as total_oil_extracted_l,
        CASE 
          WHEN SUM(oel.input_quantity) > 0 
          THEN ROUND((SUM(oel.oil_extracted) * 0.92 / SUM(oel.input_quantity) * 100)::numeric, 2)
          ELSE 0 
        END as avg_yield_percent
      FROM fruits f
      LEFT JOIN oil_extraction_logs oel ON f.fruit_id = oel.fruit_id
      GROUP BY f.fruit_id, f.fruit_name
      ORDER BY extraction_count DESC, total_oil_extracted_l DESC
    `;

    const fruitStatsResult = await pool.query(fruitStatsQuery);

    res.json({
      success: true,
      data: {
        overview: overviewResult.rows[0],
        fruitStats: fruitStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching oil extraction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching oil extraction statistics',
      error: error.message
    });
  }
};
