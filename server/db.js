const { Pool } = require('pg');
require('dotenv').config();

// This configuration correctly uses the DATABASE_URL provided by Render.
// It also enables SSL, which is required for production database connections.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool,
};