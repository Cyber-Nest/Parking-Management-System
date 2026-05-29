"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const database_1 = require("../config/database");
class SettingsRepository {
    constructor() {
        this.settingsId = '00000000-0000-0000-0000-000000000001';
    }
    async getSystemSettings() {
        const rows = await (0, database_1.queryRows)(`SELECT timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display,
              tax_rate_percent, service_fee, rounding_rule, prices_include_tax, refund_allowed, refund_approval_required
              FROM system_settings WHERE id = ?`, [this.settingsId]);
        return rows[0] ?? this.getDefaultSystemSettings();
    }
    async updateSystemSettings(settings) {
        const existing = await (0, database_1.queryRows)('SELECT id FROM system_settings WHERE id = ?', [this.settingsId]);
        const tax = settings.tax_rate_percent ?? 5;
        const fee = settings.service_fee ?? 0;
        const roundRule = settings.rounding_rule ?? 'nearest_cent';
        const pit = settings.prices_include_tax ?? 1;
        const ra = settings.refund_allowed ?? 1;
        const rar = settings.refund_approval_required ?? 1;
        if (existing.length === 0) {
            await (0, database_1.execute)(`INSERT INTO system_settings (id, timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display,
                 tax_rate_percent, service_fee, rounding_rule, prices_include_tax, refund_allowed, refund_approval_required)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                this.settingsId,
                settings.timezone,
                settings.language,
                settings.date_format,
                settings.time_format,
                settings.week_starts_on,
                settings.currency,
                settings.session_expiry_display,
                tax,
                fee,
                roundRule,
                pit,
                ra,
                rar,
            ]);
        }
        else {
            await (0, database_1.execute)(`UPDATE system_settings SET timezone = ?, language = ?, date_format = ?, time_format = ?, week_starts_on = ?, currency = ?, session_expiry_display = ?,
                 tax_rate_percent = ?, service_fee = ?, rounding_rule = ?, prices_include_tax = ?, refund_allowed = ?, refund_approval_required = ? WHERE id = ?`, [
                settings.timezone,
                settings.language,
                settings.date_format,
                settings.time_format,
                settings.week_starts_on,
                settings.currency,
                settings.session_expiry_display,
                tax,
                fee,
                roundRule,
                pit,
                ra,
                rar,
                this.settingsId,
            ]);
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
    async getTaxPricing() {
        const row = (await this.getSystemSettings());
        return {
            tax_rate_percent: Number(row.tax_rate_percent ?? 5),
            currency: row.currency,
            service_fee: Number(row.service_fee ?? 0),
            rounding_rule: String(row.rounding_rule ?? 'nearest_cent'),
            prices_include_tax: Number(row.prices_include_tax ?? 1),
            refund_allowed: Number(row.refund_allowed ?? 1),
            refund_approval_required: Number(row.refund_approval_required ?? 1),
        };
    }
    async updateTaxPricing(patch) {
        const current = (await this.getSystemSettings());
        const merged = { ...current, ...patch };
        await this.updateSystemSettings(merged);
    }
    async listAdmins() {
        return (0, database_1.queryRows)(`SELECT a.id, a.email, a.full_name, r.name AS role_name, a.is_active, a.last_login_at, a.created_at
       FROM admins a
       JOIN roles r ON r.id = a.role_id
       ORDER BY a.created_at DESC`);
    }
    async findRoleIdByName(name) {
        const rows = await (0, database_1.queryRows)(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [name]);
        return rows[0]?.id ?? null;
    }
    async updateAdmin(id, patch) {
        const updates = [];
        const values = [];
        if (patch.full_name !== undefined) {
            updates.push('full_name = ?');
            values.push(patch.full_name);
        }
        if (patch.email !== undefined) {
            updates.push('email = ?');
            values.push(patch.email.toLowerCase().trim());
        }
        if (patch.role_id !== undefined) {
            updates.push('role_id = ?');
            values.push(patch.role_id);
        }
        if (patch.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(patch.is_active);
        }
        if (!updates.length)
            return 0;
        values.push(id);
        const result = await (0, database_1.execute)(`UPDATE admins SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
        return result.affectedRows;
    }
    async listAdminsPaginated(params) {
        const offset = (params.page - 1) * params.limit;
        const q = params.q?.trim();
        let whereClause = '1=1';
        const filterValues = [];
        if (q) {
            whereClause += ' AND (a.email LIKE ? OR a.full_name LIKE ?)';
            filterValues.push(`%${q}%`, `%${q}%`);
        }
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS c FROM admins a WHERE ${whereClause}`, filterValues);
        const total = Number(countRows[0]?.c ?? 0);
        const items = await (0, database_1.queryRows)(`SELECT a.id, a.email, a.full_name, a.role_id, r.name AS role_name, a.is_active, a.last_login_at, a.created_at, a.updated_at
       FROM admins a
       JOIN roles r ON r.id = a.role_id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`, [...filterValues, params.limit, offset]);
        return { items, total };
    }
    async countAdmins() {
        const rows = await (0, database_1.queryRows)('SELECT COUNT(*) AS c FROM admins');
        return Number(rows[0]?.c ?? 0);
    }
    async deleteAdmin(id) {
        const result = await (0, database_1.execute)('DELETE FROM admins WHERE id = ?', [id]);
        return result.affectedRows;
    }
    async listRolesWithPermissions() {
        return (0, database_1.queryRows)(`SELECT r.id, r.name, p.permissions
       FROM roles r
       LEFT JOIN admin_roles_permissions p ON p.role_id = r.id`);
    }
    async upsertRolePermissions(roleId, permissionsJson) {
        const existing = await (0, database_1.queryRows)(`SELECT id FROM admin_roles_permissions WHERE role_id = ? LIMIT 1`, [roleId]);
        if (existing.length === 0) {
            await (0, database_1.execute)(`INSERT INTO admin_roles_permissions (id, role_id, permissions) VALUES (UUID(), ?, ?)`, [
                roleId,
                permissionsJson,
            ]);
        }
        else {
            await (0, database_1.execute)(`UPDATE admin_roles_permissions SET permissions = ?, updated_at = NOW() WHERE role_id = ?`, [
                permissionsJson,
                roleId,
            ]);
        }
    }
    async listRolesPaginated(params) {
        const offset = (params.page - 1) * params.limit;
        const q = params.q?.trim();
        let where = '1=1';
        const filterVals = [];
        if (q) {
            where += ' AND r.name LIKE ?';
            filterVals.push(`%${q}%`);
        }
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS c FROM roles r WHERE ${where}`, filterVals);
        const total = Number(countRows[0]?.c ?? 0);
        const items = await (0, database_1.queryRows)(`SELECT r.id, r.name, p.permissions
       FROM roles r
       LEFT JOIN admin_roles_permissions p ON p.role_id = r.id
       WHERE ${where}
       ORDER BY r.name ASC
       LIMIT ? OFFSET ?`, [...filterVals, params.limit, offset]);
        return {
            items: items.map((row) => ({
                ...row,
                created_at: null,
                updated_at: null,
            })),
            total,
        };
    }
    async findRoleById(id) {
        const rows = await (0, database_1.queryRows)(`SELECT id, name FROM roles WHERE id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    }
    async insertRoleRow(id, name) {
        await (0, database_1.execute)(`INSERT INTO roles (id, name) VALUES (?, ?)`, [id, name]);
    }
    async updateRoleName(id, name) {
        const result = await (0, database_1.execute)(`UPDATE roles SET name = ? WHERE id = ?`, [name, id]);
        return result.affectedRows;
    }
    async countAdminsByRoleId(roleId) {
        const rows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS c FROM admins WHERE role_id = ?`, [roleId]);
        return Number(rows[0]?.c ?? 0);
    }
    async deleteRolePermissions(roleId) {
        await (0, database_1.execute)(`DELETE FROM admin_roles_permissions WHERE role_id = ?`, [roleId]);
    }
    async deleteRoleRow(id) {
        const result = await (0, database_1.execute)(`DELETE FROM roles WHERE id = ?`, [id]);
        return result.affectedRows;
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
            tax_rate_percent: 5,
            service_fee: 0,
            rounding_rule: 'nearest_cent',
            prices_include_tax: 1,
            refund_allowed: 1,
            refund_approval_required: 1,
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