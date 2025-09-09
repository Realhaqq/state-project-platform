const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkLgasColumns() {
  try {
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'lgas'
      ORDER BY column_name
    `;

    console.log('Columns in lgas table:');
    result.forEach(col => {
      console.log('- ' + col.column_name);
    });

    // Also check what data is actually in the table
    const sampleData = await sql`SELECT * FROM lgas LIMIT 2`;
    console.log('\nSample data from lgas table:');
    console.log(JSON.stringify(sampleData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkLgasColumns();
