const express = require('express');
const { Pool } = require('pg'); // Import pg's Pool for database connection
const cors = require('cors');  // Allow frontend-backend communication

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());


// Database connection
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// API route to fetch data
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows); // Send rows as JSON to the frontend
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
