"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxService = void 0;
const tax_model_1 = require("../models/tax.model");
const commonErrors_1 = require("./commonErrors");
class TaxService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { rows: items, count: total } = await tax_model_1.Tax.findAndCountAll({
            where: {
                ...(query.q && {
                    name: { [require('sequelize').Op.like]: `%${query.q}%` }
                }),
                ...(query.is_active && { is_active: query.is_active === 'true' })
            },
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']],
        });
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async create(body) {
        if (!body.name?.trim())
            throw new commonErrors_1.ValidationError('name is required');
        if (typeof body.rate !== 'number' || body.rate < 0)
            throw new commonErrors_1.ValidationError('rate must be a non-negative number');
        const tax = await tax_model_1.Tax.create({
            id: require('crypto').randomUUID(),
            name: body.name.trim(),
            rate: body.rate,
            type: body.type ?? 'percentage',
            is_active: body.is_active ?? true,
        });
        return tax;
    }
    async update(id, body) {
        const tax = await tax_model_1.Tax.findByPk(id);
        if (!tax)
            throw new commonErrors_1.NotFoundError('Tax not found');
        if (body.name !== undefined) {
            if (!body.name.trim())
                throw new commonErrors_1.ValidationError('name cannot be empty');
            tax.name = body.name.trim();
        }
        if (body.rate !== undefined) {
            if (typeof body.rate !== 'number' || body.rate < 0)
                throw new commonErrors_1.ValidationError('rate must be a non-negative number');
            tax.rate = body.rate;
        }
        if (body.type !== undefined)
            tax.type = body.type;
        if (body.is_active !== undefined)
            tax.is_active = body.is_active;
        await tax.save();
        return tax;
    }
    async remove(id) {
        const tax = await tax_model_1.Tax.findByPk(id);
        if (!tax)
            throw new commonErrors_1.NotFoundError('Tax not found');
        await tax.destroy();
    }
}
exports.TaxService = TaxService;
//# sourceMappingURL=tax.service.js.map