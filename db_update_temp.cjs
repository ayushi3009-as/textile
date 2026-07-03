const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function updateDb() {
  try {
    const client = await pool.connect();
    await client.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_temperature VARCHAR(50) DEFAULT 'Unknown';");
    console.log('Schema updated successfully.');
    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

updateDb();
