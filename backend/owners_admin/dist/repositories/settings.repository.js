"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const database_1 = require("../config/database");
class SettingsRepository {
    constructor() {
        this.settingsId = '00000000-0000-0000-0000-000000000001';
    }
    async getSystemSettings() {
        const rows = await (0, database_1.queryRows)('SELECT timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display FROM system_settings WHERE id = ?', [this.settingsId]);
        return rows[0] ?? this.getDefaultSystemSettings();
    }
    async updateSystemSettings(settings) {
        const existing = await (0, database_1.queryRows)('SELECT id FROM system_settings WHERE id = ?', [this.settingsId]);
        if (existing.length === 0) {
            await (0, database_1.execute)('INSERT INTO system_settings (id, timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [this.settingsId, settings.timezone, settings.language, settings.date_format, settings.time_format, settings.week_starts_on, settings.currency, settings.session_expiry_display]);
        }
        else {
            await (0, database_1.execute)('UPDATE system_settings SET timezone = ?, language = ?, date_format = ?, time_format = ?, week_starts_on = ?, currency = ?, session_expiry_display = ? WHERE id = ?', [settings.timezone, settings.language, settings.date_format, settings.time_format, settings.week_starts_on, settings.currency, settings.session_expiry_display, this.settingsId]);
        }
        return settings;
    }
    async getBrandingSettings() {
        const rows = await (0, database_1.queryRows)('SELECT system_name, theme_color, dark_mode, logo_url, favicon_url, sidebar_collapsed FROM branding_settings WHERE id = ?', [this.settingsId]);
        return rows[0] ?? this.getDefaultBrandingSettings();
    }
    async updateBrandingSettings(settings) {
        const existing = await (0, database_1.queryRows)('SELECT id FROM branding_settings WHERE id = ?', [this.settingsId]);
        if (existing.length === 0) {
            await (0, database_1.execute)('INSERT INTO branding_settings (id, system_name, theme_color, dark_mode, logo_url, favicon_url, sidebar_collapsed) VALUES (?, ?, ?, ?, ?, ?, ?)', [this.settingsId, settings.system_name, settings.theme_color, settings.dark_mode, settings.logo_url ?? null, settings.favicon_url ?? null, settings.sidebar_collapsed ? 1 : 0]);
        }
        else {
            await (0, database_1.execute)('UPDATE branding_settings SET system_name = ?, theme_color = ?, dark_mode = ?, logo_url = ?, favicon_url = ?, sidebar_collapsed = ? WHERE id = ?', [settings.system_name, settings.theme_color, settings.dark_mode, settings.logo_url ?? null, settings.favicon_url ?? null, settings.sidebar_collapsed ? 1 : 0, this.settingsId]);
        }
        return settings;
    }
    getDefaultSystemSettings() {
        return {
            timezone: 'UTC',
            language: 'en',
            date_format: 'MM/DD/YYYY',
            time_format: '12h',
            week_starts_on: 'sunday',
            currency: 'USD',
            session_expiry_display: 30,
        };
    }
    getDefaultBrandingSettings() {
        return {
            system_name: 'ParkSmart',
            theme_color: '#0F766E',
            dark_mode: 'system',
            logo_url: null,
            favicon_url: null,
            sidebar_collapsed: false,
        };
    }
}
exports.SettingsRepository = SettingsRepository;
exports.default = SettingsRepository;
//# sourceMappingURL=settings.repository.js.map