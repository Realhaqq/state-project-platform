#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

console.log('🔍 Watching for Prisma schema changes...');
console.log('📁 Schema file:', schemaPath);
console.log('💡 Save your schema.prisma file to trigger database sync');
console.log('❌ Press Ctrl+C to stop watching\n');

let lastModified = fs.statSync(schemaPath).mtime;

fs.watchFile(schemaPath, { interval: 1000 }, (curr, prev) => {
  if (curr.mtime > lastModified) {
    lastModified = curr.mtime;
    console.log('\n🔄 Schema file changed! Syncing database...');

    exec('pnpm run db:sync', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database sync failed:', error.message);
        return;
      }

      if (stderr) {
        console.log('⚠️  Warnings:', stderr);
      }

      console.log('✅ Database synced successfully!');
      console.log('💡 Ready for next schema change...\n');
    });
  }
});

console.log('🚀 Auto-sync is active! Make changes to your schema and save the file.');
