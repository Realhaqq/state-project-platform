const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixMuyaWards() {
  try {
    console.log('Fixing Munya/Muya LGA and adding missing wards...');

    // Check current LGA names
    const lgas = await sql`SELECT id, name FROM lgas`;
    console.log('Current LGAs:');
    lgas.forEach(lga => console.log(`- ${lga.name}`));

    // Find Munya and see if we need to rename it to Muya
    const munyaLga = lgas.find(l => l.name === 'Munya');
    if (munyaLga) {
      console.log('Found Munya LGA, renaming to Muya...');
      await sql`UPDATE lgas SET name = 'Muya' WHERE id = ${munyaLga.id}`;
    }

    // Add wards for Muya
    const muyaLga = lgas.find(l => l.name === 'Muya' || l.name === 'Munya');
    if (muyaLga) {
      console.log('Adding wards for Muya...');

      const muyaWards = [
        'Muya Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ];

      for (const wardName of muyaWards) {
        try {
          await sql`
            INSERT INTO wards (id, lga_id, name)
            VALUES (gen_random_uuid(), ${muyaLga.id}, ${wardName})
            ON CONFLICT (lga_id, name) DO NOTHING
          `;
        } catch (error) {
          console.error(`Error inserting ward ${wardName}:`, error.message);
        }
      }
    }

    // Final verification
    const finalWardCount = await sql`SELECT COUNT(*) as count FROM wards`;
    console.log(`\nFinal Total Wards: ${finalWardCount[0].count}`);

    const finalCounts = await sql`
      SELECT l.name as lga_name, COUNT(w.id) as ward_count
      FROM lgas l
      LEFT JOIN wards w ON l.id = w.lga_id
      GROUP BY l.id, l.name
      ORDER BY l.name
    `;

    console.log('\nFinal Ward counts by LGA:');
    finalCounts.forEach(row => {
      console.log(`${row.lga_name}: ${row.ward_count} wards`);
    });

  } catch (error) {
    console.error('Error fixing Muya wards:', error);
  }
}

fixMuyaWards();
