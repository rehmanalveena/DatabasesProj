const express = require('express');
const { Pool } = require('pg'); // Import pg's Pool for database connection
const cors = require('cors');  // Allow frontend-backend communication
require('dotenv').config(); // Load environment variables from .env

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Test the database connection
pool.connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database');
  })
  .catch(err => {
    console.error('Database connection error:', err.stack);
  });

// Import routes
const memberRoutes = require('./api/members');
const bookRoutes = require('./api/books');
const loanRoutes = require('./api/loans');
const librarianRoutes = require('./api/librarians');
const bookCopyRoutes = require('./api/book_copies');

// Use routes
app.use('/api/members', memberRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/librarians', librarianRoutes);
app.use('/api/book_copies', bookCopyRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
