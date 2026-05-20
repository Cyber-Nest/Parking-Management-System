import { PenaltyRulePublic } from '../repositories/penaltyRule.repository';
import { PaginatedResponse } from '../types';
export declare class PenaltyRuleService {
    list(query: Record<string, string | undefined>): Promise<PaginatedResponse<PenaltyRulePublic>>;
    getById(id: string): Promise<PenaltyRulePublic | null>;
    create(data: Omit<PenaltyRulePublic, 'id' | 'created_at' | 'updated_at'>): Promise<PenaltyRulePublic>;
    update(id: string, data: Partial<Omit<PenaltyRulePublic, 'id' | 'created_at'>>): Promise<PenaltyRulePublic | null>;
    delete(id: string): Promise<boolean>;
}
export default PenaltyRuleService;
//# sourceMappingURL=penaltyRule.service.d.ts.map