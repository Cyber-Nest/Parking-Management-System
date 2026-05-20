import bcrypt from 'bcryptjs';

import { SettingsRepository } from '../repositories/settings.repository';

import { AdminRepository } from '../repositories/admin.repository';

import { ValidationError, NotFoundError } from './commonErrors';

import { env } from '../config/env';



const settingsRepo = new SettingsRepository();

const adminRepo = new AdminRepository();



const toIso = (d: Date | string | null | undefined): string | null => {

    if (d === null || d === undefined) return null;

    const dt = d instanceof Date ? d : new Date(d);

    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();

};



export class UserService {

    async list(query: Record<string, string | undefined>) {

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



    async create(body: { username: string; email: string; password: string; role_id: string; is_active?: boolean }) {

        if (!body.username?.trim()) throw new ValidationError('username is required');

        if (!body.email?.trim()) throw new ValidationError('email is required');

        if (!body.role_id?.trim()) throw new ValidationError('role_id is required');

        if (!body.password?.trim()) throw new ValidationError('password is required');

        if (body.password.length < 8) throw new ValidationError('password must be at least 8 characters');



        const existing = await adminRepo.findByEmail(body.email.trim());

        if (existing) throw new ValidationError('email already in use');



        const passwordHash = await bcrypt.hash(body.password.trim(), env.bcryptSaltRounds);

        const id = await adminRepo.insertAdmin({

            email: body.email.trim(),

            passwordHash,

            fullName: body.username.trim(),

            roleId: body.role_id.trim(),

            isActive: body.is_active ?? true,

        });



        return { id };

    }



    async update(

        id: string,

        body: { username?: string; email?: string; role_id?: string; is_active?: boolean }

    ) {

        const user = await adminRepo.findById(id);

        if (!user) throw new NotFoundError('User not found');



        const patch: { full_name?: string; email?: string; role_id?: string; is_active?: number } = {};

        if (body.username !== undefined) {

            if (!body.username.trim()) throw new ValidationError('username cannot be empty');

            patch.full_name = body.username.trim();

        }

        if (body.email !== undefined) {

            if (!body.email.trim()) throw new ValidationError('email cannot be empty');

            patch.email = body.email.trim();

        }

        if (body.role_id !== undefined) {

            if (!body.role_id.trim()) throw new ValidationError('role_id cannot be empty');

            patch.role_id = body.role_id.trim();

        }

        if (body.is_active !== undefined) patch.is_active = body.is_active ? 1 : 0;



        if (patch.email) {

            const other = await adminRepo.findByEmail(patch.email);

            if (other && other.id !== id) throw new ValidationError('email already in use');

        }



        const n = await settingsRepo.updateAdmin(id, patch);

        if (!n) throw new NotFoundError('User not found');

        const updated = await adminRepo.findById(id);

        if (!updated) throw new NotFoundError('User not found');

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



    async remove(id: string) {

        const user = await adminRepo.findById(id);

        if (!user) throw new NotFoundError('User not found');

        const total = await settingsRepo.countAdmins();

        if (total <= 1) throw new ValidationError('Cannot delete the last admin user');

        await settingsRepo.deleteAdmin(id);

    }

}

