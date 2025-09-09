const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkLgaData() {
  try {
    const lgas = await sql`SELECT id, name FROM lgas LIMIT 5`;
    console.log('Actual LGA data in database:');
    lgas.forEach((lga, i) => {
      console.log(`${i}: ${lga.name} - ID: ${lga.id} (type: ${typeof lga.id})`);
    });

    // Also check if the IDs are valid UUIDs
    lgas.forEach((lga, i) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(lga.id);
      console.log(`${lga.name} ID is valid UUID: ${isUuid}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkLgaData();
