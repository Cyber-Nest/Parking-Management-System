import crypto from 'crypto';
import { SettingsRepository } from '../repositories/settings.repository';
import { ValidationError, NotFoundError } from './commonErrors';

const settingsRepo = new SettingsRepository();

const toIso = (d: Date | string | null | undefined): string | undefined => {
    if (d === null || d === undefined) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
};

const normalizePermissions = (raw: string | null): unknown => {
    if (raw === null || raw === undefined || raw === '') return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
};

const permissionsToJson = (body: { permissions?: string | object }): string => {
    if (body.permissions === undefined) return JSON.stringify({});
    if (typeof body.permissions === 'string') return body.permissions;
    return JSON.stringify(body.permissions ?? {});
};

export class RoleService {
    async list(query: Record<string, string | undefined>) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const q = query.q;

        const { items, total } = await settingsRepo.listRolesPaginated({ page, limit, q });

        const mapped = items.map((row) => {
            const perms = normalizePermissions(row.permissions);
            return {
                id: row.id,
                name: row.name,
                description: null as string | null,
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

    async create(body: { name: string; description?: string; permissions?: string | object }) {
        if (!body.name?.trim()) throw new ValidationError('name is required');

        const name = body.name.trim();
        const existingId = await settingsRepo.findRoleIdByName(name);
        if (existingId) throw new ValidationError('A role with this name already exists');

        const id = crypto.randomUUID();
        await settingsRepo.insertRoleRow(id, name);
        await settingsRepo.upsertRolePermissions(id, permissionsToJson(body));

        return { id };
    }

    async update(id: string, body: { name?: string; description?: string; permissions?: string | object }) {
        const role = await settingsRepo.findRoleById(id);
        if (!role) throw new NotFoundError('Role not found');

        if (body.name !== undefined) {
            if (!body.name.trim()) throw new ValidationError('name cannot be empty');
            const existingId = await settingsRepo.findRoleIdByName(body.name.trim());
            if (existingId && existingId !== id) throw new ValidationError('A role with this name already exists');
            await settingsRepo.updateRoleName(id, body.name.trim());
        }

        if (body.permissions !== undefined) {
            await settingsRepo.upsertRolePermissions(id, permissionsToJson(body));
        }

        return { id };
    }

    async remove(id: string) {
        const role = await settingsRepo.findRoleById(id);
        if (!role) throw new NotFoundError('Role not found');
        if (role.name === 'owner') throw new ValidationError('Cannot delete the owner role');

        const admins = await settingsRepo.countAdminsByRoleId(id);
        if (admins > 0) throw new ValidationError('Cannot delete a role that is assigned to users');

        await settingsRepo.deleteRolePermissions(id);
        const n = await settingsRepo.deleteRoleRow(id);
        if (!n) throw new NotFoundError('Role not found');
    }
}
