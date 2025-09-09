const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addMoreWards() {
  try {
    console.log('Adding more wards for Niger State LGAs...');

    // Get all LGAs
    const lgas = await sql`SELECT id, name FROM lgas`;
    console.log(`Found ${lgas.length} LGAs`);

    // Add wards for each LGA using the pattern from the SQL file
    const wardData = {
      'Agaie': ['Agaie Central', 'Baro', 'Ekossa', 'Etsu Agaie', 'Magaji', 'Sabon Gida', 'Soba', 'Tsuntsu', 'Wobe', 'Zango'],
      'Agwara': ['Agwara Central', 'Boku', 'Gallah', 'Gonagi', 'Kakihum', 'Kutigi I', 'Kutigi II', 'Maburya', 'Rofia', 'Tukumbi'],
      'Borgu': ['Babanna', 'Borgu Central', 'Ilesha Gogo', 'New Bussa I', 'New Bussa II', 'Sanbai', 'Shagunu', 'Wawa I', 'Wawa II', 'Yemigi'],
      'Bosso': ['Bosso Central', 'Chanchaga', 'Garatu', 'Kampala', 'Kodo', 'Maikunkele', 'Maitumbi', 'Shata', 'Tudun Fulani', 'Wushishi'],
      'Edati': ['Edati Central', 'Enagi', 'Gbakogi', 'Gogata', 'Lemu', 'Pali', 'Sarkin Pawa', 'Ujiji', 'Unguwar Rimi', 'Zazzaga'],
      'Gbako': ['Bida', 'Gbako Central', 'Katcha', 'Kusotachi', 'Lemu', 'Mallam Madori', 'Sidi Saad', 'Tungan Ibrahim', 'Tungan Maliki', 'Yamadaddi'],
      'Gurara': ['Gurara Central', 'Gawu Babangida', 'Gawu Sabo', 'Kabo', 'Kwakuti', 'Pina', 'Saura', 'Tunga', 'Uke', 'Yelwa'],
      'Katcha': ['Batati', 'Gumi', 'Katcha Central', 'Kurmin Sarki', 'Kwakuti', 'Sarcena', 'Tegina', 'Tudun Wada', 'Yamma', 'Zangon'],
      'Kontagora': ['Bangajiya', 'Kontagora Central', 'Madara', 'Masuga', 'Rafin Gabas', 'Tungan Kawo', 'Tungan Maliki', 'Usalle', 'Yamma', 'Zangon'],
      'Lapai': ['Arewa', 'Central', 'Gulu', 'Kudu', 'Lapai Central', 'Muye', 'Shaba', 'Takuti', 'Tasha', 'Yarmalamai'],
      'Lavun': ['Batati', 'Doko', 'Dukku', 'Gaba', 'Gaba North', 'Gaba South', 'Jima', 'Kusotachi', 'Lavun Central', 'Tungan Kawo'],
      'Magama': ['Auna Central', 'Bangi', 'Bosso', 'Ibeto', 'Ibbi', 'Magama Central', 'Nassarawa', 'Ndayako', 'Shaku', 'Tudun Wada'],
      'Mariga': ['Bangajiya', 'Bosso', 'Dandaudu', 'Ibeto', 'Inkwai', 'Kataregi', 'Mariga Central', 'Sarkin Pawa', 'Tudun Wada', 'Uku'],
      'Mashegu': ['Dapangi', 'Ibeto', 'Kabo', 'Kakangi', 'Kudu', 'Mashegu Central', 'Sarkin Pawa', 'Tudun Wada', 'Wushishi', 'Yalwa'],
      'Mokwa': ['Bosso', 'Gbafun', 'Jebba', 'Kudu', 'Labozhi', 'Mokwa Central', 'Muregi', 'Rabba', 'Sarkin Pawa', 'Tudun Wada'],
      'Munya': ['Dandaudu', 'Dukku', 'Ibeto', 'Kakangi', 'Munya Central', 'Sabo', 'Sarkin Pawa', 'Tudun Wada', 'Uku', 'Zungeru'],
      'Paikoro': ['Adunu', 'Gawu', 'Gulu', 'Kudu', 'Paikoro Central', 'Rafin Gabas', 'Sarkin Pawa', 'Tudun Wada', 'Umaru Majigi', 'Yarmalamai'],
      'Rafi': ['Gulbin Boka', 'Gulbin Kuka', 'Kagara', 'Kusheriki', 'Rafi Central', 'Sabo', 'Sarkin Pawa', 'Tudun Wada', 'Wuse', 'Zangon'],
      'Rijau': ['Dugga', 'Gawu', 'Kusa', 'Rijau Central', 'Sarkin Pawa', 'Shambo', 'Tudun Wada', 'Umaru Majigi', 'Wushishi', 'Zungeru'],
      'Shiroro': ['Allawa', 'Bangi', 'Gulbin Boka', 'Kuta', 'Manta', 'Pina', 'Sabo', 'Shiroro Central', 'Tudun Wada', 'Uku'],
      'Tafa': ['Dogon Kurmi', 'Garam', 'Iku', 'New Bussa', 'Sabo', 'Sarkin Pawa', 'Tafa Central', 'Tudun Wada', 'Wuse', 'Zungeru'],
      'Wushishi': ['Chanchaga', 'Kusheriki', 'Sabon Gari', 'Sarkin Pawa', 'Tudun Wada', 'Umaru Majigi', 'Wushishi Central', 'Yalwa', 'Zungeru', 'Zunzu']
    };

    for (const [lgaName, wards] of Object.entries(wardData)) {
      const lga = lgas.find(l => l.name === lgaName);
      if (lga) {
        console.log(`Adding ${wards.length} wards for ${lgaName}...`);

        // Insert wards in batches to avoid SQL limits
        for (let i = 0; i < wards.length; i += 5) {
          const batch = wards.slice(i, i + 5);
          const values = batch.map(ward => `('${ward}')`).join(', ');

          await sql.unsafe(`
            INSERT INTO wards (id, lga_id, name)
            SELECT gen_random_uuid(), '${lga.id}', ward_name
            FROM (VALUES ${values}) AS w(ward_name)
            WHERE NOT EXISTS (
              SELECT 1 FROM wards
              WHERE lga_id = '${lga.id}' AND name = w.ward_name
            )
          `);
        }
      }
    }

    // Check final counts
    const lgaCount = await sql`SELECT COUNT(*) as count FROM lgas`;
    const wardCount = await sql`SELECT COUNT(*) as count FROM wards`;

    console.log(`\nFinal counts:`);
    console.log(`Total LGAs: ${lgaCount[0].count}`);
    console.log(`Total Wards: ${wardCount[0].count}`);

    // Show some sample data
    const sampleWards = await sql`SELECT w.name as ward_name, l.name as lga_name FROM wards w JOIN lgas l ON w.lga_id = l.id ORDER BY l.name, w.name LIMIT 20`;
    console.log('\nSample Wards:');
    sampleWards.forEach(ward => {
      console.log(`${ward.lga_name}: ${ward.ward_name}`);
    });

  } catch (error) {
    console.error('Error adding wards:', error);
  }
}

addMoreWards();
