"use strict";
// src/utils/seedAdmin.ts
// Run ONCE to create the first owner admin account
// Usage: npm run seed
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const seedAdmin = async () => {
    // ── Change these before running ────────────────────────────
    const adminEmail = 'admin@parksmart.com';
    const adminPassword = 'Admin@123456'; // ← Change this!
    const adminName = 'John Doe';
    // ───────────────────────────────────────────────────────────
    try {
        console.log('[Seed] Fetching owner role...');
        const roleResult = await (0, database_1.queryRows)(`SELECT id FROM roles WHERE name = 'owner' LIMIT 1`);
        if (roleResult.length === 0) {
            throw new Error('Owner role not found. Run 001_create_tables.sql first.');
        }
        const roleId = roleResult[0].id;
        console.log('[Seed] Hashing password...');
        const passwordHash = await bcryptjs_1.default.hash(adminPassword, 12);
        console.log('[Seed] Inserting admin...');
        const adminId = crypto_1.default.randomUUID();
        const result = await (0, database_1.execute)(`INSERT IGNORE INTO admins (id, email, password_hash, full_name, role_id)
       VALUES (?, ?, ?, ?, ?)`, [adminId, adminEmail.toLowerCase(), passwordHash, adminName, roleId]);
        if (result.affectedRows === 0) {
            console.log('[Seed] ⚠️  Admin with this email already exists. Skipping.');
        }
        else {
            console.log('\n[Seed] ✅ Admin created:');
            console.log('   Email   :', adminEmail.toLowerCase());
            console.log('   Name    :', adminName);
            console.log('   Password:', adminPassword, ' ← Change after first login!\n');
        }
        process.exit(0);
    }
    catch (err) {
        console.error('[Seed] ❌ Error:', err instanceof Error ? err.message : err);
        process.exit(1);
    }
};
void seedAdmin();
//# sourceMappingURL=seedAdmin.js.map