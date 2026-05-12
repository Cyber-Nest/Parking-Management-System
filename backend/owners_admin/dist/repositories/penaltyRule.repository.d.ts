import { PaginatedResponse } from '../types';
export interface PenaltyRuleQuery {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
}
export interface PenaltyRulePublic {
    id: string;
    violation: string;
    code: string;
    amount: number;
    grace_minutes?: number;
    description?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}
export declare class PenaltyRuleRepository {
    list(query: PenaltyRuleQuery): Promise<PaginatedResponse<PenaltyRulePublic>>;
    getById(id: string): Promise<PenaltyRulePublic | null>;
    create(rule: Omit<PenaltyRulePublic, 'created_at' | 'updated_at'> & {
        id: string;
    }): Promise<PenaltyRulePublic>;
    update(id: string, updates: Partial<Omit<PenaltyRulePublic, 'id' | 'created_at'>>): Promise<number>;
    delete(id: string): Promise<number>;
}
export default PenaltyRuleRepository;
//# sourceMappingURL=penaltyRule.repository.d.ts.map