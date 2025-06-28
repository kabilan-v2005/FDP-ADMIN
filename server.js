const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Sample',
  password: '1234',
  port: 5432,
});

// API to fetch FDP/IV data
app.get('/api/fdp', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "FDP_IV_Records" ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
