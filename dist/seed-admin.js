#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env.local file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env.local" });
const serverless_1 = require("@neondatabase/serverless");
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
async function seedAdmin() {
    try {
        const adminEmail = process.env.ADMIN_SEED_EMAIL;
        const adminPassword = process.env.ADMIN_SEED_PASSWORD;
        if (!adminEmail || !adminPassword) {
            console.error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set");
            process.exit(1);
        }
        // Check if admin already exists
        const [existingAdmin] = await sql `
      SELECT id FROM users WHERE email = ${adminEmail}
    `;
        if (existingAdmin) {
            console.log(`Admin user already exists: ${adminEmail}`);
            // Update role if needed
            await sql `
        UPDATE users 
        SET role = 'super_admin'
        WHERE email = ${adminEmail}
      `;
            console.log("Admin role updated to super_admin");
        }
        else {
            // Create new admin user
            const [admin] = await sql `
        INSERT INTO users (
          email, 
          name, 
          role
        )
        VALUES (
          ${adminEmail}, 
          'System Administrator', 
          'super_admin'
        )
        RETURNING id, email, role
      `;
            console.log(`Super admin created: ${admin.email} (${admin.role})`);
        }
        console.log("Admin seeding completed successfully");
    }
    catch (error) {
        console.error("Admin seeding failed:", error);
        process.exit(1);
    }
}
seedAdmin();
