require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkReports() {
  try {
    const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'reports' ORDER BY ordinal_position`;
    console.log('Reports table columns:');
    result.forEach(col => console.log('- ' + col.column_name));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkReports();
