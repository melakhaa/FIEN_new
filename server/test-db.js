// server/test-db.js - Run this to test database connection
const pool = require('./db');

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'transactions')
    `);
    
    console.log('📋 Available tables:', result.rows.map(row => row.table_name));
    
    if (result.rows.length === 2) {
      console.log('✅ All required tables exist');
    } else {
      console.log('❌ Missing tables. Please run the CREATE TABLE commands.');
    }
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();