const pool = require('../db');

// GET all with filtering and search (updated for normalized structure)
exports.getAll = async (req, res) => {
  try {
    const { supplier_name, dateFrom, dateTo, fruit_type, search } = req.query;
    
    // Use JOINs to get supplier and fruit names
    let query = `
      SELECT 
        fd.*,
        s.supplier_name,
        s.contact_info as supplier_contact,
        f.fruit_name as fruit_type
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

    query += ' ORDER BY fd.date DESC, fd.id DESC';

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries',
      error: error.message
    });
  }
};

// GET one by ID (updated for normalized structure)
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        fd.*,
        s.supplier_name,
        s.contact_info as supplier_contact,
        f.fruit_name as fruit_type
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      WHERE fd.id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery',
      error: error.message
    });
  }
};

// CREATE new delivery (updated for normalized structure)
exports.create = async (req, res) => {
  try {
    const {
      date,
      supplier_id,
      fruit_id,
      weight_kg,
      price_per_kg,
      vehicle_number,
      ticket_number,
      approved_by,
      notes
    } = req.body;

    // Validate required fields
    if (!date || !supplier_id || !fruit_id || !weight_kg || !price_per_kg) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: date, supplier_id, fruit_id, weight_kg, price_per_kg'
      });
    }

    // Validate that supplier and fruit exist
    const supplierCheck = await pool.query('SELECT supplier_id FROM suppliers WHERE supplier_id = $1', [supplier_id]);
    if (supplierCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier_id. Supplier does not exist.'
      });
    }

    const fruitCheck = await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id = $1', [fruit_id]);
    if (fruitCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fruit_id. Fruit does not exist.'
      });
    }

    // Insert new delivery (total_cost is calculated automatically)
    const insertQuery = `
      INSERT INTO fruit_deliveries (
        date, supplier_id, fruit_id, weight_kg, price_per_kg, 
        vehicle_number, ticket_number, approved_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      date,
      supplier_id,
      fruit_id,
      weight_kg,
      price_per_kg,
      vehicle_number,
      ticket_number,
      approved_by,
      notes
    ]);

    // Get the complete record with supplier and fruit names
    const completeRecord = await pool.query(`
      SELECT 
        fd.*,
        s.supplier_name,
        s.contact_info as supplier_contact,
        f.fruit_name as fruit_type
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
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery',
      error: error.message
    });
  }
};

// UPDATE delivery (updated for normalized structure)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      supplier_id,
      fruit_id,
      weight_kg,
      price_per_kg,
      vehicle_number,
      ticket_number,
      approved_by,
      notes
    } = req.body;

    // Check if delivery exists
    const existingDelivery = await pool.query('SELECT id FROM fruit_deliveries WHERE id = $1', [id]);
    if (existingDelivery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Validate foreign keys if provided
    if (supplier_id) {
      const supplierCheck = await pool.query('SELECT supplier_id FROM suppliers WHERE supplier_id = $1', [supplier_id]);
      if (supplierCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier_id. Supplier does not exist.'
        });
      }
    }

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
    if (supplier_id !== undefined) {
      paramCount++;
      updateFields.push(`supplier_id = $${paramCount}`);
      params.push(supplier_id);
    }
    if (fruit_id !== undefined) {
      paramCount++;
      updateFields.push(`fruit_id = $${paramCount}`);
      params.push(fruit_id);
    }
    if (weight_kg !== undefined) {
      paramCount++;
      updateFields.push(`weight_kg = $${paramCount}`);
      params.push(weight_kg);
    }
    if (price_per_kg !== undefined) {
      paramCount++;
      updateFields.push(`price_per_kg = $${paramCount}`);
      params.push(price_per_kg);
    }
    if (vehicle_number !== undefined) {
      paramCount++;
      updateFields.push(`vehicle_number = $${paramCount}`);
      params.push(vehicle_number);
    }
    if (ticket_number !== undefined) {
      paramCount++;
      updateFields.push(`ticket_number = $${paramCount}`);
      params.push(ticket_number);
    }
    if (approved_by !== undefined) {
      paramCount++;
      updateFields.push(`approved_by = $${paramCount}`);
      params.push(approved_by);
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
      UPDATE fruit_deliveries 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    await pool.query(updateQuery, params);

    // Get the complete updated record with supplier and fruit names
    const completeRecord = await pool.query(`
      SELECT 
        fd.*,
        s.supplier_name,
        s.contact_info as supplier_contact,
        f.fruit_name as fruit_type
      FROM fruit_deliveries fd
      LEFT JOIN suppliers s ON fd.supplier_id = s.supplier_id
      LEFT JOIN fruits f ON fd.fruit_id = f.fruit_id
      WHERE fd.id = $1
    `, [id]);

    res.json({
      success: true,
      data: completeRecord.rows[0],
      message: 'Delivery updated successfully'
    });
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery',
      error: error.message
    });
  }
};

// DELETE delivery
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if delivery exists
    const existingDelivery = await pool.query('SELECT id FROM fruit_deliveries WHERE id = $1', [id]);
    if (existingDelivery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    await pool.query('DELETE FROM fruit_deliveries WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting delivery',
      error: error.message
    });
  }
};

// GET delivery statistics (updated for normalized structure)
exports.getStats = async (req, res) => {
  try {
    // Overview stats
    const overviewQuery = `
      SELECT 
        COUNT(*) as total_deliveries,
        COALESCE(SUM(weight_kg), 0) as total_weight,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(AVG(price_per_kg), 0) as average_cost_per_kg,
        COUNT(CASE WHEN DATE(date) = CURRENT_DATE THEN 1 END) as deliveries_today,
        COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as deliveries_this_week
      FROM fruit_deliveries
    `;

    const overviewResult = await pool.query(overviewQuery);

    // Supplier stats
    const supplierStatsQuery = `
      SELECT 
        s.supplier_name,
        COUNT(fd.id) as delivery_count,
        COALESCE(SUM(fd.weight_kg), 0) as total_weight,
        COALESCE(SUM(fd.total_cost), 0) as total_value
      FROM suppliers s
      LEFT JOIN fruit_deliveries fd ON s.supplier_id = fd.supplier_id
      GROUP BY s.supplier_id, s.supplier_name
      ORDER BY delivery_count DESC, total_value DESC
      LIMIT 10
    `;

    const supplierStatsResult = await pool.query(supplierStatsQuery);

    // Fruit stats
    const fruitStatsQuery = `
      SELECT 
        f.fruit_name,
        COUNT(fd.id) as delivery_count,
        COALESCE(SUM(fd.weight_kg), 0) as total_weight,
        COALESCE(SUM(fd.total_cost), 0) as total_value
      FROM fruits f
      LEFT JOIN fruit_deliveries fd ON f.fruit_id = fd.fruit_id
      GROUP BY f.fruit_id, f.fruit_name
      ORDER BY delivery_count DESC, total_value DESC
    `;

    const fruitStatsResult = await pool.query(fruitStatsQuery);

    res.json({
      success: true,
      data: {
        overview: overviewResult.rows[0],
        supplierStats: supplierStatsResult.rows,
        fruitStats: fruitStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching delivery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery statistics',
      error: error.message
    });
  }
};
