import { SystemSettingsPublic, BrandingSettingsPublic } from '../repositories/settings.repository';
export declare class SettingsService {
    getSystemSettings(): Promise<SystemSettingsPublic>;
    updateSystemSettings(settings: SystemSettingsPublic): Promise<SystemSettingsPublic>;
    getBrandingSettings(): Promise<BrandingSettingsPublic>;
    updateBrandingSettings(settings: BrandingSettingsPublic): Promise<BrandingSettingsPublic>;
    getTaxPricing(): Promise<{
        tax_rate_percent: number;
        currency: string;
        service_fee: number;
        rounding_rule: string;
        prices_include_tax: number;
        refund_allowed: number;
        refund_approval_required: number;
    }>;
    updateTaxPricing(patch: {
        tax_rate_percent?: number;
        service_fee?: number;
        rounding_rule?: string;
        prices_include_tax?: number;
        refund_allowed?: number;
        refund_approval_required?: number;
    }): Promise<{
        tax_rate_percent: number;
        currency: string;
        service_fee: number;
        rounding_rule: string;
        prices_include_tax: number;
        refund_allowed: number;
        refund_approval_required: number;
    }>;
    listAdmins(): Promise<{
        id: string;
        email: string;
        full_name: string;
        role_name: string;
        is_active: number;
        last_login_at: Date | null;
        created_at: Date;
    }[]>;
    updateAdmin(id: string, patch: {
        full_name?: string;
        role_id?: string;
        is_active?: number;
    }): Promise<number>;
    listRolesWithPermissions(): Promise<{
        id: string;
        name: string;
        permissions: string | null;
    }[]>;
    upsertRolePermissions(roleId: string, permissions: unknown): Promise<void>;
    findRoleIdByName(name: string): Promise<string | null>;
    createAdmin(body: {
        email: string;
        password: string;
        full_name: string;
        role_name: string;
    }): Promise<{
        id: string;
    }>;
}
export default SettingsService;
//# sourceMappingURL=settings.service.d.ts.map