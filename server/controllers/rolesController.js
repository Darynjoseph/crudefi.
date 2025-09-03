const pool = require('../db');

// GET /api/roles
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM roles ORDER BY role_name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET /api/roles/:role_name
exports.getOne = async (req, res) => {
  try {
    const { role_name } = req.params;
    const { rows } = await pool.query('SELECT * FROM roles WHERE role_name=$1', [role_name]);
    if (!rows.length) return res.status(404).send('Role not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// POST /api/roles
exports.create = async (req, res) => {
  try {
    const { role_name, base_daily_rate } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO roles (role_name, base_daily_rate) VALUES ($1, $2) RETURNING *',
      [role_name, base_daily_rate]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// PUT /api/roles/:role_name
exports.update = async (req, res) => {
  try {
    const { role_name } = req.params;
    const { base_daily_rate } = req.body;
    const { rows } = await pool.query(
      'UPDATE roles SET base_daily_rate=$1 WHERE role_name=$2 RETURNING *',
      [base_daily_rate, role_name]
    );
    if (!rows.length) return res.status(404).send('Role not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// DELETE /api/roles/:role_name
exports.remove = async (req, res) => {
  try {
    const { role_name } = req.params;
    
    // Check if role is in use by any shifts
    const shiftCheck = await pool.query(
      'SELECT COUNT(*) FROM shifts WHERE role = $1',
      [role_name]
    );
    
    if (parseInt(shiftCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role that is assigned to existing shifts'
      });
    }
    
    const { rowCount } = await pool.query('DELETE FROM roles WHERE role_name=$1', [role_name]);
    if (!rowCount) return res.status(404).send('Role not found');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
