const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkLgaIds() {
  try {
    const lgas = await sql`SELECT id, name FROM lgas LIMIT 5`;
    console.log('Sample LGA IDs:');
    lgas.forEach(lga => {
      console.log(`${lga.name}: ${lga.id}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLgaIds();
