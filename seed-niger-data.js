const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seedNigerStateData() {
  try {
    console.log('Running Niger State data seeding...');
    const sqlContent = fs.readFileSync('./scripts/07-seed-niger-state-data.sql', 'utf8');

    await sql.unsafe(sqlContent);

    console.log('Niger State data seeding completed successfully');

    // Check if data was inserted
    const lgaCount = await sql`SELECT COUNT(*) as count FROM lgas`;
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;

    console.log(`LGAs inserted: ${lgaCount[0].count}`);
    console.log(`Wards inserted: ${wardCount[0].count}`);

  } catch (error) {
    console.error('Error seeding Niger State data:', error);
  }
}

seedNigerStateData();
