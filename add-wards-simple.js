const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addWardsSimple() {
  try {
    console.log('Adding wards using simple INSERTs...');

    // Get all LGAs
    const lgas = await sql`SELECT id, name FROM lgas`;
    console.log(`Found ${lgas.length} LGAs`);

    // Simple ward data for a few LGAs first
    const wardData = {
      'Agaie': ['Agaie Central', 'Baro', 'Ekossa'],
      'Agwara': ['Agwara Central', 'Boku', 'Gallah'],
      'Borgu': ['Borgu Central', 'New Bussa I', 'New Bussa II']
    };

    for (const [lgaName, wards] of Object.entries(wardData)) {
      const lga = lgas.find(l => l.name === lgaName);
      if (lga) {
        console.log(`Adding wards for ${lgaName}...`);

        for (const wardName of wards) {
          try {
            await sql`
              INSERT INTO wards (id, lga_id, name)
              VALUES (gen_random_uuid(), ${lga.id}, ${wardName})
              ON CONFLICT (lga_id, name) DO NOTHING
            `;
          } catch (error) {
            console.error(`Error inserting ward ${wardName}:`, error.message);
          }
        }
      }
    }

    // Check final counts
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;
    console.log(`Total Wards: ${wardCount[0].count}`);

    // Show all wards
    const allWards = await sql`SELECT w.name as ward_name, l.name as lga_name FROM wards w JOIN lgas l ON w.lga_id = l.id ORDER BY l.name, w.name`;
    console.log('\nAll Wards:');
    allWards.forEach(ward => {
      console.log(`${ward.lga_name}: ${ward.ward_name}`);
    });

  } catch (error) {
    console.error('Error adding wards:', error);
  }
}

addWardsSimple();
