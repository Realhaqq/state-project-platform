const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seedTestData() {
  try {
    console.log('Seeding test LGAs and Wards...');

    // Insert test LGAs
    const lgas = await sql`
      INSERT INTO lgas (name) VALUES
        ('Chanchaga'),
        ('Bosso'),
        ('Minna')
      RETURNING id, name
    `;

    console.log('Inserted LGAs:', lgas);

    // Insert wards for each LGA
    for (const lga of lgas) {
      await sql`
        INSERT INTO wards (name, lga_id) VALUES
          (${lga.name + ' Ward 1'}, ${lga.id}),
          (${lga.name + ' Ward 2'}, ${lga.id}),
          (${lga.name + ' Ward 3'}, ${lga.id})
      `;
      console.log(`Inserted wards for ${lga.name}`);
    }

    // Check final counts
    const lgaCount = await sql`SELECT COUNT(*) as count FROM lgas`;
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;

    console.log(`Total LGAs: ${lgaCount[0].count}`);
    console.log(`Total Wards: ${wardCount[0].count}`);

  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

seedTestData();
