const pool = require('../db');

// GET /api/petty-cash
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM petty_cash ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET /api/petty-cash/:id
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM petty_cash WHERE id=$1', [id]);
    if (!rows.length) return res.status(404).send('Not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// POST /api/petty-cash
exports.create = async (req, res) => {
  try {
    const { date, description, amount, spent_by, category_id, approved_by, notes } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO petty_cash (date, description, amount, spent_by, category_id, approved_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [date, description, amount, spent_by, category_id, approved_by, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// PUT /api/petty-cash/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, amount, spent_by, category_id, approved_by, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE petty_cash
       SET date=$1, description=$2, amount=$3, spent_by=$4, category_id=$5, approved_by=$6, notes=$7
       WHERE id=$8 RETURNING *`,
      [date, description, amount, spent_by, category_id, approved_by, notes, id]
    );
    if (!rows.length) return res.status(404).send('Not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// DELETE /api/petty-cash/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM petty_cash WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).send('Not found');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
