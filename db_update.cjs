const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function updateDb() {
  try {
    const client = await pool.connect();
    await client.query("ALTER TABLE clients ADD COLUMN plan_expires_at TIMESTAMP;");
    await client.query("ALTER TABLE clients ALTER COLUMN plan_expires_at SET DEFAULT NOW() + interval '30 days';");
    console.log('Schema updated successfully.');
    client.release();
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column already exists');
    } else {
      console.error(err);
    }
  } finally {
    pool.end();
  }
}

updateDb();
