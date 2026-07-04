require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("UPDATE clients SET twilio_number = '+16592468352' WHERE email = 'admin@company.com' RETURNING *");
    console.log('Updated client:', res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
