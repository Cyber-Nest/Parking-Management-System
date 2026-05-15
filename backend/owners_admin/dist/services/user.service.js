"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
const commonErrors_1 = require("./commonErrors");
const env_1 = require("../config/env");
class UserService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { rows: items, count: total } = await user_model_1.User.findAndCountAll({
            where: {
                ...(query.q && {
                    [require('sequelize').Op.or]: [
                        { username: { [require('sequelize').Op.like]: `%${query.q}%` } },
                        { email: { [require('sequelize').Op.like]: `%${query.q}%` } }
                    ]
                }),
                ...(query.is_active && { is_active: query.is_active === 'true' })
            },
            include: [
                {
                    model: role_model_1.Role,
                    as: 'role',
                    attributes: ['id', 'name', 'description', 'permissions'],
                    required: false,
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']],
        });
        const mapped = items.map((u) => {
            const j = u.get({ plain: true });
            return {
                id: j.id,
                username: j.username,
                email: j.email,
                role_id: j.role_id,
                role_name: j.role?.name ?? null,
                is_active: Boolean(j.is_active),
                last_login_at: j.last_login_at ?? null,
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
        const passwordHash = await bcryptjs_1.default.hash(body.password.trim(), env_1.env.bcryptSaltRounds);
        const user = await user_model_1.User.create({
            id: require('crypto').randomUUID(),
            username: body.username.trim(),
            email: body.email.trim(),
            password_hash: passwordHash,
            role_id: body.role_id.trim(),
            is_active: body.is_active ?? true,
        });
        return { id: user.id };
    }
    async update(id, body) {
        const user = await user_model_1.User.findByPk(id);
        if (!user)
            throw new commonErrors_1.NotFoundError('User not found');
        if (body.username !== undefined) {
            if (!body.username.trim())
                throw new commonErrors_1.ValidationError('username cannot be empty');
            user.username = body.username.trim();
        }
        if (body.email !== undefined) {
            if (!body.email.trim())
                throw new commonErrors_1.ValidationError('email cannot be empty');
            user.email = body.email.trim();
        }
        if (body.role_id !== undefined) {
            if (!body.role_id.trim())
                throw new commonErrors_1.ValidationError('role_id cannot be empty');
            user.role_id = body.role_id.trim();
        }
        if (body.is_active !== undefined)
            user.is_active = body.is_active;
        await user.save();
        return user;
    }
    async remove(id) {
        const user = await user_model_1.User.findByPk(id);
        if (!user)
            throw new commonErrors_1.NotFoundError('User not found');
        await user.destroy();
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map