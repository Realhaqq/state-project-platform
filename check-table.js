import { neon } from '@neondatabase/serverless'

const sql = neon("postgresql://neondb_owner:npg_MXq2izgQHb7j@ep-summer-flower-adqzkmte-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require")

async function checkTableStructure() {
  try {
    console.log('Checking table structure...')
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `
    console.log('Users table structure:')
    result.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? 'DEFAULT: ' + row.column_default : ''}`)
    })

    console.log('\nTesting INSERT with explicit id generation...')
    const testResult = await sql`
      INSERT INTO users (id, email, name, password, phone, role, lga_id, ward_id, is_active, email_verified)
      VALUES (gen_random_uuid(), 'test@example.com', 'Test User', 'password', '1234567890', 'citizen', null, null, true, false)
      RETURNING id, name, email
    `
    console.log('Test INSERT result:', testResult)

    // Clean up test data
    await sql`DELETE FROM users WHERE email = 'test@example.com'`
    console.log('Test data cleaned up')

  } catch (error) {
    console.error('Error:', error)
  }
}

checkTableStructure()
