const pool = require('../db');

// GET /api/misc-expenses
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM misc_expenses ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET /api/misc-expenses/:id
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM misc_expenses WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).send('Not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// POST /api/misc-expenses
exports.create = async (req, res) => {
  try {
    const { date, item_name, purpose, quantity, total_cost, approved_by, notes } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO misc_expenses 
        (date, item_name, purpose, quantity, total_cost, approved_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [date, item_name, purpose, quantity, total_cost, approved_by, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// PUT /api/misc-expenses/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, item_name, purpose, quantity, total_cost, approved_by, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE misc_expenses SET
         date = $1,
         item_name = $2,
         purpose = $3,
         quantity = $4,
         total_cost = $5,
         approved_by = $6,
         notes = $7
       WHERE id = $8
       RETURNING *`,
      [date, item_name, purpose, quantity, total_cost, approved_by, notes, id]
    );
    if (!rows.length) return res.status(404).send('Not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// DELETE /api/misc-expenses/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM misc_expenses WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).send('Not found');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
