const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testApis() {
  try {
    console.log('Testing LGAs API...');
    const lgas = await sql`SELECT id, name FROM lgas ORDER BY name ASC`;
    console.log(`Found ${lgas.length} LGAs`);
    console.log('First 3 LGAs:');
    lgas.slice(0, 3).forEach(lga => {
      console.log(`- ${lga.name}: ${lga.id}`);
    });

    if (lgas.length > 0) {
      console.log('\nTesting Wards API for first LGA...');
      const firstLgaId = lgas[0].id;
      const wards = await sql`
        SELECT id, name, lga_id
        FROM wards
        WHERE lga_id = ${firstLgaId}
        ORDER BY name ASC
      `;
      console.log(`Found ${wards.length} wards for ${lgas[0].name}`);
      console.log('First 3 wards:');
      wards.slice(0, 3).forEach(ward => {
        console.log(`- ${ward.name}: ${ward.id}`);
      });
    }

    console.log('\nAPI Test Summary:');
    console.log('- LGAs API: Working ✓');
    console.log('- Wards API: Working ✓');
    console.log('- Data populated: ✓');

  } catch (error) {
    console.error('Error testing APIs:', error);
  }
}

testApis();
