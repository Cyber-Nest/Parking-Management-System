// src/utils/seedAdmin.ts
// Run ONCE to create the first owner admin account
// Usage: npm run seed

import bcrypt from 'bcryptjs';
import { execute, queryRows } from '../config/database';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

interface RoleRow { id: string }

const seedAdmin = async (): Promise<void> => {
    // ── Change these before running ────────────────────────────
    const adminEmail = 'admin@parksmart.com';
    const adminPassword = 'Admin@123456';       // ← Change this!
    const adminName = 'John Doe';
    // ───────────────────────────────────────────────────────────

    try {
        console.log('[Seed] Fetching owner role...');
        const roleResult = await queryRows<RoleRow>(
            `SELECT id FROM roles WHERE name = 'owner' LIMIT 1`
        );

        if (roleResult.length === 0) {
            throw new Error('Owner role not found. Run 001_create_tables.sql first.');
        }

        const roleId = roleResult[0].id;

        console.log('[Seed] Hashing password...');
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        console.log('[Seed] Inserting admin...');
        const adminId = crypto.randomUUID();
        const result = await execute(
            `INSERT IGNORE INTO admins (id, email, password_hash, full_name, role_id)
       VALUES (?, ?, ?, ?, ?)`,
            [adminId, adminEmail.toLowerCase(), passwordHash, adminName, roleId]
        );

        if (result.affectedRows === 0) {
            console.log('[Seed] ⚠️  Admin with this email already exists. Skipping.');
        } else {
            console.log('\n[Seed] ✅ Admin created:');
            console.log('   Email   :', adminEmail.toLowerCase());
            console.log('   Name    :', adminName);
            console.log('   Password:', adminPassword, ' ← Change after first login!\n');
        }

        process.exit(0);
    } catch (err) {
        console.error('[Seed] ❌ Error:', err instanceof Error ? err.message : err);
        process.exit(1);
    }
};

void seedAdmin();