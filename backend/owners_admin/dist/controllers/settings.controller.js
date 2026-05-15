"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRolePermissions = exports.listRoles = exports.updateAdminUser = exports.createAdminUser = exports.listAdminUsers = exports.updateTaxPricing = exports.getTaxPricing = exports.updateBrandingSettings = exports.getBrandingSettings = exports.updateSystemSettings = exports.getSystemSettings = void 0;
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
const mapTaxToFrontend = (t) => ({
    taxRate: String(t.tax_rate_percent),
    currency: t.currency,
    roundingRule: t.rounding_rule,
    pricesIncludeTax: t.prices_include_tax ? 'yes' : 'no',
    refundAllowed: t.refund_allowed ? 'yes' : 'no',
    refundApprovalRequired: t.refund_approval_required ? 'yes' : 'no',
});
const getTaxPricing = async (_req, res) => {
    try {
        const t = await settingsService.getTaxPricing();
        res.status(200).json({ success: true, message: 'Tax settings fetched', data: mapTaxToFrontend(t) });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getTaxPricing = getTaxPricing;
const updateTaxPricing = async (req, res) => {
    try {
        const b = req.body;
        await settingsService.updateTaxPricing({
            tax_rate_percent: Number(b.taxRate ?? b.tax_rate_percent ?? 0),
            service_fee: Number(b.serviceFee ?? b.service_fee ?? 0),
            rounding_rule: String(b.roundingRule ?? b.rounding_rule ?? 'nearest_cent'),
            prices_include_tax: (b.pricesIncludeTax ?? b.prices_include_tax) === 'yes' || b.prices_include_tax === 1 ? 1 : 0,
            refund_allowed: (b.refundAllowed ?? b.refund_allowed) === 'yes' || b.refund_allowed === 1 ? 1 : 0,
            refund_approval_required: (b.refundApprovalRequired ?? b.refund_approval_required) === 'yes' || b.refund_approval_required === 1 ? 1 : 0,
        });
        const t = await settingsService.getTaxPricing();
        res.status(200).json({ success: true, message: 'Tax settings updated', data: mapTaxToFrontend(t) });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateTaxPricing = updateTaxPricing;
const mapRoleLabel = (roleName) => {
    if (roleName === 'owner')
        return 'Admin';
    if (roleName === 'inspector')
        return 'Inspector';
    return roleName;
};
const listAdminUsers = async (_req, res) => {
    try {
        const rows = await settingsService.listAdmins();
        const users = rows.map((r) => ({
            id: r.id,
            name: r.full_name,
            email: r.email,
            role: mapRoleLabel(r.role_name),
            status: r.is_active ? 'active' : 'inactive',
            lastLogin: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
        }));
        res.status(200).json({ success: true, message: 'Users fetched', data: users });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listAdminUsers = listAdminUsers;
const createAdminUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        if (!name?.trim() || !email?.trim()) {
            res.status(400).json({ success: false, message: 'name and email are required' });
            return;
        }
        const roleName = role === 'Admin' || role === 'owner'
            ? 'owner'
            : role === 'Inspector' || role === 'inspector'
                ? 'inspector'
                : 'user';
        const { id } = await settingsService.createAdmin({
            full_name: name,
            email,
            role_name: roleName,
            password: password ?? 'Admin@123456',
        });
        res.status(201).json({ success: true, message: 'User created', data: { id } });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createAdminUser = createAdminUser;
const updateAdminUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, status } = req.body;
        const patch = {};
        if (name !== undefined)
            patch.full_name = String(name);
        if (status !== undefined)
            patch.is_active = status === 'active' ? 1 : 0;
        if (role !== undefined) {
            const roleName = role === 'Admin' || role === 'owner'
                ? 'owner'
                : role === 'Inspector' || role === 'inspector'
                    ? 'inspector'
                    : 'user';
            const roleId = await settingsService.findRoleIdByName(roleName);
            if (!roleId) {
                res.status(400).json({ success: false, message: 'Invalid role' });
                return;
            }
            patch.role_id = roleId;
        }
        void email;
        const n = await settingsService.updateAdmin(id, patch);
        if (!n) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'User updated' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateAdminUser = updateAdminUser;
const listRoles = async (_req, res) => {
    try {
        const rows = await settingsService.listRolesWithPermissions();
        const roles = rows.map((r) => {
            let permissions = {};
            try {
                permissions = r.permissions ? JSON.parse(r.permissions) : {};
            }
            catch {
                permissions = {};
            }
            return {
                id: r.id,
                name: mapRoleLabel(r.name),
                description: '',
                permissions,
                isDefault: r.name === 'owner',
            };
        });
        res.status(200).json({ success: true, message: 'Roles fetched', data: roles });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listRoles = listRoles;
const updateRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;
        if (!permissions) {
            res.status(400).json({ success: false, message: 'permissions is required' });
            return;
        }
        await settingsService.upsertRolePermissions(id, permissions);
        res.status(200).json({ success: true, message: 'Role permissions updated' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateRolePermissions = updateRolePermissions;
//# sourceMappingURL=settings.controller.js.map