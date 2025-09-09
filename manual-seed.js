const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function manualSeed() {
  try {
    console.log('Manually seeding LGAs...');

    // Insert LGAs
    await sql`INSERT INTO lgas (name, code) VALUES
      ('Agaie', 'AGA'),
      ('Agwara', 'AGW'),
      ('Bida', 'BID'),
      ('Borgu', 'BOR'),
      ('Bosso', 'BOS'),
      ('Chanchaga', 'CHA'),
      ('Edati', 'EDA'),
      ('Gbako', 'GBA'),
      ('Gurara', 'GUR'),
      ('Katcha', 'KAT'),
      ('Kontagora', 'KON'),
      ('Lapai', 'LAP'),
      ('Lavun', 'LAV'),
      ('Magama', 'MAG'),
      ('Mariga', 'MAR'),
      ('Mashegu', 'MAS'),
      ('Mokwa', 'MOK'),
      ('Munya', 'MUN'),
      ('Paikoro', 'PAI'),
      ('Rafi', 'RAF'),
      ('Rijau', 'RIJ'),
      ('Shiroro', 'SHI'),
      ('Suleja', 'SUL'),
      ('Tafa', 'TAF'),
      ('Wushishi', 'WUS')
      ON CONFLICT (name) DO NOTHING`;

    console.log('LGAs inserted successfully');

    // Check LGA count
    const lgaCount = await sql`SELECT COUNT(*) as count FROM lgas`;
    console.log(`Total LGAs: ${lgaCount[0].count}`);

    // Get first LGA ID for ward insertion
    const firstLga = await sql`SELECT id, name FROM lgas LIMIT 1`;
    if (firstLga.length > 0) {
      console.log('Inserting wards for first LGA...');
      await sql`INSERT INTO wards (name, lga_id, code) VALUES
        ('Minna Central', ${firstLga[0].id}, 'MC01'),
        ('Minna North', ${firstLga[0].id}, 'MN01'),
        ('Minna South', ${firstLga[0].id}, 'MS01')
        ON CONFLICT (lga_id, name) DO NOTHING`;

      console.log('Wards inserted successfully');
    }

    // Check ward count
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;
    console.log(`Total Wards: ${wardCount[0].count}`);

  } catch (error) {
    console.error('Error in manual seeding:', error);
  }
}

manualSeed();
