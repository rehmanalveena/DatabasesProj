const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Get all loans
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Loan');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get loan by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Loan WHERE Loan_ID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new loan
router.post('/', async (req, res) => {
  const { book_id, member_id, loan_date, return_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Loan (Book_ID, Member_ID, Loan_Date, Return_Date) VALUES ($1, $2, $3, $4) RETURNING *',
      [book_id, member_id, loan_date, return_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update loan
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { book_id, member_id, loan_date, return_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Loan SET Book_ID = $1, Member_ID = $2, Loan_Date = $3, Return_Date = $4 WHERE Loan_ID = $5 RETURNING *',
      [book_id, member_id, loan_date, return_date, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete loan
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Loan WHERE Loan_ID = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.json({ message: 'Loan deleted', loan: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
