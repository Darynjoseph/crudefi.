const pool = require('../db');

// GET all with filtering and search (updated for normalized structure)
exports.getAll = async (req, res) => {
  try {
    const { fruit_type, dateFrom, dateTo, search } = req.query;
    
    // Use the detailed view for normalized data
    let query = `
      SELECT 
        oel.id, oel.date, oel.input_quantity_kg, oel.oil_extracted_l, 
        oel.supplied_oil_l, oel.waste_kg, oel.notes, oel.created_by,
        oel.created_at, oel.updated_at,
        f.fruit_name as fruit_type, f.fruit_id,
        -- Calculated fields
        ROUND((oel.oil_extracted_l * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as yield_percent,
        ROUND(((oel.oil_extracted_l + oel.supplied_oil_l) * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as efficiency_percent
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
      query += ` AND (f.fruit_name ILIKE $${paramCount} OR oel.notes ILIKE $${paramCount} OR oel.created_by ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY oel.date DESC';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error('Error in getAll oil extraction logs:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET one (updated for normalized structure)
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        oel.id, oel.date, oel.input_quantity_kg, oel.oil_extracted_l, 
        oel.supplied_oil_l, oel.waste_kg, oel.notes, oel.created_by,
        oel.created_at, oel.updated_at,
        f.fruit_name as fruit_type, f.fruit_id,
        -- Calculated fields
        ROUND((oel.oil_extracted_l * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as yield_percent,
        ROUND(((oel.oil_extracted_l + oel.supplied_oil_l) * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as efficiency_percent
      FROM oil_extraction_logs oel
      LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id
      WHERE oel.id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Oil extraction log not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in getOne oil extraction log:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// POST (updated for normalized structure)
exports.create = async (req, res) => {
  try {
    const {
      date, fruit_id, input_quantity_kg, oil_extracted_l, 
      supplied_oil_l, waste_kg, notes, created_by
    } = req.body;

    // Input validation
    if (!date || !fruit_id || !input_quantity_kg || oil_extracted_l === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, fruit_id, input_quantity_kg, oil_extracted_l'
      });
    }

    if (input_quantity_kg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Input quantity must be greater than 0'
      });
    }

    if (oil_extracted_l < 0 || supplied_oil_l < 0 || waste_kg < 0) {
      return res.status(400).json({
        success: false,
        message: 'Oil extracted, supplied oil, and waste cannot be negative'
      });
    }

    // Verify fruit exists
    const fruitCheck = await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id = $1', [fruit_id]);
    if (fruitCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fruit_id'
      });
    }

    // Validate yield efficiency (warn but don't block)
    const oilWeightKg = oil_extracted_l * 0.92;
    const yieldPercent = (oilWeightKg / input_quantity_kg) * 100;
    const wastePercent = (waste_kg / input_quantity_kg) * 100;
    
    let warnings = [];
    if (yieldPercent > 30) {
      warnings.push('Yield percentage seems unusually high (>30%)');
    }
    if (yieldPercent < 5) {
      warnings.push('Yield percentage seems unusually low (<5%)');
    }
    if (wastePercent > 90) {
      warnings.push('Waste percentage seems unusually high (>90%)');
    }
    if (wastePercent < 50) {
      warnings.push('Waste percentage seems unusually low (<50%)');
    }

    const insertQuery = `
      INSERT INTO oil_extraction_logs 
        (date, fruit_id, input_quantity_kg, oil_extracted_l, supplied_oil_l, 
         waste_kg, notes, created_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      date, fruit_id, input_quantity_kg, oil_extracted_l, 
      supplied_oil_l || 0, waste_kg || 0, notes, created_by || 'System'
    ]);

    // Get the complete record with fruit name
    const completeRecord = await pool.query(`
      SELECT 
        oel.*, f.fruit_name as fruit_type,
        ROUND((oel.oil_extracted_l * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as yield_percent,
        ROUND(((oel.oil_extracted_l + oel.supplied_oil_l) * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as efficiency_percent
      FROM oil_extraction_logs oel
      LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id
      WHERE oel.id = $1
    `, [rows[0].id]);
    
    res.status(201).json({
      success: true,
      data: completeRecord.rows[0],
      message: 'Oil extraction log created successfully',
      warnings: warnings.length > 0 ? warnings : undefined
    });
  } catch (err) {
    console.error('Error in create oil extraction log:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// PUT (updated for normalized structure)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date, fruit_id, input_quantity_kg, oil_extracted_l, 
      supplied_oil_l, waste_kg, notes
    } = req.body;

    // Input validation
    if (input_quantity_kg && input_quantity_kg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Input quantity must be greater than 0'
      });
    }

    if (oil_extracted_l < 0 || supplied_oil_l < 0 || waste_kg < 0) {
      return res.status(400).json({
        success: false,
        message: 'Oil extracted, supplied oil, and waste cannot be negative'
      });
    }

    // Verify fruit exists if provided
    if (fruit_id) {
      const fruitCheck = await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id = $1', [fruit_id]);
      if (fruitCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fruit_id'
        });
      }
    }

    // Check if record is locked (older than 2 hours)
    const lockCheck = await pool.query(
      'SELECT id, created_at FROM oil_extraction_logs WHERE id = $1',
      [id]
    );

    if (lockCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oil extraction log not found'
      });
    }

    const createdAt = new Date(lockCheck.rows[0].created_at);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    if (createdAt < twoHoursAgo) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit entries older than 2 hours'
      });
    }

    const updateQuery = `
      UPDATE oil_extraction_logs SET 
        date = $1, fruit_id = $2, input_quantity_kg = $3, oil_extracted_l = $4,
        supplied_oil_l = $5, waste_kg = $6, notes = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
      date, fruit_id, input_quantity_kg, oil_extracted_l,
      supplied_oil_l || 0, waste_kg || 0, notes, id
    ]);

    // Get the complete record with fruit name
    const completeRecord = await pool.query(`
      SELECT 
        oel.*, f.fruit_name as fruit_type,
        ROUND((oel.oil_extracted_l * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as yield_percent,
        ROUND(((oel.oil_extracted_l + oel.supplied_oil_l) * 0.92 / oel.input_quantity_kg * 100)::numeric, 2) as efficiency_percent
      FROM oil_extraction_logs oel
      LEFT JOIN fruits f ON oel.fruit_id = f.fruit_id
      WHERE oel.id = $1
    `, [rows[0].id]);
    
    res.json({
      success: true,
      data: completeRecord.rows[0],
      message: 'Oil extraction log updated successfully'
    });
  } catch (err) {
    console.error('Error in update oil extraction log:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if record is locked (older than 2 hours)
    const lockCheck = await pool.query(
      'SELECT id, created_at FROM oil_extraction_logs WHERE id = $1',
      [id]
    );

    if (lockCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oil extraction log not found'
      });
    }

    const createdAt = new Date(lockCheck.rows[0].created_at);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    if (createdAt < twoHoursAgo) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete entries older than 2 hours'
      });
    }

    const { rowCount } = await pool.query('DELETE FROM oil_extraction_logs WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Oil extraction log deleted successfully'
    });
  } catch (err) {
    console.error('Error in delete oil extraction log:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET statistics (updated for normalized structure)
exports.getStats = async (req, res) => {
  try {
    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_extractions,
        COALESCE(SUM(input_quantity_kg), 0) as total_input_kg,
        COALESCE(SUM(oil_extracted_l), 0) as total_oil_extracted_l,
        COALESCE(SUM(supplied_oil_l), 0) as total_supplied_oil_l,
        COALESCE(SUM(waste_kg), 0) as total_waste_kg,
        COALESCE(AVG((oil_extracted_l * 0.92 / input_quantity_kg * 100)), 0) as avg_yield_percent,
        COALESCE(AVG(((oil_extracted_l + supplied_oil_l) * 0.92 / input_quantity_kg * 100)), 0) as avg_efficiency_percent
      FROM oil_extraction_logs
      WHERE input_quantity_kg > 0
    `;
    
    // Get today's extractions
    const todayQuery = `
      SELECT COUNT(*) as extractions_today
      FROM oil_extraction_logs 
      WHERE date = CURRENT_DATE
    `;
    
    // Get this week's extractions
    const weekQuery = `
      SELECT COUNT(*) as extractions_this_week
      FROM oil_extraction_logs 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `;

    // Get stats by fruit type
    const fruitStatsQuery = `
      SELECT 
        f.fruit_name,
        COUNT(oel.id) as extraction_count,
        COALESCE(SUM(oel.input_quantity_kg), 0) as total_input_kg,
        COALESCE(SUM(oel.oil_extracted_l), 0) as total_oil_extracted_l,
        COALESCE(AVG((oel.oil_extracted_l * 0.92 / oel.input_quantity_kg * 100)), 0) as avg_yield_percent
      FROM fruits f
      LEFT JOIN oil_extraction_logs oel ON f.fruit_id = oel.fruit_id AND oel.input_quantity_kg > 0
      GROUP BY f.fruit_id, f.fruit_name
      ORDER BY extraction_count DESC
    `;

    const [statsResult, todayResult, weekResult, fruitStatsResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(todayQuery),
      pool.query(weekQuery),
      pool.query(fruitStatsQuery)
    ]);

    const stats = statsResult.rows[0];
    const today = todayResult.rows[0];
    const week = weekResult.rows[0];

    res.json({
      success: true,
      data: {
        overview: {
          totalExtractions: parseInt(stats.total_extractions),
          totalInputKg: parseFloat(stats.total_input_kg),
          totalOilExtractedL: parseFloat(stats.total_oil_extracted_l),
          totalSuppliedOilL: parseFloat(stats.total_supplied_oil_l),
          totalWasteKg: parseFloat(stats.total_waste_kg),
          avgYieldPercent: parseFloat(stats.avg_yield_percent),
          avgEfficiencyPercent: parseFloat(stats.avg_efficiency_percent),
          extractionsToday: parseInt(today.extractions_today),
          extractionsThisWeek: parseInt(week.extractions_this_week)
        },
        fruitStats: fruitStatsResult.rows
      }
    });
  } catch (err) {
    console.error('Error in getStats oil extraction logs:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// New function to get fruits for dropdown
exports.getFruits = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT fruit_id, fruit_name FROM fruits ORDER BY fruit_name');
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('Error in getFruits:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
