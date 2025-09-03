const pool = require('../db');

// GET all with filtering and search (updated for normalized structure)
exports.getAll = async (req, res) => {
  try {
    const { supplier_name, dateFrom, dateTo, fruit_type, search } = req.query;
    
    // Use the detailed view for normalized data
    let query = `
      SELECT 
        fd.id, fd.date, fd.supplier_contact, fd.vehicle_number, 
        fd.weight_kg, fd.price_per_kg, fd.total_cost, fd.ticket_number, 
        fd.approved_by, fd.notes, fd.created_at, fd.updated_at,
        s.supplier_name, s.supplier_id,
        f.fruit_name as fruit_type, f.fruit_id
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add filters
    if (supplier_name) {
      paramCount++;
      query += ` AND s.supplier_name ILIKE $${paramCount}`;
      params.push(`%${supplier_name}%`);
    }

    if (fruit_type) {
      paramCount++;
      query += ` AND f.fruit_name ILIKE $${paramCount}`;
      params.push(`%${fruit_type}%`);
    }

    if (dateFrom) {
      paramCount++;
      query += ` AND fd.date >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND fd.date <= $${paramCount}`;
      params.push(dateTo);
    }

    if (search) {
      paramCount++;
      query += ` AND (s.supplier_name ILIKE $${paramCount} OR f.fruit_name ILIKE $${paramCount} OR fd.notes ILIKE $${paramCount} OR fd.ticket_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY fd.date DESC';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error('Error in getAll:', err);
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
        fd.id, fd.date, fd.supplier_contact, fd.vehicle_number, 
        fd.weight_kg, fd.price_per_kg, fd.total_cost, fd.ticket_number, 
        fd.approved_by, fd.notes, fd.created_at, fd.updated_at,
        s.supplier_name, s.supplier_id,
        f.fruit_name as fruit_type, f.fruit_id
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      WHERE fd.id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in getOne:', err);
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
      date, supplier_id, supplier_contact, vehicle_number,
      fruit_id, weight_kg, price_per_kg, ticket_number,
      approved_by, notes
    } = req.body;

    // Input validation
    if (!date || !supplier_id || !fruit_id || !weight_kg || !price_per_kg) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, supplier_id, fruit_id, weight_kg, price_per_kg'
      });
    }

    if (weight_kg <= 0 || price_per_kg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Weight and price per kg must be greater than 0'
      });
    }

    // Verify supplier and fruit exist
    const supplierCheck = await pool.query('SELECT supplier_id FROM suppliers WHERE supplier_id = $1', [supplier_id]);
    if (supplierCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier_id'
      });
    }

    const fruitCheck = await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id = $1', [fruit_id]);
    if (fruitCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fruit_id'
      });
    }

    // Calculate total cost
    const total_cost = weight_kg * price_per_kg;

    const insertQuery = `
      INSERT INTO fruit_deliveries 
        (date, supplier_id, supplier_contact, vehicle_number, fruit_id, 
         weight_kg, price_per_kg, total_cost, ticket_number, approved_by, notes, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      date, supplier_id, supplier_contact, vehicle_number, fruit_id,
      weight_kg, price_per_kg, total_cost, ticket_number, approved_by, notes
    ]);

    // Get the complete record with supplier and fruit names
    const completeRecord = await pool.query(`
      SELECT 
        fd.*, s.supplier_name, f.fruit_name as fruit_type
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      WHERE fd.id = $1
    `, [rows[0].id]);
    
    res.status(201).json({
      success: true,
      data: completeRecord.rows[0],
      message: 'Delivery created successfully'
    });
  } catch (err) {
    console.error('Error in create:', err);
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
      date, supplier_id, supplier_contact, vehicle_number,
      fruit_id, weight_kg, price_per_kg, ticket_number,
      approved_by, notes
    } = req.body;

    // Input validation
    if (weight_kg && weight_kg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be greater than 0'
      });
    }

    if (price_per_kg && price_per_kg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per kg must be greater than 0'
      });
    }

    // Verify supplier and fruit exist if provided
    if (supplier_id) {
      const supplierCheck = await pool.query('SELECT supplier_id FROM suppliers WHERE supplier_id = $1', [supplier_id]);
      if (supplierCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier_id'
        });
      }
    }

    if (fruit_id) {
      const fruitCheck = await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id = $1', [fruit_id]);
      if (fruitCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fruit_id'
        });
      }
    }

    // Calculate total cost
    const total_cost = weight_kg && price_per_kg ? weight_kg * price_per_kg : null;

    const updateQuery = `
      UPDATE fruit_deliveries SET 
        date = $1, supplier_id = $2, supplier_contact = $3, vehicle_number = $4,
        fruit_id = $5, weight_kg = $6, price_per_kg = $7, 
        ${total_cost ? 'total_cost = $8,' : ''} ticket_number = $${total_cost ? '9' : '8'},
        approved_by = $${total_cost ? '10' : '9'}, notes = $${total_cost ? '11' : '10'}, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $${total_cost ? '12' : '11'}
      RETURNING *
    `;

    const updateParams = total_cost 
      ? [date, supplier_id, supplier_contact, vehicle_number, fruit_id, weight_kg, price_per_kg, total_cost, ticket_number, approved_by, notes, id]
      : [date, supplier_id, supplier_contact, vehicle_number, fruit_id, weight_kg, price_per_kg, ticket_number, approved_by, notes, id];

    const { rows } = await pool.query(updateQuery, updateParams);
    
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Get the complete record with supplier and fruit names
    const completeRecord = await pool.query(`
      SELECT 
        fd.*, s.supplier_name, f.fruit_name as fruit_type
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      WHERE fd.id = $1
    `, [rows[0].id]);
    
    res.json({
      success: true,
      data: completeRecord.rows[0],
      message: 'Delivery updated successfully'
    });
  } catch (err) {
    console.error('Error in update:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// DELETE (unchanged)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM fruit_deliveries WHERE id=$1', [id]);
    
    if (!rowCount) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (err) {
    console.error('Error in delete:', err);
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
        COUNT(*) as total_deliveries,
        COALESCE(SUM(weight_kg), 0) as total_weight,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(AVG(price_per_kg), 0) as average_cost_per_kg
      FROM fruit_deliveries
    `;
    
    // Get today's deliveries
    const todayQuery = `
      SELECT COUNT(*) as deliveries_today
      FROM fruit_deliveries 
      WHERE date = CURRENT_DATE
    `;
    
    // Get this week's deliveries
    const weekQuery = `
      SELECT COUNT(*) as deliveries_this_week
      FROM fruit_deliveries 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `;

    // Get stats by supplier
    const supplierStatsQuery = `
      SELECT 
        s.supplier_name,
        COUNT(fd.id) as delivery_count,
        COALESCE(SUM(fd.weight_kg), 0) as total_weight,
        COALESCE(SUM(fd.total_cost), 0) as total_value
      FROM suppliers s
      LEFT JOIN fruit_deliveries fd ON s.supplier_id = fd.supplier_id
      WHERE s.status = 'active'
      GROUP BY s.supplier_id, s.supplier_name
      ORDER BY delivery_count DESC
      LIMIT 10
    `;

    // Get stats by fruit type
    const fruitStatsQuery = `
      SELECT 
        f.fruit_name,
        COUNT(fd.id) as delivery_count,
        COALESCE(SUM(fd.weight_kg), 0) as total_weight,
        COALESCE(SUM(fd.total_cost), 0) as total_value
      FROM fruits f
      LEFT JOIN fruit_deliveries fd ON f.fruit_id = fd.fruit_id
      GROUP BY f.fruit_id, f.fruit_name
      ORDER BY delivery_count DESC
    `;

    const [statsResult, todayResult, weekResult, supplierStatsResult, fruitStatsResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(todayQuery),
      pool.query(weekQuery),
      pool.query(supplierStatsQuery),
      pool.query(fruitStatsQuery)
    ]);

    const stats = statsResult.rows[0];
    const today = todayResult.rows[0];
    const week = weekResult.rows[0];

    res.json({
      success: true,
      data: {
        overview: {
          totalDeliveries: parseInt(stats.total_deliveries),
          totalWeight: parseFloat(stats.total_weight),
          totalCost: parseFloat(stats.total_cost),
          averageCostPerKg: parseFloat(stats.average_cost_per_kg),
          deliveriesToday: parseInt(today.deliveries_today),
          deliveriesThisWeek: parseInt(week.deliveries_this_week)
        },
        supplierStats: supplierStatsResult.rows,
        fruitStats: fruitStatsResult.rows
      }
    });
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// New function to get suppliers for dropdown
exports.getSuppliers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT supplier_id, supplier_name FROM suppliers WHERE status = $1 ORDER BY supplier_name', ['active']);
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('Error in getSuppliers:', err);
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
