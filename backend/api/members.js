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

// Get all members
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Member');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Member WHERE Member_ID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new member
router.post('/', async (req, res) => {
  const { first_name, last_name, email, phone_number, membership_start_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Member (first_name, last_name, email, phone_number, membership_start_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [first_name, last_name, email, phone_number, membership_start_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update member
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone_number, membership_start_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Member SET first_name = $1, last_name = $2, email = $3, phone_number = $4, membership_start_date = $5 WHERE member_id = $6 RETURNING *',
      [first_name, last_name, email, phone_number, membership_start_date, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Member WHERE member_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted', member: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
