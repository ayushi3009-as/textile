require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Adding new columns to leads table...');
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS product_wanted VARCHAR(255)`);
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS color VARCHAR(255)`);
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS quantity VARCHAR(100)`);
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS wants_sample BOOLEAN`);
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_temperature VARCHAR(50)`);
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS recording_url TEXT`);
    
    console.log('Adding new columns to clients table...');
    await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP`);
    await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS system_prompt TEXT`);

    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
