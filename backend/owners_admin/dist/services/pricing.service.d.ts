import { Pricing } from '../models/pricing.model';
export declare class PricingService {
    list(query: Record<string, string | undefined>): Promise<{
        items: Pricing[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(body: {
        name: string;
        base_price: number;
        additional_fees?: number;
        tax_id?: string;
        is_active?: boolean;
    }): Promise<Pricing>;
    update(id: string, body: {
        name?: string;
        base_price?: number;
        additional_fees?: number;
        tax_id?: string;
        is_active?: boolean;
    }): Promise<Pricing>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=pricing.service.d.ts.map