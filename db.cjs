const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    
    // Create clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        twilio_number VARCHAR(50) UNIQUE,
        system_prompt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create leads table with client_id foreign key
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        twilio_call_sid VARCHAR(255),
        caller_number VARCHAR(50),
        name VARCHAR(255),
        contact_number VARCHAR(50),
        city VARCHAR(100),
        state VARCHAR(100),
        status VARCHAR(50),
        highlights TEXT,
        transcript JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create demo_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS demo_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create pricing_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id SERIAL PRIMARY KEY,
        plan_name VARCHAR(100) NOT NULL,
        price VARCHAR(50) NOT NULL,
        description TEXT,
        features JSONB,
        is_popular BOOLEAN DEFAULT false,
        tier_order INTEGER
      )
    `);

    // Seed pricing plans if table is empty
    const { rowCount } = await client.query('SELECT COUNT(*) FROM pricing_plans');
    if (parseInt(rowCount) === 0 || (await client.query('SELECT * FROM pricing_plans')).rows.length === 0) {
      await client.query(`
        INSERT INTO pricing_plans (plan_name, price, description, features, is_popular, tier_order) VALUES
        ('Starter', '$49', 'Perfect for small businesses looking to automate basic calling.', '["500 AI Call Minutes", "Basic CRM Dashboard", "Email Support"]'::jsonb, false, 1),
        ('Professional', '$149', 'For growing sales teams that need high volume and deep insights.', '["2,000 AI Call Minutes", "Multi-language Support", "Priority Support", "Live Call Takeover"]'::jsonb, true, 2),
        ('Enterprise', '$499', 'Custom solutions for large organizations with complex needs.', '["Unlimited Minutes", "Custom LLM Training", "Dedicated Success Manager", "White-label Options"]'::jsonb, false, 3)
      `);
      console.log('[DB] Seeded default pricing plans');
    }
    
    console.log('[DB] Demo requests and Pricing tables ensured');
    client.release();
  } catch (err) {
    console.error('[DB ERROR] Failed to initialize database:', err);
  }
};

const saveLead = async (leadData, clientId = null) => {
  try {
    const query = `
      INSERT INTO leads (twilio_call_sid, caller_number, name, contact_number, city, state, status, highlights, transcript, client_id, product_wanted, color, quantity, wants_sample, lead_temperature)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      leadData.twilio_call_sid,
      leadData.caller_number,
      leadData.name,
      leadData.contact_number,
      leadData.city,
      leadData.state,
      leadData.status,
      leadData.highlights,
      JSON.stringify(leadData.transcript),
      clientId,
      leadData.product_wanted,
      leadData.color,
      leadData.quantity,
      leadData.wants_sample,
      leadData.lead_temperature || 'Unknown'
    ];
    
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    
    console.log(`[DB] Successfully saved lead: ${result.rows[0].name || 'Unknown'}`);
    return result.rows[0];
  } catch (err) {
    console.error('[DB ERROR] Failed to save lead:', err);
    throw err;
  }
};

const getLeads = async (clientId = null) => {
  try {
    const client = await pool.connect();
    let query = 'SELECT * FROM leads';
    let params = [];
    if (clientId) {
      query += ' WHERE client_id = $1';
      params.push(clientId);
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await client.query(query, params);
    client.release();
    return result.rows;
  } catch (err) {
    console.error('[DB ERROR] Failed to fetch leads:', err);
    throw err;
  }
};

const createClient = async (companyName, email, passwordHash, twilioNumber = null) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO clients (company_name, email, password_hash, twilio_number) VALUES ($1, $2, $3, $4) RETURNING id, company_name, email, twilio_number',
      [companyName, email, passwordHash, twilioNumber]
    );
    client.release();
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const getClientByEmail = async (email) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM clients WHERE email = $1', [email]);
    client.release();
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const getClientByTwilioNumber = async (twilioNumber) => {
  try {
    // Strip everything except + and digits to normalize (e.g. (659) 246-8352 -> 6592468352)
    const cleanInput = twilioNumber.replace(/[^\d+]/g, '');
    const justDigits = cleanInput.replace('+', '');
    
    // We match by the last 10 digits to avoid +1 vs 1 issues
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM clients WHERE REPLACE(REPLACE(REPLACE(REPLACE(twilio_number, '(', ''), ')', ''), '-', ''), ' ', '') LIKE $1", 
      [`%${justDigits.slice(-10)}`]
    );
    client.release();
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const getAllClientsStats = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        c.id, 
        c.company_name, 
        c.email, 
        c.twilio_number,
        c.plan_expires_at,
        COUNT(l.id) as total_leads
      FROM clients c
      LEFT JOIN leads l ON c.id = l.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    client.release();
    return result.rows;
  } catch (err) {
    throw err;
  }
};

const updateClientPlanDate = async (clientId, newDate) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE clients SET plan_expires_at = $1 WHERE id = $2 RETURNING *',
      [newDate, clientId]
    );
    client.release();
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const updateLeadRecording = async (callSid, recordingUrl) => {
  try {
    const client = await pool.connect();
    // Update any lead that has this call SID
    const result = await client.query(
      'UPDATE leads SET recording_url = $1 WHERE twilio_call_sid = $2 RETURNING *',
      [recordingUrl, callSid]
    );
    client.release();
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const updateLeadTemperature = async (leadId, temperature) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE leads SET lead_temperature = $1 WHERE id = $2 RETURNING *',
      [temperature, leadId]
    );
    client.release();
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const saveDemoRequest = async (data) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO demo_requests (name, email, phone, company) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.email, data.phone, data.company]
    );
    client.release();
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const getDemoRequests = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM demo_requests ORDER BY created_at DESC');
    client.release();
    return result.rows;
  } catch (err) {
    console.error('[DB ERROR] Failed to fetch demo requests:', err);
    throw err;
  }
};

const getPricingPlans = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM pricing_plans ORDER BY tier_order ASC');
    client.release();
    return result.rows;
  } catch (err) {
    console.error('[DB ERROR] Failed to fetch pricing plans:', err);
    throw err;
  }
};

const updatePricingPlan = async (id, planData) => {
  try {
    const query = `
      UPDATE pricing_plans 
      SET plan_name = $1, price = $2, description = $3, features = $4, is_popular = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [
      planData.plan_name,
      planData.price,
      planData.description,
      JSON.stringify(planData.features),
      planData.is_popular,
      id
    ];
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    return result.rows[0];
  } catch (err) {
    console.error('[DB ERROR] Failed to update pricing plan:', err);
    throw err;
  }
};

module.exports = {
  initDB,
  saveLead,
  getLeads,
  createClient,
  getClientByEmail,
  getClientByTwilioNumber,
  getAllClientsStats,
  updateClientPlanDate,
  updateLeadRecording,
  updateLeadTemperature,
  saveDemoRequest,
  getDemoRequests,
  getPricingPlans,
  updatePricingPlan
};
