import { SettingsRepository, SystemSettingsPublic, BrandingSettingsPublic } from '../repositories/settings.repository';

const repository = new SettingsRepository();

export class SettingsService {
    async getSystemSettings(): Promise<SystemSettingsPublic> {
        return repository.getSystemSettings() as Promise<SystemSettingsPublic>;
    }

    async updateSystemSettings(settings: SystemSettingsPublic): Promise<SystemSettingsPublic> {
        return repository.updateSystemSettings(settings);
    }

    async getBrandingSettings(): Promise<BrandingSettingsPublic> {
        return repository.getBrandingSettings() as Promise<BrandingSettingsPublic>;
    }

    async updateBrandingSettings(settings: BrandingSettingsPublic): Promise<BrandingSettingsPublic> {
        return repository.updateBrandingSettings(settings);
    }
}

export default SettingsService;
