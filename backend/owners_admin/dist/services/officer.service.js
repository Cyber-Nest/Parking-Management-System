"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficerService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const officer_repository_1 = require("../repositories/officer.repository");
const commonErrors_1 = require("./commonErrors");
const env_1 = require("../config/env");
const officerRepo = new officer_repository_1.OfficerRepository();
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
        if (!body.full_name?.trim())
            throw new commonErrors_1.ValidationError('full_name is required');
        if (!body.email?.trim())
            throw new commonErrors_1.ValidationError('email is required');
        if (!body.role)
            throw new commonErrors_1.ValidationError('role is required');
        const rawPassword = body.password?.trim() || 'Officer@123';
        if (rawPassword.length < 8)
            throw new commonErrors_1.ValidationError('password must be at least 8 characters');
        const passwordHash = await bcryptjs_1.default.hash(rawPassword, env_1.env.bcryptSaltRounds);
        const id = await officerRepo.create({
            createdByAdminId: adminId,
            fullName: body.full_name,
            email: body.email,
            phone: body.phone,
            badgeNumber: body.badge_number,
            role: body.role,
            passwordHash,
        });
        return { id, password: rawPassword };
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