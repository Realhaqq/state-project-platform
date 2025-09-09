const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  try {
    console.log('Creating LGAs and Wards tables...');
    const sqlContent = fs.readFileSync('./scripts/01-create-lgas-and-wards.sql', 'utf8');

    await sql.unsafe(sqlContent);

    console.log('Tables created successfully');

    // Check if tables exist
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in database:', tables.map(t => t.table_name));

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
