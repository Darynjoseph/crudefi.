const db = require('../db');

// Get all salary records
async function getAllSalaryRecords(req, res) {
  try {
    const result = await db.query(
      `SELECT 
         sr.record_id,
         sr.shift_id,
         sr.staff_id,
         sr.total_hours,
         sr.hourly_rate,
         sr.total_amount,
         sr.payment_status,
         sr.deduction_reason,
         sr.created_at,
         st.full_name as staff_name,
         sh.role,
         sh.role_rate,
         sh.date as shift_date
       FROM salary_records sr
       JOIN staff st ON sr.staff_id = st.staff_id
       JOIN shifts sh ON sr.shift_id = sh.shift_id
       ORDER BY sr.record_id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch salary records' });
  }
}

// Get single salary record
async function getSalaryById(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT 
         sr.record_id,
         sr.shift_id,
         sr.staff_id,
         sr.total_hours,
         sr.hourly_rate,
         sr.total_amount,
         sr.payment_status,
         sr.deduction_reason,
         sr.created_at,
         st.full_name as staff_name,
         sh.role,
         sh.role_rate,
         sh.date as shift_date
       FROM salary_records sr
       JOIN staff st ON sr.staff_id = st.staff_id
       JOIN shifts sh ON sr.shift_id = sh.shift_id
       WHERE sr.record_id = $1`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Salary record not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch salary record' });
  }
}

// Mark salary as Paid
async function markSalaryAsPaid(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      `UPDATE salary_records SET payment_status='Paid' WHERE record_id=$1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Salary marked as Paid', record: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update salary status' });
  }
}

// Monthly report
async function getMonthlyReport(req, res) {
  const { month } = req.query; // e.g., 2025-08
  try {
    const result = await db.query(
      `SELECT st.full_name as staff_name, sh.role,
              SUM(sr.total_hours) AS total_hours,
              SUM(sr.total_amount) AS total_paid,
              COUNT(sr.record_id) AS total_shifts
       FROM salary_records sr
       JOIN staff st ON sr.staff_id = st.staff_id
       JOIN shifts sh ON sr.shift_id = sh.shift_id
       WHERE TO_CHAR(sr.created_at, 'YYYY-MM') = $1
       GROUP BY st.full_name, sh.role
       ORDER BY st.full_name, sh.role`,
      [month]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

module.exports = {
  getAllSalaryRecords,
  getSalaryById,
  markSalaryAsPaid,
  getMonthlyReport
};
