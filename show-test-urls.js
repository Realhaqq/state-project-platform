const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function showTestUrls() {
  try {
    const lgas = await sql`SELECT id, name FROM lgas ORDER BY name ASC LIMIT 5`;

    console.log('Test these URLs in your browser or with curl:');
    console.log('');

    lgas.forEach((lga, index) => {
      console.log(`${index + 1}. ${lga.name}:`);
      console.log(`   GET /api/wards?lga_id=${lga.id}`);
      console.log('');
    });

    console.log('Example curl commands:');
    console.log(`curl "http://localhost:3000/api/wards?lga_id=${lgas[0].id}"`);

  } catch (error) {
    console.error('Error:', error);
  }
}

showTestUrls();
