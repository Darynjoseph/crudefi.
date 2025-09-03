const db = require('../db');

// Get all shifts with staff information
async function getShifts(req, res) {
  try {
    const { date, status, role, staff_name } = req.query;
    
    let query = `
      SELECT 
        s.*,
        st.full_name as staff_name,
        st.national_id,
        st.phone_number
      FROM shifts s
      JOIN staff st ON s.staff_id = st.staff_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add filters
    if (date) {
      paramCount++;
      query += ` AND s.date = $${paramCount}`;
      params.push(date);
    }

    if (status) {
      paramCount++;
      query += ` AND s.shift_status = $${paramCount}`;
      params.push(status);
    }

    if (role) {
      paramCount++;
      query += ` AND s.role ILIKE $${paramCount}`;
      params.push(`%${role}%`);
    }

    if (staff_name) {
      paramCount++;
      query += ` AND st.full_name ILIKE $${paramCount}`;
      params.push(`%${staff_name}%`);
    }

    query += ' ORDER BY s.date DESC, s.login_time DESC';

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch shifts' 
    });
  }
}

// Get shift statistics
async function getShiftStats(req, res) {
  try {
    // Compute "today" in the Pacific/Auckland timezone (matches DB date)
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date()); // format "YYYY-MM-DD"
    
    console.log(' [DEBUG] Today (Pacific/Auckland) for shift stats:', today);
    
    // Log DB date for reference
    const dateCheck = await db.query(`SELECT CURRENT_DATE as db_date, CURRENT_TIMESTAMP as db_timestamp`);
    console.log(' [DEBUG] Database date check:', {
      db_date: dateCheck.rows[0].db_date,
      db_timestamp: dateCheck.rows[0].db_timestamp,
      client_utc_date: today
    });

    const statsQuery = `
      WITH today_shifts AS (
        SELECT * FROM shifts 
        WHERE (date AT TIME ZONE 'Pacific/Auckland')::date = $1::date
      ),
      stats AS (
        SELECT 
          COUNT(*) as total_shifts,
          COUNT(CASE WHEN shift_status = 'Open' THEN 1 END) as active_shifts,
          COUNT(CASE WHEN shift_id IN (SELECT shift_id FROM today_shifts) THEN 1 END) as shifts_today,
          COALESCE(AVG(actual_hours), 0) as avg_hours,
          COALESCE(SUM(actual_hours), 0) as total_hours
        FROM shifts
      )
      SELECT * FROM stats
    `;
    
    const result = await db.query(statsQuery, [today]);
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        totalShifts: parseInt(stats.total_shifts),
        activeShifts: parseInt(stats.active_shifts),
        shiftsToday: parseInt(stats.shifts_today),
        averageHours: parseFloat(stats.avg_hours),
        totalHours: parseFloat(stats.total_hours)
      }
    });
  } catch (error) {
    console.error('Error fetching shift stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch shift statistics' 
    });
  }
}

// Open shift
async function openShift(req, res) {
  const { staff_id, manager_id, login_time, role } = req.body;

  try {
    // Validate required fields
    if (!staff_id || !manager_id || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: staff_id, manager_id, role' 
      });
    }

    // Check if staff exists
    const staffCheck = await db.query(
      `SELECT * FROM staff WHERE staff_id=$1`,
      [staff_id]
    );
    if (staffCheck.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff not found' 
      });
    }

    // Check if role exists and get the base daily rate
    const roleCheck = await db.query(
      `SELECT base_daily_rate FROM roles WHERE role_name=$1`,
      [role]
    );
    if (roleCheck.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }
    const roleRate = roleCheck.rows[0].base_daily_rate;

    // Check if staff already has an open shift
    const checkOpen = await db.query(
      `SELECT * FROM shifts WHERE staff_id=$1 AND shift_status='Open'`,
      [staff_id]
    );
    if (checkOpen.rowCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Staff already has an open shift' 
      });
    }

    const shiftLoginTime = login_time ? new Date(login_time) : new Date();
    
    const result = await db.query(
      `INSERT INTO shifts (staff_id, date, login_time, shift_status, role, role_rate, created_by)
       VALUES ($1, CURRENT_DATE, $2, 'Open', $3, $4, $5) RETURNING *`,
      [staff_id, shiftLoginTime, role, roleRate, manager_id]
    );

    res.json({ 
      success: true,
      message: 'Shift opened successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error opening shift:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to open shift' 
    });
  }
}

// Close shift
async function closeShift(req, res) {
  const { shift_id } = req.params;
  const { manager_id, logout_time, deduction_reason } = req.body;

  try {
    // Validate required fields
    if (!manager_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required field: manager_id' 
      });
    }

    const shiftResult = await db.query(
      `SELECT s.* FROM shifts s 
       WHERE s.shift_id=$1 AND s.shift_status='Open'`,
      [shift_id]
    );
    
    if (shiftResult.rowCount === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Shift not found or already closed' 
      });
    }

    const shift = shiftResult.rows[0];
    const loginTime = new Date(shift.login_time);
    const shiftLogoutTime = logout_time ? new Date(logout_time) : new Date();
    let actualHours = ((shiftLogoutTime - loginTime) / 3600000) - 1; // minus 1 hour break

    // Cap at 10 hours maximum
    if (actualHours >= 10) actualHours = 10;
    
    // Handle shifts less than 1 hour
    if (actualHours < 1) {
      await db.query(
        `UPDATE shifts SET logout_time=$1, shift_status='Closed', actual_hours=0,
         deduction_reason=$2, closed_by=$3 WHERE shift_id=$4`,
        [shiftLogoutTime, 'Worked less than 1 hour', manager_id, shift_id]
      );
      return res.json({ 
        success: true,
        message: 'Shift closed with zero hours (less than 1 hour worked)' 
      });
    }

    // Require deduction reason for early closure
    if (actualHours < 10 && !deduction_reason) {
      return res.status(400).json({ 
        success: false,
        message: 'Deduction reason required for early closure' 
      });
    }

    // Update shift record
    await db.query(
      `UPDATE shifts SET logout_time=$1, shift_status='Closed', actual_hours=$2,
       deduction_reason=$3, closed_by=$4 WHERE shift_id=$5`,
      [shiftLogoutTime, actualHours, deduction_reason || null, manager_id, shift_id]
    );

    // Check if salary record already exists for this shift
    const existingSalary = await db.query(
      `SELECT * FROM salary_records WHERE shift_id=$1`,
      [shift_id]
    );
    if (existingSalary.rowCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Salary record already exists for this shift' 
      });
    }

    // Calculate salary using role_rate from shift (not base_daily_rate from staff)
    const roleRate = parseFloat(shift.role_rate);
    const hourlyRate = roleRate / 10;
    const totalAmount = hourlyRate * actualHours;

    // Record salary with deduction reason if applicable
    await db.query(
      `INSERT INTO salary_records (shift_id, staff_id, total_hours, hourly_rate, total_amount, deduction_reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [shift_id, shift.staff_id, actualHours, hourlyRate, totalAmount, deduction_reason || null]
    );

    res.json({ 
      success: true,
      message: 'Shift closed and salary recorded successfully',
      data: {
        actual_hours: actualHours,
        hourly_rate: hourlyRate,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('Error closing shift:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to close shift' 
    });
  }
}

module.exports = { 
  getShifts, 
  getShiftStats, 
  openShift, 
  closeShift 
};
