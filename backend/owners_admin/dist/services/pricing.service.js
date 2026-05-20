"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const pricing_model_1 = require("../models/pricing.model");
const commonErrors_1 = require("./commonErrors");
class PricingService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { rows: items, count: total } = await pricing_model_1.Pricing.findAndCountAll({
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
        if (typeof body.base_price !== 'number' || body.base_price < 0)
            throw new commonErrors_1.ValidationError('base_price must be a non-negative number');
        const pricing = await pricing_model_1.Pricing.create({
            id: require('crypto').randomUUID(),
            name: body.name.trim(),
            base_price: body.base_price,
            additional_fees: body.additional_fees ?? 0,
            tax_id: body.tax_id || null,
            is_active: body.is_active ?? true,
        });
        return pricing;
    }
    async update(id, body) {
        const pricing = await pricing_model_1.Pricing.findByPk(id);
        if (!pricing)
            throw new commonErrors_1.NotFoundError('Pricing not found');
        if (body.name !== undefined) {
            if (!body.name.trim())
                throw new commonErrors_1.ValidationError('name cannot be empty');
            pricing.name = body.name.trim();
        }
        if (body.base_price !== undefined) {
            if (typeof body.base_price !== 'number' || body.base_price < 0)
                throw new commonErrors_1.ValidationError('base_price must be a non-negative number');
            pricing.base_price = body.base_price;
        }
        if (body.additional_fees !== undefined)
            pricing.additional_fees = body.additional_fees;
        if (body.tax_id !== undefined)
            pricing.tax_id = body.tax_id;
        if (body.is_active !== undefined)
            pricing.is_active = body.is_active;
        await pricing.save();
        return pricing;
    }
    async remove(id) {
        const pricing = await pricing_model_1.Pricing.findByPk(id);
        if (!pricing)
            throw new commonErrors_1.NotFoundError('Pricing not found');
        await pricing.destroy();
    }
}
exports.PricingService = PricingService;
//# sourceMappingURL=pricing.service.js.map