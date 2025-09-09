const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  try {
    console.log('Checking LGAs table structure...');
    const lgas = await sql`SELECT id, name FROM lgas LIMIT 5`;
    console.log('LGAs:', lgas);
    console.log('First LGA ID type check:', typeof lgas[0]?.id, 'Value:', lgas[0]?.id);

    console.log('\nChecking Wards table structure...');
    const wards = await sql`SELECT id, lga_id, name FROM wards LIMIT 5`;
    console.log('Wards:', wards);
    console.log('First Ward lga_id type check:', typeof wards[0]?.lga_id, 'Value:', wards[0]?.lga_id);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
