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

// Get all book copies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Book_Copy');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get book copy by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Book_Copy WHERE Copy_ID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book copy not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new book copy
router.post('/', async (req, res) => {
  const { book_id, location, condition, availability_status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Book_Copy (Book_ID, Location, Condition, Availability_Status) VALUES ($1, $2, $3, $4) RETURNING *',
      [book_id, location, condition, availability_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update book copy
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { book_id, location, condition, availability_status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Book_Copy SET Book_ID = $1, Location = $2, Condition = $3, Availability_Status = $4 WHERE Copy_ID = $5 RETURNING *',
      [book_id, location, condition, availability_status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book copy not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete book copy
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Book_Copy WHERE Copy_ID = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book copy not found' });
    }
    res.json({ message: 'Book copy deleted', book_copy: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
