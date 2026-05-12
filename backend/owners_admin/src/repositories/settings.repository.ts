import { queryRows, execute } from '../config/database';

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

export class SettingsRepository {
    private settingsId = '00000000-0000-0000-0000-000000000001';

    async getSystemSettings(): Promise<SystemSettingsPublic | null> {
        const rows = await queryRows<SystemSettingsPublic>(
            'SELECT timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display FROM system_settings WHERE id = ?',
            [this.settingsId]
        );
        return rows[0] ?? this.getDefaultSystemSettings();
    }

    async updateSystemSettings(settings: SystemSettingsPublic): Promise<SystemSettingsPublic> {
        const existing = await queryRows<any>('SELECT id FROM system_settings WHERE id = ?', [this.settingsId]);

        if (existing.length === 0) {
            await execute(
                'INSERT INTO system_settings (id, timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [this.settingsId, settings.timezone, settings.language, settings.date_format, settings.time_format, settings.week_starts_on, settings.currency, settings.session_expiry_display]
            );
        } else {
            await execute(
                'UPDATE system_settings SET timezone = ?, language = ?, date_format = ?, time_format = ?, week_starts_on = ?, currency = ?, session_expiry_display = ? WHERE id = ?',
                [settings.timezone, settings.language, settings.date_format, settings.time_format, settings.week_starts_on, settings.currency, settings.session_expiry_display, this.settingsId]
            );
        }

        return settings;
    }

    async getBrandingSettings(): Promise<BrandingSettingsPublic | null> {
        const rows = await queryRows<BrandingSettingsPublic>(
            'SELECT system_name, theme_color, dark_mode, logo_url, favicon_url, sidebar_collapsed FROM branding_settings WHERE id = ?',
            [this.settingsId]
        );
        return rows[0] ?? this.getDefaultBrandingSettings();
    }

    async updateBrandingSettings(settings: BrandingSettingsPublic): Promise<BrandingSettingsPublic> {
        const existing = await queryRows<any>('SELECT id FROM branding_settings WHERE id = ?', [this.settingsId]);

        if (existing.length === 0) {
            await execute(
                'INSERT INTO branding_settings (id, system_name, theme_color, dark_mode, logo_url, favicon_url, sidebar_collapsed) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [this.settingsId, settings.system_name, settings.theme_color, settings.dark_mode, settings.logo_url ?? null, settings.favicon_url ?? null, settings.sidebar_collapsed ? 1 : 0]
            );
        } else {
            await execute(
                'UPDATE branding_settings SET system_name = ?, theme_color = ?, dark_mode = ?, logo_url = ?, favicon_url = ?, sidebar_collapsed = ? WHERE id = ?',
                [settings.system_name, settings.theme_color, settings.dark_mode, settings.logo_url ?? null, settings.favicon_url ?? null, settings.sidebar_collapsed ? 1 : 0, this.settingsId]
            );
        }

        return settings;
    }

    private getDefaultSystemSettings(): SystemSettingsPublic {
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

    private getDefaultBrandingSettings(): BrandingSettingsPublic {
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

export default SettingsRepository;
