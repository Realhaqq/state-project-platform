const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testInsert() {
  try {
    console.log('Testing LGA insertion...');

    // Try inserting with explicit UUID
    const result = await sql`
      INSERT INTO lgas (id, name)
      VALUES (gen_random_uuid(), 'Test LGA')
      RETURNING id, name
    `;

    console.log('Insert result:', result);

    // Check if it was inserted
    const check = await sql`SELECT * FROM lgas`;
    console.log('All LGAs:', check);

  } catch (error) {
    console.error('Error inserting LGA:', error);
  }
}

testInsert();
