const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runSQLFile(filePath) {
  try {
    console.log(`Running ${filePath}...`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    // Execute the entire file as one statement
    await sql.unsafe(sqlContent);

    console.log(`${filePath} completed successfully`);
  } catch (error) {
    console.error(`Error running ${filePath}:`, error.message);
    // Continue with other files even if one fails
  }
}

async function seedDatabase() {
  try {
    // Run SQL scripts in order
    await runSQLFile('./scripts/01-create-lgas-and-wards.sql');
    await runSQLFile('./scripts/02-create-users-and-auth.sql');
    await runSQLFile('./scripts/03-create-projects-and-content.sql');
    await runSQLFile('./scripts/04-create-comments-and-reports.sql');
    await runSQLFile('./scripts/05-create-audit-and-indexes.sql');
    await runSQLFile('./scripts/06-add-missing-features.sql');
    await runSQLFile('./scripts/07-seed-niger-state-data.sql');
    await runSQLFile('./scripts/08-enable-rls-policies.sql');
    await runSQLFile('./scripts/09-add-password-field.sql');
    await runSQLFile('./scripts/10-add-missing-project-fields.sql');
    await runSQLFile('./scripts/11-sync-schema-database.sql');

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
