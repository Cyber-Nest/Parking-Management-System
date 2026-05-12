import { SystemSettingsPublic, BrandingSettingsPublic } from '../repositories/settings.repository';
export declare class SettingsService {
    getSystemSettings(): Promise<SystemSettingsPublic>;
    updateSystemSettings(settings: SystemSettingsPublic): Promise<SystemSettingsPublic>;
    getBrandingSettings(): Promise<BrandingSettingsPublic>;
    updateBrandingSettings(settings: BrandingSettingsPublic): Promise<BrandingSettingsPublic>;
}
export default SettingsService;
//# sourceMappingURL=settings.service.d.ts.map