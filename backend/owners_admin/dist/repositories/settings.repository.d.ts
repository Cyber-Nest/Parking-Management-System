export interface SystemSettingsPublic {
    timezone: string;
    language: string;
    date_format: string;
    time_format: string;
    week_starts_on: string;
    currency: string;
    session_expiry_display: number;
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
    private getDefaultSystemSettings;
    private getDefaultBrandingSettings;
}
export default SettingsRepository;
//# sourceMappingURL=settings.repository.d.ts.map