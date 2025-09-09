const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seedNigerStateData() {
  try {
    console.log('Seeding Niger State LGAs and Wards...');

    // Read the SQL file
    const sqlContent = fs.readFileSync('./scripts/008_seed_niger_state_data.sql', 'utf8');

    console.log('Executing SQL file...');

    // Execute the entire file as one statement
    await sql.unsafe(sqlContent);

    console.log('Niger State data seeding completed!');

    // Check final counts
    const lgaCount = await sql`SELECT COUNT(*) as count FROM lgas`;
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;

    console.log(`Total LGAs: ${lgaCount[0].count}`);
    console.log(`Total Wards: ${wardCount[0].count}`);

    // Show some sample data
    const sampleLgas = await sql`SELECT id, name FROM lgas LIMIT 5`;
    console.log('Sample LGAs:', sampleLgas);

    const sampleWards = await sql`SELECT w.name as ward_name, l.name as lga_name FROM wards w JOIN lgas l ON w.lga_id = l.id LIMIT 10`;
    console.log('Sample Wards:', sampleWards);

  } catch (error) {
    console.error('Error seeding Niger State data:', error);
  }
}

seedNigerStateData();
