const pool = require('../db');

// Get all approvers
exports.getApprovers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM approvers ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch approvers' });
  }
};

// Add a new approver
exports.addApprover = async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'INSERT INTO approvers (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add approver' });
  }
};

// Update an approver
exports.updateApprover = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const result = await pool.query(
      'UPDATE approvers SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update approver' });
  }
};

// Delete an approver
exports.deleteApprover = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM approvers WHERE id = $1', [id]);
    res.json({ message: 'Approver deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete approver' });
  }
};
