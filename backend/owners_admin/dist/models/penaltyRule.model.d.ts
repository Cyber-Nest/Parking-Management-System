import { Model } from 'sequelize';
export declare class PenaltyRule extends Model {
    id: string;
    violation: string;
    code: string;
    amount: number;
    grace_minutes?: number;
    description?: string;
    status: 'Active' | 'Inactive';
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default PenaltyRule;
//# sourceMappingURL=penaltyRule.model.d.ts.map