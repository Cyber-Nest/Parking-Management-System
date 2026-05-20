import { Tax } from '../models/tax.model';
export declare class TaxService {
    list(query: Record<string, string | undefined>): Promise<{
        items: Tax[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(body: {
        name: string;
        rate: number;
        type?: 'percentage' | 'fixed';
        is_active?: boolean;
    }): Promise<Tax>;
    update(id: string, body: {
        name?: string;
        rate?: number;
        type?: 'percentage' | 'fixed';
        is_active?: boolean;
    }): Promise<Tax>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=tax.service.d.ts.map