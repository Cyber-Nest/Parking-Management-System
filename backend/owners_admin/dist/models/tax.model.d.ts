import { Model } from 'sequelize';
export declare class Tax extends Model {
    id: string;
    name: string;
    rate: number;
    type: 'percentage' | 'fixed';
    is_active: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
//# sourceMappingURL=tax.model.d.ts.map