"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const role_model_1 = require("../models/role.model");
const commonErrors_1 = require("./commonErrors");
class RoleService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { rows: items, count: total } = await role_model_1.Role.findAndCountAll({
            where: {
                ...(query.q && {
                    name: { [require('sequelize').Op.like]: `%${query.q}%` }
                })
            },
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']],
        });
        const mapped = items.map((r) => {
            const j = r.get({ plain: true });
            let perms = j.permissions;
            if (typeof perms === 'string') {
                try {
                    perms = JSON.parse(perms);
                }
                catch {
                    perms = [];
                }
            }
            return {
                id: j.id,
                name: j.name,
                description: j.description ?? null,
                permissions: perms,
                created_at: j.created_at,
                updated_at: j.updated_at,
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
        let perms = typeof body.permissions === 'string'
            ? body.permissions
            : JSON.stringify(body.permissions ?? []);
        const role = await role_model_1.Role.create({
            id: require('crypto').randomUUID(),
            name: body.name.trim(),
            description: body.description?.trim() || null,
            permissions: perms,
        });
        return role;
    }
    async update(id, body) {
        const role = await role_model_1.Role.findByPk(id);
        if (!role)
            throw new commonErrors_1.NotFoundError('Role not found');
        if (body.name !== undefined) {
            if (!body.name.trim())
                throw new commonErrors_1.ValidationError('name cannot be empty');
            role.name = body.name.trim();
        }
        if (body.description !== undefined)
            role.description = body.description?.trim() || null;
        if (body.permissions !== undefined) {
            role.permissions =
                typeof body.permissions === 'string'
                    ? body.permissions
                    : JSON.stringify(body.permissions ?? []);
        }
        await role.save();
        return role;
    }
    async remove(id) {
        const role = await role_model_1.Role.findByPk(id);
        if (!role)
            throw new commonErrors_1.NotFoundError('Role not found');
        await role.destroy();
    }
}
exports.RoleService = RoleService;
//# sourceMappingURL=role.service.js.map