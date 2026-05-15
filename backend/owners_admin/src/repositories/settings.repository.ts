import { queryRows, execute } from '../config/database';

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

export class SettingsRepository {
    private settingsId = '00000000-0000-0000-0000-000000000001';

    async getSystemSettings(): Promise<SystemSettingsPublic | null> {
        const rows = await queryRows<SystemSettingsPublic>(
            `SELECT timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display,
              tax_rate_percent, service_fee, rounding_rule, prices_include_tax, refund_allowed, refund_approval_required
              FROM system_settings WHERE id = ?`,
            [this.settingsId]
        );
        return rows[0] ?? this.getDefaultSystemSettings();
    }

    async updateSystemSettings(settings: SystemSettingsPublic): Promise<SystemSettingsPublic> {
        const existing = await queryRows<any>('SELECT id FROM system_settings WHERE id = ?', [this.settingsId]);

        const tax = settings.tax_rate_percent ?? 5;
        const fee = settings.service_fee ?? 0;
        const roundRule = settings.rounding_rule ?? 'nearest_cent';
        const pit = settings.prices_include_tax ?? 1;
        const ra = settings.refund_allowed ?? 1;
        const rar = settings.refund_approval_required ?? 1;

        if (existing.length === 0) {
            await execute(
                `INSERT INTO system_settings (id, timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display,
                 tax_rate_percent, service_fee, rounding_rule, prices_include_tax, refund_allowed, refund_approval_required)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
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
                ]
            );
        } else {
            await execute(
                `UPDATE system_settings SET timezone = ?, language = ?, date_format = ?, time_format = ?, week_starts_on = ?, currency = ?, session_expiry_display = ?,
                 tax_rate_percent = ?, service_fee = ?, rounding_rule = ?, prices_include_tax = ?, refund_allowed = ?, refund_approval_required = ? WHERE id = ?`,
                [
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
                ]
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

    async getTaxPricing(): Promise<{
        tax_rate_percent: number;
        currency: string;
        service_fee: number;
        rounding_rule: string;
        prices_include_tax: number;
        refund_allowed: number;
        refund_approval_required: number;
    }> {
        const row = (await this.getSystemSettings()) as SystemSettingsPublic & Record<string, unknown>;
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

    async updateTaxPricing(patch: {
        tax_rate_percent?: number;
        service_fee?: number;
        rounding_rule?: string;
        prices_include_tax?: number;
        refund_allowed?: number;
        refund_approval_required?: number;
    }): Promise<void> {
        const current = (await this.getSystemSettings()) as SystemSettingsPublic & Record<string, unknown>;
        const merged = { ...current, ...patch } as SystemSettingsPublic;
        await this.updateSystemSettings(merged);
    }

    async listAdmins(): Promise<
        {
            id: string;
            email: string;
            full_name: string;
            role_name: string;
            is_active: number;
            last_login_at: Date | null;
            created_at: Date;
        }[]
    > {
        return queryRows(
            `SELECT a.id, a.email, a.full_name, r.name AS role_name, a.is_active, a.last_login_at, a.created_at
       FROM admins a
       JOIN roles r ON r.id = a.role_id
       ORDER BY a.created_at DESC`
        );
    }

    async findRoleIdByName(name: string): Promise<string | null> {
        const rows = await queryRows<{ id: string }>(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [name]);
        return rows[0]?.id ?? null;
    }

    async updateAdmin(
        id: string,
        patch: { full_name?: string; email?: string; role_id?: string; is_active?: number }
    ): Promise<number> {
        const updates: string[] = [];
        const values: any[] = [];
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
        if (!updates.length) return 0;
        values.push(id);
        const result = await execute(`UPDATE admins SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
        return result.affectedRows;
    }

    async listAdminsPaginated(params: {
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
    }> {
        const offset = (params.page - 1) * params.limit;
        const q = params.q?.trim();
        let whereClause = '1=1';
        const filterValues: unknown[] = [];
        if (q) {
            whereClause += ' AND (a.email LIKE ? OR a.full_name LIKE ?)';
            filterValues.push(`%${q}%`, `%${q}%`);
        }
        const countRows = await queryRows<{ c: number }>(
            `SELECT COUNT(*) AS c FROM admins a WHERE ${whereClause}`,
            filterValues
        );
        const total = Number(countRows[0]?.c ?? 0);
        const items = await queryRows<{
            id: string;
            email: string;
            full_name: string;
            role_id: string;
            role_name: string;
            is_active: number;
            last_login_at: Date | null;
            created_at: Date;
            updated_at: Date;
        }>(
            `SELECT a.id, a.email, a.full_name, a.role_id, r.name AS role_name, a.is_active, a.last_login_at, a.created_at, a.updated_at
       FROM admins a
       JOIN roles r ON r.id = a.role_id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
            [...filterValues, params.limit, offset]
        );
        return { items, total };
    }

    async countAdmins(): Promise<number> {
        const rows = await queryRows<{ c: number }>('SELECT COUNT(*) AS c FROM admins');
        return Number(rows[0]?.c ?? 0);
    }

    async deleteAdmin(id: string): Promise<number> {
        const result = await execute('DELETE FROM admins WHERE id = ?', [id]);
        return result.affectedRows;
    }

    async listRolesWithPermissions(): Promise<{ id: string; name: string; permissions: string | null }[]> {
        return queryRows(
            `SELECT r.id, r.name, p.permissions
       FROM roles r
       LEFT JOIN admin_roles_permissions p ON p.role_id = r.id`
        );
    }

    async upsertRolePermissions(roleId: string, permissionsJson: string): Promise<void> {
        const existing = await queryRows<{ id: string }>(
            `SELECT id FROM admin_roles_permissions WHERE role_id = ? LIMIT 1`,
            [roleId]
        );
        if (existing.length === 0) {
            await execute(`INSERT INTO admin_roles_permissions (id, role_id, permissions) VALUES (UUID(), ?, ?)`, [
                roleId,
                permissionsJson,
            ]);
        } else {
            await execute(`UPDATE admin_roles_permissions SET permissions = ?, updated_at = NOW() WHERE role_id = ?`, [
                permissionsJson,
                roleId,
            ]);
        }
    }

    async listRolesPaginated(params: {
        page: number;
        limit: number;
        q?: string;
    }): Promise<{
        items: { id: string; name: string; permissions: string | null; created_at: Date | null; updated_at: Date | null }[];
        total: number;
    }> {
        const offset = (params.page - 1) * params.limit;
        const q = params.q?.trim();
        let where = '1=1';
        const filterVals: unknown[] = [];
        if (q) {
            where += ' AND r.name LIKE ?';
            filterVals.push(`%${q}%`);
        }
        const countRows = await queryRows<{ c: number }>(
            `SELECT COUNT(*) AS c FROM roles r WHERE ${where}`,
            filterVals
        );
        const total = Number(countRows[0]?.c ?? 0);

        const items = await queryRows<{
            id: string;
            name: string;
            permissions: string | null;
        }>(
            `SELECT r.id, r.name, p.permissions
       FROM roles r
       LEFT JOIN admin_roles_permissions p ON p.role_id = r.id
       WHERE ${where}
       ORDER BY r.name ASC
       LIMIT ? OFFSET ?`,
            [...filterVals, params.limit, offset]
        );
        return {
            items: items.map((row) => ({
                ...row,
                created_at: null as Date | null,
                updated_at: null as Date | null,
            })),
            total,
        };
    }

    async findRoleById(id: string): Promise<{ id: string; name: string } | null> {
        const rows = await queryRows<{ id: string; name: string }>(`SELECT id, name FROM roles WHERE id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    }

    async insertRoleRow(id: string, name: string): Promise<void> {
        await execute(`INSERT INTO roles (id, name) VALUES (?, ?)`, [id, name]);
    }

    async updateRoleName(id: string, name: string): Promise<number> {
        const result = await execute(`UPDATE roles SET name = ? WHERE id = ?`, [name, id]);
        return result.affectedRows;
    }

    async countAdminsByRoleId(roleId: string): Promise<number> {
        const rows = await queryRows<{ c: number }>(`SELECT COUNT(*) AS c FROM admins WHERE role_id = ?`, [roleId]);
        return Number(rows[0]?.c ?? 0);
    }

    async deleteRolePermissions(roleId: string): Promise<void> {
        await execute(`DELETE FROM admin_roles_permissions WHERE role_id = ?`, [roleId]);
    }

    async deleteRoleRow(id: string): Promise<number> {
        const result = await execute(`DELETE FROM roles WHERE id = ?`, [id]);
        return result.affectedRows;
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
            tax_rate_percent: 5,
            service_fee: 0,
            rounding_rule: 'nearest_cent',
            prices_include_tax: 1,
            refund_allowed: 1,
            refund_approval_required: 1,
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
