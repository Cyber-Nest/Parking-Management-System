import { Model } from 'sequelize';
export declare class Pricing extends Model {
    id: string;
    name: string;
    base_price: number;
    additional_fees: number;
    tax_id: string | null;
    is_active: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
//# sourceMappingURL=pricing.model.d.ts.map