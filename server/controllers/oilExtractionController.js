const pool = require('../db');

// GET all
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM oil_extraction_logs ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET one
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM oil_extraction_logs WHERE id=$1', [id]);
    if (!rows.length) return res.status(404).send('Not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// POST
exports.create = async (req, res) => {
  try {
    const { date, fruit_type, input_quantity, oil_extracted, supplied_oil, waste, notes } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO oil_extraction_logs 
       (date, fruit_type, input_quantity, oil_extracted, supplied_oil, waste, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [date, fruit_type, input_quantity, oil_extracted, supplied_oil, waste, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// PUT
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, fruit_type, input_quantity, oil_extracted, supplied_oil, waste, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE oil_extraction_logs SET 
         date=$1, fruit_type=$2, input_quantity=$3, oil_extracted=$4,
         supplied_oil=$5, waste=$6, notes=$7
       WHERE id=$8
       RETURNING *`,
      [date, fruit_type, input_quantity, oil_extracted, supplied_oil, waste, notes, id]
    );
    if (!rows.length) return res.status(404).send('Not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM oil_extraction_logs WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).send('Not found');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
