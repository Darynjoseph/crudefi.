const pool = require('../db');

// Validation helper functions
function validateAssetData(data) {
  const errors = [];
  
  if (!data.asset_name || data.asset_name.trim().length < 2) {
    errors.push('Asset name must be at least 2 characters long');
  } else if (data.asset_name.trim().length > 200) {
    errors.push('Asset name must be 200 characters or less');
  }
  
  if (!data.purchase_date) {
    errors.push('Purchase date is required');
  }
  
  if (!data.cost || isNaN(parseFloat(data.cost)) || parseFloat(data.cost) <= 0) {
    errors.push('Cost must be a valid positive number');
  }
  
  if (data.useful_life_years && (isNaN(parseInt(data.useful_life_years)) || parseInt(data.useful_life_years) <= 0)) {
    errors.push('Useful life must be a positive number of years');
  }
  
  return errors;
}

// Calculate depreciation amount based on method and period
function calculateDepreciation(cost, usefulLifeYears, method = 'straight_line', periodsElapsed = 1) {
  if (method === 'straight_line') {
    const annualDepreciation = cost / usefulLifeYears;
    return annualDepreciation * periodsElapsed;
  }
  // Add other depreciation methods here if needed
  return 0;
}

// GET all assets with filtering and search
exports.getAll = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT a.*,
             COALESCE(SUM(ed.depreciation_amount), 0) as total_depreciation,
             (a.cost - COALESCE(SUM(ed.depreciation_amount), 0)) as book_value
      FROM assets a
      LEFT JOIN expense_depreciation ed ON a.asset_id = ed.asset_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add filters
    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (a.asset_name ILIKE $${paramCount} OR a.asset_code ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY a.asset_id ORDER BY a.purchase_date DESC, a.asset_name`;

    const { rows } = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error('Error in assets getAll:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET one asset with depreciation history
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get asset data
    const assetQuery = `
      SELECT a.*,
             COALESCE(SUM(ed.depreciation_amount), 0) as total_depreciation,
             (a.cost - COALESCE(SUM(ed.depreciation_amount), 0)) as book_value
      FROM assets a
      LEFT JOIN expense_depreciation ed ON a.asset_id = ed.asset_id
      WHERE a.asset_id = $1
      GROUP BY a.asset_id
    `;
    const { rows: assetRows } = await pool.query(assetQuery, [id]);
    
    if (!assetRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const asset = assetRows[0];

    // Get depreciation history
    const depreciationQuery = `
      SELECT ed.*, e.expense_date, e.description
      FROM expense_depreciation ed
      JOIN expenses e ON ed.expense_id = e.expense_id
      WHERE ed.asset_id = $1
      ORDER BY ed.period DESC
    `;
    const { rows: depreciationRows } = await pool.query(depreciationQuery, [id]);

    asset.depreciation_history = depreciationRows;

    res.json({
      success: true,
      data: asset
    });
  } catch (err) {
    console.error('Error in assets getOne:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// CREATE new asset
exports.create = async (req, res) => {
  try {
    // Validate input data
    const validationErrors = validateAssetData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    const { 
      asset_name, 
      asset_code, 
      purchase_date, 
      cost, 
      useful_life_years = 5, 
      depreciation_method = 'straight_line',
      status = 'active'
    } = req.body;

    // Check for duplicate asset code if provided
    if (asset_code) {
      const duplicateCheck = await pool.query(
        `SELECT asset_id FROM assets WHERE asset_code = $1`,
        [asset_code]
      );
      
      if (duplicateCheck.rowCount > 0) {
        return res.status(409).json({
          success: false,
          message: 'Asset code already exists'
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO assets (asset_name, asset_code, purchase_date, cost, useful_life_years, depreciation_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [asset_name, asset_code, purchase_date, cost, useful_life_years, depreciation_method, status]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Asset created successfully'
    });
  } catch (err) {
    console.error('Error in assets create:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        message: 'Asset code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

// UPDATE asset
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input data
    const validationErrors = validateAssetData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    const { 
      asset_name, 
      asset_code, 
      purchase_date, 
      cost, 
      useful_life_years, 
      depreciation_method,
      status
    } = req.body;

    // Check for duplicate asset code if provided (excluding current record)
    if (asset_code) {
      const duplicateCheck = await pool.query(
        `SELECT asset_id FROM assets WHERE asset_code = $1 AND asset_id != $2`,
        [asset_code, id]
      );
      
      if (duplicateCheck.rowCount > 0) {
        return res.status(409).json({
          success: false,
          message: 'Asset code already exists'
        });
      }
    }

    const result = await pool.query(
      `UPDATE assets 
       SET asset_name = $1, asset_code = $2, purchase_date = $3, cost = $4, 
           useful_life_years = $5, depreciation_method = $6, status = $7, updated_at = NOW()
       WHERE asset_id = $8 RETURNING *`,
      [asset_name, asset_code, purchase_date, cost, useful_life_years, depreciation_method, status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Asset updated successfully'
    });
  } catch (err) {
    console.error('Error in assets update:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        message: 'Asset code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

// DELETE asset
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset is being used in depreciation records
    const usageCheck = await pool.query(
      `SELECT dep_id FROM expense_depreciation WHERE asset_id = $1 LIMIT 1`,
      [id]
    );
    
    if (usageCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete asset that has depreciation records'
      });
    }

    const result = await pool.query('DELETE FROM assets WHERE asset_id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (err) {
    console.error('Error in assets remove:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET asset statistics
exports.getStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_assets,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_assets,
        COUNT(CASE WHEN status = 'disposed' THEN 1 END) as disposed_assets,
        COALESCE(SUM(cost), 0) as total_cost,
        COALESCE(SUM(
          CASE WHEN status = 'active' THEN 
            cost - COALESCE((SELECT SUM(depreciation_amount) FROM expense_depreciation WHERE asset_id = assets.asset_id), 0)
          ELSE 0 END
        ), 0) as total_book_value,
        COALESCE(SUM(
          COALESCE((SELECT SUM(depreciation_amount) FROM expense_depreciation WHERE asset_id = assets.asset_id), 0)
        ), 0) as total_depreciation
      FROM assets
    `;

    const { rows } = await pool.query(statsQuery);
    const stats = rows[0];

    res.json({
      success: true,
      data: {
        totalAssets: parseInt(stats.total_assets),
        activeAssets: parseInt(stats.active_assets),
        disposedAssets: parseInt(stats.disposed_assets),
        totalCost: parseFloat(stats.total_cost),
        totalBookValue: parseFloat(stats.total_book_value),
        totalDepreciation: parseFloat(stats.total_depreciation)
      }
    });
  } catch (err) {
    console.error('Error in assets getStats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Calculate and suggest depreciation for an asset
exports.calculateDepreciation = async (req, res) => {
  try {
    const { id } = req.params;
    const { period } = req.query; // Expected format: YYYY-MM-DD

    // Get asset data
    const assetQuery = `
      SELECT a.*,
             COALESCE(SUM(ed.depreciation_amount), 0) as total_depreciation
      FROM assets a
      LEFT JOIN expense_depreciation ed ON a.asset_id = ed.asset_id
      WHERE a.asset_id = $1
      GROUP BY a.asset_id
    `;
    const { rows: assetRows } = await pool.query(assetQuery, [id]);
    
    if (!assetRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const asset = assetRows[0];
    const periodDate = period ? new Date(period) : new Date();
    const purchaseDate = new Date(asset.purchase_date);
    
    // Calculate months since purchase
    const monthsSincePurchase = Math.max(0, 
      (periodDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
      (periodDate.getMonth() - purchaseDate.getMonth())
    );
    
    const yearsElapsed = monthsSincePurchase / 12;
    const maxDepreciationAmount = parseFloat(asset.cost) - parseFloat(asset.total_depreciation);
    
    let suggestedDepreciation = 0;
    
    if (asset.depreciation_method === 'straight_line' && yearsElapsed > 0) {
      const annualDepreciation = parseFloat(asset.cost) / parseInt(asset.useful_life_years);
      const totalExpectedDepreciation = Math.min(annualDepreciation * yearsElapsed, parseFloat(asset.cost));
      suggestedDepreciation = Math.max(0, totalExpectedDepreciation - parseFloat(asset.total_depreciation));
    }

    // Ensure we don't depreciate more than the asset's value
    suggestedDepreciation = Math.min(suggestedDepreciation, maxDepreciationAmount);

    res.json({
      success: true,
      data: {
        asset_id: asset.asset_id,
        asset_name: asset.asset_name,
        cost: parseFloat(asset.cost),
        total_depreciation: parseFloat(asset.total_depreciation),
        book_value: parseFloat(asset.cost) - parseFloat(asset.total_depreciation),
        suggested_depreciation: suggestedDepreciation,
        period: periodDate.toISOString().split('T')[0],
        years_elapsed: yearsElapsed,
        remaining_value: maxDepreciationAmount
      }
    });
  } catch (err) {
    console.error('Error in assets calculateDepreciation:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};