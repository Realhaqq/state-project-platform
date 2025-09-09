const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testLgasApi() {
  try {
    const lgas = await sql`SELECT id, name FROM lgas ORDER BY name ASC LIMIT 3`;
    console.log('LGAs API response format:');
    console.log(JSON.stringify({ success: true, lgas: lgas }, null, 2));

    console.log('\nFirst LGA details:');
    console.log(`ID: ${lgas[0].id}`);
    console.log(`Type of ID: ${typeof lgas[0].id}`);
    console.log(`ID length: ${lgas[0].id.length}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

testLgasApi();
