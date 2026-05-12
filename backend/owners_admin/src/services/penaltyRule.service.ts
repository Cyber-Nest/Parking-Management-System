import { PenaltyRuleRepository, PenaltyRulePublic, PenaltyRuleQuery } from '../repositories/penaltyRule.repository';
import { PaginatedResponse } from '../types';
import { NotFoundError } from './commonErrors';
import { randomUUID } from 'crypto';

const repository = new PenaltyRuleRepository();

export class PenaltyRuleService {
    async list(query: Record<string, string | undefined>): Promise<PaginatedResponse<PenaltyRulePublic>> {
        const parsedQuery: PenaltyRuleQuery = {
            page: query.page ? parseInt(query.page, 10) : 1,
            limit: query.limit ? parseInt(query.limit, 10) : 10,
            q: query.q,
            status: query.status,
        };

        return repository.list(parsedQuery);
    }

    async getById(id: string): Promise<PenaltyRulePublic | null> {
        return repository.getById(id);
    }

    async create(data: Omit<PenaltyRulePublic, 'id' | 'created_at' | 'updated_at'>): Promise<PenaltyRulePublic> {
        const rule: PenaltyRulePublic & { id: string } = {
            id: randomUUID(),
            ...data,
        };

        return repository.create(rule);
    }

    async update(id: string, data: Partial<Omit<PenaltyRulePublic, 'id' | 'created_at'>>): Promise<PenaltyRulePublic> {
        const affected = await repository.update(id, data);
        if (affected === 0) {
            throw new NotFoundError('Penalty rule not found');
        }

        const rule = await repository.getById(id);
        if (!rule) {
            throw new NotFoundError('Penalty rule not found');
        }

        return rule;
    }

    async delete(id: string): Promise<boolean> {
        const result = await repository.delete(id);
        return result > 0;
    }
}

export default PenaltyRuleService;
