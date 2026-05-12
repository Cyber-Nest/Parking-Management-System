"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const settings_repository_1 = require("../repositories/settings.repository");
const repository = new settings_repository_1.SettingsRepository();
class SettingsService {
    async getSystemSettings() {
        return repository.getSystemSettings();
    }
    async updateSystemSettings(settings) {
        return repository.updateSystemSettings(settings);
    }
    async getBrandingSettings() {
        return repository.getBrandingSettings();
    }
    async updateBrandingSettings(settings) {
        return repository.updateBrandingSettings(settings);
    }
}
exports.SettingsService = SettingsService;
exports.default = SettingsService;
//# sourceMappingURL=settings.service.js.map