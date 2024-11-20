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

// Get all books
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Book');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Book WHERE Book_ID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new book
router.post('/', async (req, res) => {
  const { title, author_name, publication_year, genre, available_copies } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Book (Title, Author_Name, Publication_Year, Genre, Available_Copies) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, author_name, publication_year, genre, available_copies]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update book
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author_name, publication_year, genre, available_copies } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Book SET Title = $1, Author_Name = $2, Publication_Year = $3, Genre = $4, Available_Copies = $5 WHERE Book_ID = $6 RETURNING *',
      [title, author_name, publication_year, genre, available_copies, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Book WHERE Book_ID = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted', book: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
