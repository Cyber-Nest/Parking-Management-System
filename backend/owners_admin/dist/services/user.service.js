"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const settings_repository_1 = require("../repositories/settings.repository");
const admin_repository_1 = require("../repositories/admin.repository");
const commonErrors_1 = require("./commonErrors");
const env_1 = require("../config/env");
const settingsRepo = new settings_repository_1.SettingsRepository();
const adminRepo = new admin_repository_1.AdminRepository();
const toIso = (d) => {
    if (d === null || d === undefined)
        return null;
    const dt = d instanceof Date ? d : new Date(d);
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
};
class UserService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const q = query.q;
        const { items, total } = await settingsRepo.listAdminsPaginated({ page, limit, q });
        const mapped = items.map((row) => ({
            id: row.id,
            username: row.full_name?.trim() || row.email.split('@')[0] || row.email,
            email: row.email,
            role_id: row.role_id,
            role_name: row.role_name ?? null,
            is_active: Boolean(row.is_active),
            last_login_at: toIso(row.last_login_at),
            created_at: toIso(row.created_at) ?? new Date().toISOString(),
            updated_at: toIso(row.updated_at) ?? new Date().toISOString(),
        }));
        return {
            items: mapped,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async create(body) {
        if (!body.username?.trim())
            throw new commonErrors_1.ValidationError('username is required');
        if (!body.email?.trim())
            throw new commonErrors_1.ValidationError('email is required');
        if (!body.role_id?.trim())
            throw new commonErrors_1.ValidationError('role_id is required');
        if (!body.password?.trim())
            throw new commonErrors_1.ValidationError('password is required');
        if (body.password.length < 8)
            throw new commonErrors_1.ValidationError('password must be at least 8 characters');
        const existing = await adminRepo.findByEmail(body.email.trim());
        if (existing)
            throw new commonErrors_1.ValidationError('email already in use');
        const passwordHash = await bcryptjs_1.default.hash(body.password.trim(), env_1.env.bcryptSaltRounds);
        const id = await adminRepo.insertAdmin({
            email: body.email.trim(),
            passwordHash,
            fullName: body.username.trim(),
            roleId: body.role_id.trim(),
            isActive: body.is_active ?? true,
        });
        return { id };
    }
    async update(id, body) {
        const user = await adminRepo.findById(id);
        if (!user)
            throw new commonErrors_1.NotFoundError('User not found');
        const patch = {};
        if (body.username !== undefined) {
            if (!body.username.trim())
                throw new commonErrors_1.ValidationError('username cannot be empty');
            patch.full_name = body.username.trim();
        }
        if (body.email !== undefined) {
            if (!body.email.trim())
                throw new commonErrors_1.ValidationError('email cannot be empty');
            patch.email = body.email.trim();
        }
        if (body.role_id !== undefined) {
            if (!body.role_id.trim())
                throw new commonErrors_1.ValidationError('role_id cannot be empty');
            patch.role_id = body.role_id.trim();
        }
        if (body.is_active !== undefined)
            patch.is_active = body.is_active ? 1 : 0;
        if (patch.email) {
            const other = await adminRepo.findByEmail(patch.email);
            if (other && other.id !== id)
                throw new commonErrors_1.ValidationError('email already in use');
        }
        const n = await settingsRepo.updateAdmin(id, patch);
        if (!n)
            throw new commonErrors_1.NotFoundError('User not found');
        const updated = await adminRepo.findById(id);
        if (!updated)
            throw new commonErrors_1.NotFoundError('User not found');
        return {
            id: updated.id,
            username: updated.full_name?.trim() || updated.email.split('@')[0] || updated.email,
            email: updated.email,
            role_id: updated.role_id,
            role_name: updated.role_name ?? null,
            is_active: Boolean(updated.is_active),
            last_login_at: toIso(updated.last_login_at),
            created_at: toIso(updated.created_at) ?? new Date().toISOString(),
            updated_at: toIso(updated.updated_at) ?? new Date().toISOString(),
        };
    }
    async remove(id) {
        const user = await adminRepo.findById(id);
        if (!user)
            throw new commonErrors_1.NotFoundError('User not found');
        const total = await settingsRepo.countAdmins();
        if (total <= 1)
            throw new commonErrors_1.ValidationError('Cannot delete the last admin user');
        await settingsRepo.deleteAdmin(id);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map