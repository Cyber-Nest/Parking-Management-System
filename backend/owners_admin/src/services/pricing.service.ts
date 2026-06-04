import { Pricing } from '../models/pricing.model';
import { ValidationError, NotFoundError } from './commonErrors';

export class PricingService {
    async list(query: Record<string, string | undefined>) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const parkingLotId = query.parking_lot_id;

        const { rows: items, count: total } = await Pricing.findAndCountAll({
            where: {
                ...(query.q && {
                    name: { [require('sequelize').Op.like]: `%${query.q}%` }
                }),
                ...(query.is_active && { is_active: query.is_active === 'true' }),
                ...(parkingLotId && { parking_lot_id: parkingLotId }),
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

    async create(body: { name: string; base_price: number; additional_fees?: number; tax_id?: string; is_active?: boolean; parking_lot_id?: string }) {
        if (!body.name?.trim()) throw new ValidationError('name is required');
        if (typeof body.base_price !== 'number' || body.base_price < 0) throw new ValidationError('base_price must be a non-negative number');

        const pricing = await Pricing.create({
            id: require('crypto').randomUUID(),
            name: body.name.trim(),
            base_price: body.base_price,
            additional_fees: body.additional_fees ?? 0,
            tax_id: body.tax_id || null,
            is_active: body.is_active ?? true,
            parking_lot_id: body.parking_lot_id || null,
        });

        return pricing;
    }

    async update(id: string, body: { name?: string; base_price?: number; additional_fees?: number; tax_id?: string; is_active?: boolean; parking_lot_id?: string }) {
        const pricing = await Pricing.findByPk(id);
        if (!pricing) throw new NotFoundError('Pricing not found');

        if (body.name !== undefined) {
            if (!body.name.trim()) throw new ValidationError('name cannot be empty');
            pricing.name = body.name.trim();
        }
        if (body.base_price !== undefined) {
            if (typeof body.base_price !== 'number' || body.base_price < 0) throw new ValidationError('base_price must be a non-negative number');
            pricing.base_price = body.base_price;
        }
        if (body.additional_fees !== undefined) pricing.additional_fees = body.additional_fees;
        if (body.tax_id !== undefined) pricing.tax_id = body.tax_id;
        if (body.is_active !== undefined) pricing.is_active = body.is_active;
        if (body.parking_lot_id !== undefined) pricing.parking_lot_id = body.parking_lot_id || null;

        await pricing.save();
        return pricing;
    }

    async remove(id: string) {
        const pricing = await Pricing.findByPk(id);
        if (!pricing) throw new NotFoundError('Pricing not found');
        await pricing.destroy();
    }
}