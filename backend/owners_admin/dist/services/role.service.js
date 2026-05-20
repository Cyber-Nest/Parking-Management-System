"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const settings_repository_1 = require("../repositories/settings.repository");
const commonErrors_1 = require("./commonErrors");
const settingsRepo = new settings_repository_1.SettingsRepository();
const toIso = (d) => {
    if (d === null || d === undefined)
        return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
};
const normalizePermissions = (raw) => {
    if (raw === null || raw === undefined || raw === '')
        return {};
    try {
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
};
const permissionsToJson = (body) => {
    if (body.permissions === undefined)
        return JSON.stringify({});
    if (typeof body.permissions === 'string')
        return body.permissions;
    return JSON.stringify(body.permissions ?? {});
};
class RoleService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const q = query.q;
        const { items, total } = await settingsRepo.listRolesPaginated({ page, limit, q });
        const mapped = items.map((row) => {
            const perms = normalizePermissions(row.permissions);
            return {
                id: row.id,
                name: row.name,
                description: null,
                permissions: perms,
                created_at: toIso(row.created_at) ?? new Date().toISOString(),
                updated_at: toIso(row.updated_at) ?? new Date().toISOString(),
            };
        });
        return {
            items: mapped,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async create(body) {
        if (!body.name?.trim())
            throw new commonErrors_1.ValidationError('name is required');
        const name = body.name.trim();
        const existingId = await settingsRepo.findRoleIdByName(name);
        if (existingId)
            throw new commonErrors_1.ValidationError('A role with this name already exists');
        const id = crypto_1.default.randomUUID();
        await settingsRepo.insertRoleRow(id, name);
        await settingsRepo.upsertRolePermissions(id, permissionsToJson(body));
        return { id };
    }
    async update(id, body) {
        const role = await settingsRepo.findRoleById(id);
        if (!role)
            throw new commonErrors_1.NotFoundError('Role not found');
        if (body.name !== undefined) {
            if (!body.name.trim())
                throw new commonErrors_1.ValidationError('name cannot be empty');
            const existingId = await settingsRepo.findRoleIdByName(body.name.trim());
            if (existingId && existingId !== id)
                throw new commonErrors_1.ValidationError('A role with this name already exists');
            await settingsRepo.updateRoleName(id, body.name.trim());
        }
        if (body.permissions !== undefined) {
            await settingsRepo.upsertRolePermissions(id, permissionsToJson(body));
        }
        return { id };
    }
    async remove(id) {
        const role = await settingsRepo.findRoleById(id);
        if (!role)
            throw new commonErrors_1.NotFoundError('Role not found');
        if (role.name === 'owner')
            throw new commonErrors_1.ValidationError('Cannot delete the owner role');
        const admins = await settingsRepo.countAdminsByRoleId(id);
        if (admins > 0)
            throw new commonErrors_1.ValidationError('Cannot delete a role that is assigned to users');
        await settingsRepo.deleteRolePermissions(id);
        const n = await settingsRepo.deleteRoleRow(id);
        if (!n)
            throw new commonErrors_1.NotFoundError('Role not found');
    }
}
exports.RoleService = RoleService;
//# sourceMappingURL=role.service.js.map