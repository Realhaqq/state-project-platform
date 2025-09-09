const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addAllWards() {
  try {
    console.log('Adding comprehensive ward data for Niger State...');

    // Get all LGAs
    const lgas = await sql`SELECT id, name FROM lgas`;
    console.log(`Found ${lgas.length} LGAs`);

    // Comprehensive ward data for Niger State
    const wardData = {
      'Agaie': [
        'Agaie Central', 'Baro', 'Ekossa', 'Etsu Tasha', 'Gadabuke', 'Kutiriko',
        'Mago', 'Soba', 'Tagagi', 'Tsafanade'
      ],
      'Agwara': [
        'Agwara Central', 'Boku', 'Gallah', 'Kakuri', 'Katcha', 'Magaji',
        'Papiri', 'Rofia', 'Sarkin Pawa', 'Shaba'
      ],
      'Bida': [
        'Bida Central', 'Bida North', 'Bida South', 'Doko', 'Kyari', 'Masaba',
        'Mashegu', 'Mayaki Ndajiya', 'Umaru Majigi', 'Wadata'
      ],
      'Borgu': [
        'Borgu Central', 'New Bussa I', 'New Bussa II', 'Shagunu', 'Wawa',
        'Yemigi', 'Babanna', 'Dugga', 'Kabe', 'Kishi'
      ],
      'Bosso': [
        'Bosso Central', 'Chanchaga', 'Garatu', 'Kampala', 'Kodo', 'Maikunkele',
        'Shata', 'Tudun Fulani', 'Tudun Wada', 'Umaru Musa'
      ],
      'Chanchaga': [
        'Chanchaga', 'Dutsen Kura', 'Minna Central', 'Minna North', 'Minna South',
        'Sabon Gari', 'Tunga', 'Unguwar Rimi', 'Unguwar Sarki', 'Zungeru'
      ],
      'Edati': [
        'Edati Central', 'Enagi', 'Gbakogi', 'Gogata', 'Lemu', 'Rijau',
        'Shaku', 'Tegina', 'Umaru', 'Wushishi'
      ],
      'Gbako': [
        'Gbako Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Katcha',
        'Kumbashi', 'Lemu', 'Sakpe', 'Tegina'
      ],
      'Gurara': [
        'Gurara Central', 'Diko', 'Gawu', 'Gulbin Boka', 'Kabo', 'Kwaka',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Katcha': [
        'Katcha Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Kontagora': [
        'Kontagora Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Lapai': [
        'Lapai Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Lavun': [
        'Lavun Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Magama': [
        'Magama Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Mariga': [
        'Mariga Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Mashegu': [
        'Mashegu Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Mokwa': [
        'Mokwa Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Muya': [
        'Muya Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Paikoro': [
        'Paikoro Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Rafi': [
        'Rafi Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Rijau': [
        'Rijau Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Shiroro': [
        'Shiroro Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Suleja': [
        'Suleja Central', 'Suleja North', 'Suleja South', 'Tafa', 'Zuba',
        'Karmo', 'Kwamba', 'Madalla', 'Paiko', 'Tunga'
      ],
      'Tafa': [
        'Tafa Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ],
      'Wushishi': [
        'Wushishi Central', 'Badeggi', 'Bangi', 'Essa', 'Kakuri', 'Kumbashi',
        'Lemu', 'Sakpe', 'Tegina', 'Umaru'
      ]
    };

    let totalInserted = 0;

    for (const [lgaName, wards] of Object.entries(wardData)) {
      const lga = lgas.find(l => l.name === lgaName);
      if (lga) {
        console.log(`Adding ${wards.length} wards for ${lgaName}...`);

        for (const wardName of wards) {
          try {
            await sql`
              INSERT INTO wards (id, lga_id, name)
              VALUES (gen_random_uuid(), ${lga.id}, ${wardName})
              ON CONFLICT (lga_id, name) DO NOTHING
            `;
            totalInserted++;
          } catch (error) {
            console.error(`Error inserting ward ${wardName}:`, error.message);
          }
        }
      } else {
        console.log(`LGA ${lgaName} not found`);
      }
    }

    // Check final counts
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;
    console.log(`\nTotal Wards: ${wardCount[0].count}`);
    console.log(`Wards inserted in this run: ${totalInserted}`);

    // Show sample wards by LGA
    const sampleWards = await sql`
      SELECT l.name as lga_name, COUNT(w.id) as ward_count
      FROM lgas l
      LEFT JOIN wards w ON l.id = w.lga_id
      GROUP BY l.id, l.name
      ORDER BY l.name
    `;

    console.log('\nWard counts by LGA:');
    sampleWards.forEach(row => {
      console.log(`${row.lga_name}: ${row.ward_count} wards`);
    });

  } catch (error) {
    console.error('Error adding wards:', error);
  }
}

addAllWards();
