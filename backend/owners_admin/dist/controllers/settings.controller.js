"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrandingSettings = exports.getBrandingSettings = exports.updateSystemSettings = exports.getSystemSettings = void 0;
const settings_service_1 = require("../services/settings.service");
const commonErrors_1 = require("../services/commonErrors");
const settingsService = new settings_service_1.SettingsService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[SettingsController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const toCamelSystemSettings = (settings) => ({
    timezone: settings.timezone,
    language: settings.language,
    dateFormat: settings.date_format,
    timeFormat: settings.time_format,
    weekStartsOn: settings.week_starts_on,
    currency: settings.currency,
    sessionExpiryDisplay: String(settings.session_expiry_display),
});
const toSnakeSystemSettings = (body) => ({
    timezone: String(body.timezone ?? '').trim(),
    language: String(body.language ?? '').trim(),
    date_format: String(body.dateFormat ?? '').trim(),
    time_format: String(body.timeFormat ?? '').trim(),
    week_starts_on: String(body.weekStartsOn ?? '').trim(),
    currency: String(body.currency ?? '').trim(),
    session_expiry_display: Number(body.sessionExpiryDisplay),
});
const toCamelBrandingSettings = (settings) => ({
    systemName: settings.system_name,
    themeColor: settings.theme_color,
    darkMode: settings.dark_mode,
    logoUrl: settings.logo_url ?? null,
    faviconUrl: settings.favicon_url ?? null,
    sidebarCollapsed: Boolean(settings.sidebar_collapsed),
});
const toSnakeBrandingSettings = (body) => ({
    system_name: String(body.systemName ?? '').trim(),
    theme_color: String(body.themeColor ?? '').trim(),
    dark_mode: String(body.darkMode ?? '').trim(),
    logo_url: body.logoUrl ?? null,
    favicon_url: body.faviconUrl ?? null,
    sidebar_collapsed: Boolean(body.sidebarCollapsed),
});
const validateSystemSettingsPayload = (body) => {
    const required = [
        'timezone',
        'language',
        'dateFormat',
        'timeFormat',
        'weekStartsOn',
        'currency',
        'sessionExpiryDisplay',
    ];
    for (const key of required) {
        if (typeof body[key] === 'undefined' || body[key] === null || String(body[key]).trim() === '') {
            throw new commonErrors_1.ValidationError(`${key} is required`);
        }
    }
    const expiry = Number(body.sessionExpiryDisplay);
    if (Number.isNaN(expiry) || expiry <= 0) {
        throw new commonErrors_1.ValidationError('sessionExpiryDisplay must be a positive number');
    }
};
const validateBrandingSettingsPayload = (body) => {
    const required = ['systemName', 'themeColor', 'darkMode'];
    for (const key of required) {
        if (typeof body[key] === 'undefined' || body[key] === null || String(body[key]).trim() === '') {
            throw new commonErrors_1.ValidationError(`${key} is required`);
        }
    }
};
const getSystemSettings = async (_req, res) => {
    try {
        const data = await settingsService.getSystemSettings();
        res.status(200).json({ success: true, message: 'System settings fetched', data: toCamelSystemSettings(data) });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getSystemSettings = getSystemSettings;
const updateSystemSettings = async (req, res) => {
    try {
        validateSystemSettingsPayload(req.body);
        const payload = toSnakeSystemSettings(req.body);
        const data = await settingsService.updateSystemSettings(payload);
        res.status(200).json({ success: true, message: 'System settings updated', data: toCamelSystemSettings(data) });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateSystemSettings = updateSystemSettings;
const getBrandingSettings = async (_req, res) => {
    try {
        const data = await settingsService.getBrandingSettings();
        res.status(200).json({ success: true, message: 'Branding settings fetched', data: toCamelBrandingSettings(data) });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getBrandingSettings = getBrandingSettings;
const updateBrandingSettings = async (req, res) => {
    try {
        validateBrandingSettingsPayload(req.body);
        const payload = toSnakeBrandingSettings(req.body);
        const data = await settingsService.updateBrandingSettings(payload);
        res.status(200).json({ success: true, message: 'Branding settings updated', data: toCamelBrandingSettings(data) });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateBrandingSettings = updateBrandingSettings;
//# sourceMappingURL=settings.controller.js.map