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

// Get all librarians
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Librarian');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get librarian by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Librarian WHERE Librarian_ID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Librarian not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new librarian
router.post('/', async (req, res) => {
  const { first_name, last_name, email, hire_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Librarian (First_Name, Last_Name, Email, Hire_Date) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, email, hire_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update librarian
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, hire_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Librarian SET First_Name = $1, Last_Name = $2, Email = $3, Hire_Date = $4 WHERE Librarian_ID = $5 RETURNING *',
      [first_name, last_name, email, hire_date, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Librarian not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete librarian
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Librarian WHERE Librarian_ID = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Librarian not found' });
    }
    res.json({ message: 'Librarian deleted', librarian: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
