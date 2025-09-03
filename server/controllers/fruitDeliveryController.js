const pool = require('../db');

// GET all with filtering and search
exports.getAll = async (req, res) => {
  try {
    const { supplier_name, dateFrom, dateTo, fruit_type, search } = req.query;
    
    let query = 'SELECT *, (weight * price_per_kg) as total_cost FROM fruit_deliveries WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add filters
    if (supplier_name) {
      paramCount++;
      query += ` AND supplier_name ILIKE $${paramCount}`;
      params.push(`%${supplier_name}%`);
    }

    if (fruit_type) {
      paramCount++;
      query += ` AND fruit_type ILIKE $${paramCount}`;
      params.push(`%${fruit_type}%`);
    }

    if (dateFrom) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(dateTo);
    }

    if (search) {
      paramCount++;
      query += ` AND (supplier_name ILIKE $${paramCount} OR fruit_type ILIKE $${paramCount} OR notes ILIKE $${paramCount} OR ticket_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY date DESC';

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

// GET one
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT *, (weight * price_per_kg) as total_cost FROM fruit_deliveries WHERE id=$1', 
      [id]
    );
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

// POST
exports.create = async (req, res) => {
  try {
    const {
      date, supplier_name, supplier_contact, vehicle_number,
      fruit_type, weight, price_per_kg, ticket_number,
      approved_by, notes
    } = req.body;

    // Input validation
    if (!date || !supplier_name || !fruit_type || !weight || !price_per_kg) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, supplier_name, fruit_type, weight, price_per_kg'
      });
    }

    if (weight <= 0 || price_per_kg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Weight and price per kg must be greater than 0'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO fruit_deliveries 
        (date, supplier_name, supplier_contact, vehicle_number, fruit_type, 
         weight, price_per_kg, ticket_number, approved_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *, (weight * price_per_kg) as total_cost`,
      [
        date, supplier_name, supplier_contact, vehicle_number,
        fruit_type, weight, price_per_kg, ticket_number,
        approved_by, notes
      ]
    );
    
    res.status(201).json({
      success: true,
      data: rows[0],
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

// PUT
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date, supplier_name, supplier_contact, vehicle_number,
      fruit_type, weight, price_per_kg, ticket_number,
      approved_by, notes
    } = req.body;

    // Input validation
    if (weight && weight <= 0) {
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

    const { rows } = await pool.query(
      `UPDATE fruit_deliveries SET 
        date=$1, supplier_name=$2, supplier_contact=$3, vehicle_number=$4,
        fruit_type=$5, weight=$6, price_per_kg=$7, ticket_number=$8,
        approved_by=$9, notes=$10
       WHERE id=$11
       RETURNING *, (weight * price_per_kg) as total_cost`,
      [
        date, supplier_name, supplier_contact, vehicle_number,
        fruit_type, weight, price_per_kg, ticket_number,
        approved_by, notes, id
      ]
    );
    
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
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

// DELETE
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

// GET statistics
exports.getStats = async (req, res) => {
  try {
    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_deliveries,
        COALESCE(SUM(weight), 0) as total_weight,
        COALESCE(SUM(weight * price_per_kg), 0) as total_cost,
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

    const [statsResult, todayResult, weekResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(todayQuery),
      pool.query(weekQuery)
    ]);

    const stats = statsResult.rows[0];
    const today = todayResult.rows[0];
    const week = weekResult.rows[0];

    res.json({
      success: true,
      data: {
        totalDeliveries: parseInt(stats.total_deliveries),
        totalWeight: parseFloat(stats.total_weight),
        totalCost: parseFloat(stats.total_cost),
        averageCostPerKg: parseFloat(stats.average_cost_per_kg),
        deliveriesToday: parseInt(today.deliveries_today),
        deliveriesThisWeek: parseInt(week.deliveries_this_week)
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
