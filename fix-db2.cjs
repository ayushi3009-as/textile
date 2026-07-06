require('dotenv').config();
const { pool } = require('./db.cjs');
(async () => {
  try {
    const client = await pool.connect();
    await client.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'");
    await client.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES pricing_plans(id)");
    await client.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_receipt TEXT");
    console.log('Columns added successfully');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
