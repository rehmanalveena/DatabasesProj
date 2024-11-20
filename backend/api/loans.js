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
    // Check if the book has available copies
    const book = await pool.query('SELECT Available_Copies FROM Book WHERE Book_ID = $1', [book_id]);
    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    if (book.rows[0].available_copies <= 0) {
      return res.status(400).json({ error: 'No copies available for this book.' });
    }

    // Create the loan with Loan_Date and Return_Date
    const loan = await pool.query(
      'INSERT INTO Loan (Book_ID, Member_ID, Loan_Date, Return_Date) VALUES ($1, $2, $3, $4) RETURNING *',
      [book_id, member_id, loan_date || null, return_date || null]
    );

    // Decrement available copies
    await pool.query(
      'UPDATE Book SET Available_Copies = Available_Copies - 1 WHERE Book_ID = $1',
      [book_id]
    );

    res.status(201).json(loan.rows[0]);
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
router.delete('/:loan_id', async (req, res) => {
  const { loan_id } = req.params;

  try {
    // Find the book associated with the loan
    const loan = await pool.query('SELECT Book_ID FROM Loan WHERE Loan_ID = $1', [loan_id]);
    if (loan.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const book_id = loan.rows[0].book_id;

    // Delete the loan
    await pool.query('DELETE FROM Loan WHERE Loan_ID = $1', [loan_id]);

    // Increment available copies
    await pool.query(
      'UPDATE Book SET Available_Copies = Available_Copies + 1 WHERE Book_ID = $1',
      [book_id]
    );

    res.status(200).json({ message: 'Loan deleted and book returned.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
