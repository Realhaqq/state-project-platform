const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkTableStructure() {
  try {
    console.log('Checking lgas table structure...');
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lgas' AND table_schema = 'public'`;
    console.log('LGAs table columns:', columns);

    console.log('\nChecking wards table structure...');
    const wardColumns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'wards' AND table_schema = 'public'`;
    console.log('Wards table columns:', wardColumns);

  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

checkTableStructure();
