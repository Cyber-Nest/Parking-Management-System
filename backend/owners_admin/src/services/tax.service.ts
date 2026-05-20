import { Tax } from '../models/tax.model';
import { ValidationError, NotFoundError } from './commonErrors';

export class TaxService {
    async list(query: Record<string, string | undefined>) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));

        const { rows: items, count: total } = await Tax.findAndCountAll({
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

    async create(body: { name: string; rate: number; type?: 'percentage' | 'fixed'; is_active?: boolean }) {
        if (!body.name?.trim()) throw new ValidationError('name is required');
        if (typeof body.rate !== 'number' || body.rate < 0) throw new ValidationError('rate must be a non-negative number');

        const tax = await Tax.create({
            id: require('crypto').randomUUID(),
            name: body.name.trim(),
            rate: body.rate,
            type: body.type ?? 'percentage',
            is_active: body.is_active ?? true,
        });

        return tax;
    }

    async update(id: string, body: { name?: string; rate?: number; type?: 'percentage' | 'fixed'; is_active?: boolean }) {
        const tax = await Tax.findByPk(id);
        if (!tax) throw new NotFoundError('Tax not found');

        if (body.name !== undefined) {
            if (!body.name.trim()) throw new ValidationError('name cannot be empty');
            tax.name = body.name.trim();
        }
        if (body.rate !== undefined) {
            if (typeof body.rate !== 'number' || body.rate < 0) throw new ValidationError('rate must be a non-negative number');
            tax.rate = body.rate;
        }
        if (body.type !== undefined) tax.type = body.type;
        if (body.is_active !== undefined) tax.is_active = body.is_active;

        await tax.save();
        return tax;
    }

    async remove(id: string) {
        const tax = await Tax.findByPk(id);
        if (!tax) throw new NotFoundError('Tax not found');
        await tax.destroy();
    }
}