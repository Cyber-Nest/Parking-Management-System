export interface SystemSettingsPublic {
    timezone: string;
    language: string;
    date_format: string;
    time_format: string;
    week_starts_on: string;
    currency: string;
    session_expiry_display: number;
    tax_rate_percent?: number;
    service_fee?: number;
    rounding_rule?: string;
    prices_include_tax?: number;
    refund_allowed?: number;
    refund_approval_required?: number;
}
export interface BrandingSettingsPublic {
    system_name: string;
    theme_color: string;
    dark_mode: string;
    logo_url?: string | null;
    favicon_url?: string | null;
    sidebar_collapsed?: boolean;
}
export declare class SettingsRepository {
    private settingsId;
    getSystemSettings(): Promise<SystemSettingsPublic | null>;
    updateSystemSettings(settings: SystemSettingsPublic): Promise<SystemSettingsPublic>;
    getBrandingSettings(): Promise<BrandingSettingsPublic | null>;
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
    }): Promise<void>;
    listAdmins(): Promise<{
        id: string;
        email: string;
        full_name: string;
        role_name: string;
        is_active: number;
        last_login_at: Date | null;
        created_at: Date;
    }[]>;
    findRoleIdByName(name: string): Promise<string | null>;
    updateAdmin(id: string, patch: {
        full_name?: string;
        email?: string;
        role_id?: string;
        is_active?: number;
    }): Promise<number>;
    listAdminsPaginated(params: {
        page: number;
        limit: number;
        q?: string;
    }): Promise<{
        items: {
            id: string;
            email: string;
            full_name: string;
            role_id: string;
            role_name: string;
            is_active: number;
            last_login_at: Date | null;
            created_at: Date;
            updated_at: Date;
        }[];
        total: number;
    }>;
    countAdmins(): Promise<number>;
    deleteAdmin(id: string): Promise<number>;
    listRolesWithPermissions(): Promise<{
        id: string;
        name: string;
        permissions: string | null;
    }[]>;
    upsertRolePermissions(roleId: string, permissionsJson: string): Promise<void>;
    listRolesPaginated(params: {
        page: number;
        limit: number;
        q?: string;
    }): Promise<{
        items: {
            id: string;
            name: string;
            permissions: string | null;
            created_at: Date | null;
            updated_at: Date | null;
        }[];
        total: number;
    }>;
    findRoleById(id: string): Promise<{
        id: string;
        name: string;
    } | null>;
    insertRoleRow(id: string, name: string): Promise<void>;
    updateRoleName(id: string, name: string): Promise<number>;
    countAdminsByRoleId(roleId: string): Promise<number>;
    deleteRolePermissions(roleId: string): Promise<void>;
    deleteRoleRow(id: string): Promise<number>;
    private getDefaultSystemSettings;
    private getDefaultBrandingSettings;
}
export default SettingsRepository;
//# sourceMappingURL=settings.repository.d.ts.map