const db = require('../db'); // PostgreSQL connection instance

// Validation helper functions
function validateStaffData(data) {
  const errors = [];
  
  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  } else if (data.full_name.trim().length > 100) {
    errors.push('Full name must be 100 characters or less');
  }
  
  if (!data.national_id || !/^[A-Za-z0-9]{6,20}$/.test(data.national_id)) {
    errors.push('National ID must be 6-20 alphanumeric characters');
  } else if (data.national_id.trim().length > 20) {
    errors.push('National ID must be 20 characters or less');
  }
  
  // Phone number is optional
  if (data.phone_number && data.phone_number.trim()) {
    if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(data.phone_number.trim())) {
      errors.push('Please enter a valid phone number');
    } else if (data.phone_number.trim().length > 15) {
      errors.push('Phone number must be 15 characters or less');
    }
  }
  
  return errors;
}

// Add new staff
async function addStaff(req, res) {
  const { full_name, national_id, phone_number } = req.body;
  try {
    // Validate input data
    const validationErrors = validateStaffData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    // Check for duplicate national ID
    const duplicateCheck = await db.query(
      `SELECT staff_id FROM staff WHERE national_id = $1`,
      [national_id]
    );
    
    if (duplicateCheck.rowCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'National ID already exists' 
      });
    }

    const result = await db.query(
      `INSERT INTO staff (full_name, national_id, phone_number)
       VALUES ($1, $2, $3) RETURNING *`,
      [full_name.trim(), national_id.toUpperCase(), phone_number ? phone_number.trim() : null]
    );
    res.json({ 
      success: true,
      message: 'Staff added successfully', 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error adding staff:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ 
        success: false,
        message: 'National ID already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Failed to add staff' 
      });
    }
  }
}

// Get all staff with filtering and sorting
async function getAllStaff(req, res) {
  try {
    const { search, sortBy = 'full_name', sortOrder = 'asc' } = req.query;
    
    let query = `SELECT * FROM staff WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (full_name ILIKE $${paramCount} OR national_id ILIKE $${paramCount} OR phone_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add sorting
    const validSortFields = ['full_name', 'national_id', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY full_name ASC`;
    }

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch staff' 
    });
  }
}

// Get single staff member by ID
async function getStaffById(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM staff WHERE staff_id = $1`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch staff member' 
    });
  }
}

// Update staff
async function updateStaff(req, res) {
  const { id } = req.params;
  const { full_name, national_id, phone_number } = req.body;
  try {
    // Validate input data
    const validationErrors = validateStaffData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ')
      });
    }

    // Check for duplicate national ID (excluding current staff)
    const duplicateCheck = await db.query(
      `SELECT staff_id FROM staff WHERE national_id = $1 AND staff_id != $2`,
      [national_id, id]
    );
    
    if (duplicateCheck.rowCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'National ID already exists' 
      });
    }

    const result = await db.query(
      `UPDATE staff SET full_name=$1, national_id=$2, phone_number=$3
       WHERE staff_id=$4 RETURNING *`,
      [full_name.trim(), national_id.toUpperCase(), phone_number ? phone_number.trim() : null, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Staff updated successfully', 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ 
        success: false,
        message: 'National ID already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Failed to update staff' 
      });
    }
  }
}

// Check if staff can be deleted
async function canDeleteStaff(req, res) {
  const { id } = req.params;
  try {
    // Check if staff has any shifts
    const shiftCheck = await db.query(
      `SELECT COUNT(*) as shift_count FROM shifts WHERE staff_id=$1`,
      [id]
    );
    
    // Check if staff has any salary records
    const salaryCheck = await db.query(
      `SELECT COUNT(*) as salary_count FROM salary_records WHERE staff_id=$1`,
      [id]
    );
    
    const shiftCount = parseInt(shiftCheck.rows[0].shift_count);
    const salaryCount = parseInt(salaryCheck.rows[0].salary_count);
    
    let canDelete = true;
    let reason = '';
    
    if (shiftCount > 0 || salaryCount > 0) {
      canDelete = false;
      const reasons = [];
      if (shiftCount > 0) reasons.push(`${shiftCount} shift record(s)`);
      if (salaryCount > 0) reasons.push(`${salaryCount} salary record(s)`);
      reason = `Staff has ${reasons.join(' and ')} that prevent deletion`;
    }
    
    res.json({
      success: true,
      data: {
        canDelete,
        reason: canDelete ? undefined : reason
      }
    });
  } catch (error) {
    console.error('Error checking staff deletion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check staff deletion status' 
    });
  }
}

// Delete staff
async function deleteStaff(req, res) {
  const { id } = req.params;
  try {
    // Check if staff can be deleted
    const shiftCheck = await db.query(
      `SELECT COUNT(*) as shift_count FROM shifts WHERE staff_id=$1`,
      [id]
    );
    
    const salaryCheck = await db.query(
      `SELECT COUNT(*) as salary_count FROM salary_records WHERE staff_id=$1`,
      [id]
    );
    
    const shiftCount = parseInt(shiftCheck.rows[0].shift_count);
    const salaryCount = parseInt(salaryCheck.rows[0].salary_count);
    
    if (shiftCount > 0 || salaryCount > 0) {
      const reasons = [];
      if (shiftCount > 0) reasons.push(`${shiftCount} shift record(s)`);
      if (salaryCount > 0) reasons.push(`${salaryCount} salary record(s)`);
      
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete staff with existing ${reasons.join(' and ')}` 
      });
    }

    const result = await db.query(`DELETE FROM staff WHERE staff_id=$1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Staff deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete staff' 
    });
  }
}

// Get staff statistics
async function getStaffStats(req, res) {
  try {
    // Get total staff count
    const totalStaffResult = await db.query(`SELECT COUNT(*) as total FROM staff`);
    const totalStaff = parseInt(totalStaffResult.rows[0].total);
    
    // Get active shifts count
    const activeShiftsResult = await db.query(
      `SELECT COUNT(*) as active FROM shifts WHERE shift_status = 'Open'`
    );
    const activeShifts = parseInt(activeShiftsResult.rows[0].active);
    

    
    // Get new staff this month
    const newThisMonthResult = await db.query(
      `SELECT COUNT(*) as new_count FROM staff 
       WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`
    );
    const newThisMonth = parseInt(newThisMonthResult.rows[0].new_count);
    
    res.json({
      success: true,
      data: {
        totalStaff,
        activeShifts,
        newThisMonth
      }
    });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch staff statistics' 
    });
  }
}

module.exports = { 
  addStaff, 
  getAllStaff, 
  getStaffById,
  updateStaff, 
  deleteStaff,
  canDeleteStaff,
  getStaffStats
};
