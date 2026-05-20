"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficerService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const officer_repository_1 = require("../repositories/officer.repository");
const admin_repository_1 = require("../repositories/admin.repository");
const commonErrors_1 = require("./commonErrors");
const env_1 = require("../config/env");
const officerRepo = new officer_repository_1.OfficerRepository();
const adminRepo = new admin_repository_1.AdminRepository();
class OfficerService {
    async getById(id) {
        const o = await officerRepo.findById(id);
        if (!o)
            throw new commonErrors_1.NotFoundError('Officer not found');
        return {
            id: o.id,
            officer_id: o.badge_number ?? o.id,
            full_name: o.full_name,
            email: o.email,
            phone: o.phone,
            role: o.role,
            status: o.status === 'active' ? 'ACTIVE' : 'DISABLED',
            tickets_issued: o.tickets_issued ?? 0,
            last_login_at: o.last_login_at,
            created_at: o.created_at,
        };
    }
    async summary() {
        return officerRepo.summary();
    }
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { items, total } = await officerRepo.list({
            page,
            limit,
            q: query.q?.trim() || undefined,
            status: query.status || undefined,
            role: query.role || undefined,
        });
        const mapped = items.map((o) => ({
            id: o.id,
            officer_id: o.badge_number ?? o.id,
            full_name: o.full_name,
            email: o.email,
            phone: o.phone,
            role: o.role,
            status: o.status === 'active' ? 'ACTIVE' : 'DISABLED',
            tickets_issued: o.tickets_issued ?? 0,
            last_login_at: o.last_login_at,
            created_at: o.created_at,
        }));
        return {
            items: mapped,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async create(adminId, body) {
        if (!body || typeof body !== 'object') {
            throw new commonErrors_1.ValidationError('Request body is required');
        }
        if (!adminId?.trim()) {
            throw new commonErrors_1.ValidationError('Administrator context is required');
        }
        const creatorId = adminId.trim();
        const adminUser = await adminRepo.findById(creatorId);
        if (!adminUser) {
            throw new commonErrors_1.ValidationError('Your admin account was not found. Please sign out and sign in again.');
        }
        if (!body.full_name?.trim())
            throw new commonErrors_1.ValidationError('full_name is required');
        if (!body.email?.trim())
            throw new commonErrors_1.ValidationError('email is required');
        if (!body.role)
            throw new commonErrors_1.ValidationError('role is required');
        const roleNorm = String(body.role).trim().toUpperCase();
        if (roleNorm !== 'OFFICER' && roleNorm !== 'SUPERVISOR') {
            throw new commonErrors_1.ValidationError('role must be OFFICER or SUPERVISOR');
        }
        const role = roleNorm;
        const rawPassword = body.password?.trim() || 'Officer@123';
        if (rawPassword.length < 8)
            throw new commonErrors_1.ValidationError('password must be at least 8 characters');
        const passwordHash = await bcryptjs_1.default.hash(rawPassword, env_1.env.bcryptSaltRounds);
        try {
            const id = await officerRepo.create({
                createdByAdminId: creatorId,
                fullName: body.full_name,
                email: body.email,
                phone: body.phone,
                badgeNumber: body.badge_number,
                role,
                passwordHash,
            });
            return { id, password: rawPassword };
        }
        catch (e) {
            const err = e;
            if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                const msg = String(err.sqlMessage ?? err.message ?? '').toLowerCase();
                if (msg.includes('email')) {
                    throw new commonErrors_1.ValidationError('An officer with this email already exists');
                }
                throw new commonErrors_1.ValidationError('This officer conflicts with existing data (duplicate unique field)');
            }
            if (err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new commonErrors_1.ValidationError('Could not create officer because your admin account is not linked correctly. Sign out and sign in again, or contact support.');
            }
            throw e;
        }
    }
    async update(id, body) {
        const affected = await officerRepo.update(id, {
            fullName: body.full_name,
            phone: body.phone,
            role: body.role,
            badgeNumber: body.badge_number,
        });
        if (affected === 0) {
            // if nothing updated, still allow idempotent calls, but validate officer exists
            const { items } = await officerRepo.list({ page: 1, limit: 1, q: id });
            if (!items.find((x) => x.id === id))
                throw new commonErrors_1.NotFoundError('Officer not found');
        }
    }
    async setStatus(id, status) {
        const affected = await officerRepo.setUiStatus(id, status);
        if (affected === 0)
            throw new commonErrors_1.NotFoundError('Officer not found');
    }
    async remove(id) {
        const affected = await officerRepo.remove(id);
        if (affected === 0)
            throw new commonErrors_1.NotFoundError('Officer not found');
    }
}
exports.OfficerService = OfficerService;
//# sourceMappingURL=officer.service.js.map