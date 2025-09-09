const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seedBasicData() {
  try {
    console.log('Seeding basic Niger State data...');

    // Insert LGAs first
    console.log('Inserting LGAs...');
    const lgas = await sql`
      INSERT INTO lgas (id, name) VALUES
      (gen_random_uuid(), 'Agaie'),
      (gen_random_uuid(), 'Agwara'),
      (gen_random_uuid(), 'Bida'),
      (gen_random_uuid(), 'Borgu'),
      (gen_random_uuid(), 'Bosso'),
      (gen_random_uuid(), 'Chanchaga'),
      (gen_random_uuid(), 'Edati'),
      (gen_random_uuid(), 'Gbako'),
      (gen_random_uuid(), 'Gurara'),
      (gen_random_uuid(), 'Katcha'),
      (gen_random_uuid(), 'Kontagora'),
      (gen_random_uuid(), 'Lapai'),
      (gen_random_uuid(), 'Lavun'),
      (gen_random_uuid(), 'Magama'),
      (gen_random_uuid(), 'Mariga'),
      (gen_random_uuid(), 'Mashegu'),
      (gen_random_uuid(), 'Mokwa'),
      (gen_random_uuid(), 'Munya'),
      (gen_random_uuid(), 'Paikoro'),
      (gen_random_uuid(), 'Rafi'),
      (gen_random_uuid(), 'Rijau'),
      (gen_random_uuid(), 'Shiroro'),
      (gen_random_uuid(), 'Suleja'),
      (gen_random_uuid(), 'Tafa'),
      (gen_random_uuid(), 'Wushishi')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name
    `;

    console.log(`Inserted ${lgas.length} LGAs`);

    // Insert some basic wards for a few LGAs
    console.log('Inserting wards...');
    const chanchagaLga = lgas.find(l => l.name === 'Chanchaga');
    const bidaLga = lgas.find(l => l.name === 'Bida');
    const sulejaLga = lgas.find(l => l.name === 'Suleja');

    if (chanchagaLga) {
      await sql`
        INSERT INTO wards (id, lga_id, name) VALUES
        (gen_random_uuid(), ${chanchagaLga.id}, 'Minna Central'),
        (gen_random_uuid(), ${chanchagaLga.id}, 'Minna North'),
        (gen_random_uuid(), ${chanchagaLga.id}, 'Minna South'),
        (gen_random_uuid(), ${chanchagaLga.id}, 'Chanchaga'),
        (gen_random_uuid(), ${chanchagaLga.id}, 'Dutsen Kura')
        ON CONFLICT (lga_id, name) DO NOTHING
      `;
      console.log('Inserted wards for Chanchaga');
    }

    if (bidaLga) {
      await sql`
        INSERT INTO wards (id, lga_id, name) VALUES
        (gen_random_uuid(), ${bidaLga.id}, 'Bida Central'),
        (gen_random_uuid(), ${bidaLga.id}, 'Bida North'),
        (gen_random_uuid(), ${bidaLga.id}, 'Bida South')
        ON CONFLICT (lga_id, name) DO NOTHING
      `;
      console.log('Inserted wards for Bida');
    }

    if (sulejaLga) {
      await sql`
        INSERT INTO wards (id, lga_id, name) VALUES
        (gen_random_uuid(), ${sulejaLga.id}, 'Suleja Central'),
        (gen_random_uuid(), ${sulejaLga.id}, 'Suleja North'),
        (gen_random_uuid(), ${sulejaLga.id}, 'Suleja South')
        ON CONFLICT (lga_id, name) DO NOTHING
      `;
      console.log('Inserted wards for Suleja');
    }

    // Check final counts
    const lgaCount = await sql`SELECT COUNT(*) as count FROM lgas`;
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;

    console.log(`Total LGAs: ${lgaCount[0].count}`);
    console.log(`Total Wards: ${wardCount[0].count}`);

    // Show sample data
    const sampleLgas = await sql`SELECT id, name FROM lgas LIMIT 5`;
    console.log('Sample LGAs:', sampleLgas);

    const sampleWards = await sql`SELECT w.name as ward_name, l.name as lga_name FROM wards w JOIN lgas l ON w.lga_id = l.id LIMIT 5`;
    console.log('Sample Wards:', sampleWards);

  } catch (error) {
    console.error('Error seeding basic data:', error);
  }
}

seedBasicData();
