import { getMongoDatabase } from '../config/mongodb';

type SettingsDocument = { _id: string; [key: string]: unknown };

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
        try {
            const settings = await getMongoDatabase().collection<SettingsDocument & SystemSettingsPublic>('system_settings').findOne({ _id: this.settingsId });
            if (!settings) return this.getDefaultSystemSettings();
            const { _id, ...fields } = settings;
            return fields;
        } catch (err) {
            console.error('[SettingsRepository] getSystemSettings DB error:', (err as Error).message);
            return this.getDefaultSystemSettings();
        }
    }

    async updateSystemSettings(settings: SystemSettingsPublic): Promise<SystemSettingsPublic> {
        const tax = settings.tax_rate_percent ?? 5;
        const fee = settings.service_fee ?? 0;
        const roundRule = settings.rounding_rule ?? 'nearest_cent';
        const pit = settings.prices_include_tax ?? 1;
        const ra = settings.refund_allowed ?? 1;
        const rar = settings.refund_approval_required ?? 1;

        const now = new Date();
        await getMongoDatabase().collection<SettingsDocument>('system_settings').updateOne(
            { _id: this.settingsId },
            { $set: { ...settings, tax_rate_percent: tax, service_fee: fee, rounding_rule: roundRule, prices_include_tax: pit, refund_allowed: ra, refund_approval_required: rar, updated_at: now }, $setOnInsert: { created_at: now } },
            { upsert: true },
        );

        return settings;
    }

    async getBrandingSettings(): Promise<BrandingSettingsPublic | null> {
        try {
            const settings = await getMongoDatabase().collection<SettingsDocument & BrandingSettingsPublic>('branding_settings').findOne({ _id: this.settingsId });
            if (!settings) return this.getDefaultBrandingSettings();
            const { _id, ...fields } = settings;
            return fields;
        } catch (err) {
            console.error('[SettingsRepository] getBrandingSettings DB error:', (err as Error).message);
            return this.getDefaultBrandingSettings();
        }
    }

    async updateBrandingSettings(settings: BrandingSettingsPublic): Promise<BrandingSettingsPublic> {
        const now = new Date();
        await getMongoDatabase().collection<SettingsDocument>('branding_settings').updateOne(
            { _id: this.settingsId },
            { $set: { ...settings, logo_url: settings.logo_url ?? null, favicon_url: settings.favicon_url ?? null, sidebar_collapsed: Boolean(settings.sidebar_collapsed), updated_at: now }, $setOnInsert: { created_at: now } },
            { upsert: true },
        );

        return settings;
    }

    async getTaxPricing(parkingLotId?: string): Promise<{
        tax_rate_percent: number;
        currency: string;
        service_fee: number;
        rounding_rule: string;
        prices_include_tax: number;
        refund_allowed: number;
        refund_approval_required: number;
    }> {
        try {
            if (parkingLotId) {
                const row = await getMongoDatabase().collection<SettingsDocument>('system_settings').findOne({ parking_lot_id: parkingLotId });
                if (row) {
                    return {
                        tax_rate_percent: Number(row.tax_rate_percent ?? 5),
                        currency: String(row.currency || 'CAD'),
                        service_fee: Number(row.service_fee ?? 0),
                        rounding_rule: String(row.rounding_rule ?? 'nearest_cent'),
                        prices_include_tax: Number(row.prices_include_tax ?? 1),
                        refund_allowed: Number(row.refund_allowed ?? 1),
                        refund_approval_required: Number(row.refund_approval_required ?? 1),
                    };
                }
            }
            // Fall back to global settings
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
        } catch (err) {
            console.error('[SettingsRepository] getTaxPricing error:', (err as Error).message);
            // Return defaults on error
            return {
                tax_rate_percent: 5,
                currency: 'CAD',
                service_fee: 0,
                rounding_rule: 'nearest_cent',
                prices_include_tax: 1,
                refund_allowed: 1,
                refund_approval_required: 1,
            };
        }
    }

    async updateTaxPricing(patch: {
        tax_rate_percent?: number;
        service_fee?: number;
        rounding_rule?: string;
        prices_include_tax?: number;
        refund_allowed?: number;
        refund_approval_required?: number;
    }, parkingLotId?: string): Promise<void> {
        if (parkingLotId) {
            const defaults = await this.getTaxPricing();
            const now = new Date();
            const set: Record<string, unknown> = { updated_at: now };
            for (const key of ["tax_rate_percent", "service_fee", "rounding_rule", "prices_include_tax", "refund_allowed", "refund_approval_required"] as const) {
                if (patch[key] !== undefined) set[key] = patch[key];
            }
            await getMongoDatabase().collection<SettingsDocument>('system_settings').updateOne(
                { parking_lot_id: parkingLotId },
                {
                    $set: set,
                    $setOnInsert: {
                        _id: `${parkingLotId}-${Date.now()}`, parking_lot_id: parkingLotId,
                        timezone: "UTC", language: "en", date_format: "YYYY-MM-DD", time_format: "24h",
                        week_starts_on: "monday", currency: defaults.currency, session_expiry_display: 3600,
                        tax_rate_percent: patch.tax_rate_percent ?? defaults.tax_rate_percent,
                        service_fee: patch.service_fee ?? defaults.service_fee,
                        rounding_rule: patch.rounding_rule ?? defaults.rounding_rule,
                        prices_include_tax: patch.prices_include_tax ?? defaults.prices_include_tax,
                        refund_allowed: patch.refund_allowed ?? defaults.refund_allowed,
                        refund_approval_required: patch.refund_approval_required ?? defaults.refund_approval_required,
                        created_at: now,
                    },
                },
                { upsert: true },
            );
        } else {
            // Update global settings
            const current = (await this.getSystemSettings()) as SystemSettingsPublic & Record<string, unknown>;
            const merged = { ...current, ...patch } as SystemSettingsPublic;
            await this.updateSystemSettings(merged);
        }
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
        const db = getMongoDatabase();
        const [admins, roles] = await Promise.all([
            db.collection<{ _id: string; email: string; full_name: string; role_id: string; is_active: boolean; last_login_at: Date | null; created_at: Date }>('admins').find().sort({ created_at: -1, _id: 1 }).toArray(),
            db.collection<{ _id: string; name: string }>('roles').find().toArray(),
        ]);
        const roleNames = new Map(roles.map((role) => [role._id, role.name]));
        return admins.flatMap((admin) => {
            const role_name = roleNames.get(admin.role_id);
            return role_name ? [{ id: admin._id, email: admin.email, full_name: admin.full_name, role_name, is_active: admin.is_active ? 1 : 0, last_login_at: admin.last_login_at, created_at: admin.created_at }] : [];
        });
    }

    async findRoleIdByName(name: string): Promise<string | null> {
        const role = await getMongoDatabase().collection<{ _id: string; name: string }>('roles').findOne({ name });
        return role?._id ?? null;
    }

    async updateAdmin(
        id: string,
        patch: { full_name?: string; email?: string; role_id?: string; is_active?: number }
    ): Promise<number> {
        const fields: Record<string, unknown> = {};
        if (patch.full_name !== undefined) fields.full_name = patch.full_name;
        if (patch.email !== undefined) fields.email = patch.email.toLowerCase().trim();
        if (patch.role_id !== undefined) fields.role_id = patch.role_id;
        if (patch.is_active !== undefined) fields.is_active = Boolean(patch.is_active);
        if (!Object.keys(fields).length) return 0;
        fields.updated_at = new Date();
        return (await getMongoDatabase().collection<{ _id: string } & Record<string, unknown>>('admins').updateOne({ _id: id }, { $set: fields })).matchedCount;
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
        const db = getMongoDatabase();
        const q = params.q?.trim();
        const escaped = q?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const filter = escaped ? { $or: [{ email: { $regex: escaped, $options: 'i' } }, { full_name: { $regex: escaped, $options: 'i' } }] } : {};
        const [admins, roles, total] = await Promise.all([
            db.collection<{ _id: string; email: string; full_name: string; role_id: string; is_active: boolean; last_login_at: Date | null; created_at: Date; updated_at: Date }>('admins').find(filter).sort({ created_at: -1, _id: 1 }).skip((params.page - 1) * params.limit).limit(params.limit).toArray(),
            db.collection<{ _id: string; name: string }>('roles').find().toArray(),
            db.collection('admins').countDocuments(filter),
        ]);
        const roleNames = new Map(roles.map((role) => [role._id, role.name]));
        const items = admins.flatMap((admin) => {
            const role_name = roleNames.get(admin.role_id);
            return role_name ? [{ id: admin._id, email: admin.email, full_name: admin.full_name, role_id: admin.role_id, role_name, is_active: admin.is_active ? 1 : 0, last_login_at: admin.last_login_at, created_at: admin.created_at, updated_at: admin.updated_at }] : [];
        });
        return { items, total };
    }

    async countAdmins(): Promise<number> {
        return getMongoDatabase().collection('admins').countDocuments();
    }

    async deleteAdmin(id: string): Promise<number> {
        return (await getMongoDatabase().collection<{ _id: string }>('admins').deleteOne({ _id: id })).deletedCount;
    }

    async listRolesWithPermissions(): Promise<{ id: string; name: string; permissions: string | null }[]> {
        const db = getMongoDatabase();
        const roles = await db.collection<{ _id: string; name: string }>('roles').find().toArray();
        const permissions = await db.collection<{ role_id: string; permissions: string }>('admin_roles_permissions')
            .find({ role_id: { $in: roles.map((role) => role._id) } }).toArray();
        const byRole = new Map(permissions.map((item) => [item.role_id, item.permissions]));
        return roles.map((role) => ({ id: role._id, name: role.name, permissions: byRole.get(role._id) ?? null }));
    }

    async upsertRolePermissions(roleId: string, permissionsJson: string): Promise<void> {
        const now = new Date();
        const collection = getMongoDatabase().collection<{ _id: string; role_id: string; permissions: string; created_at: Date; updated_at: Date }>('admin_roles_permissions');
        const updated = await collection.updateMany({ role_id: roleId }, { $set: { permissions: permissionsJson, updated_at: now } });
        if (updated.matchedCount === 0) {
            await collection.insertOne({ _id: crypto.randomUUID(), role_id: roleId, permissions: permissionsJson, created_at: now, updated_at: now });
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
        const db = getMongoDatabase();
        const q = params.q?.trim();
        const escaped = q?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const filter = escaped ? { name: { $regex: escaped, $options: 'i' } } : {};
        const total = await db.collection('roles').countDocuments(filter);
        const roles = await db.collection<{ _id: string; name: string; created_at?: Date; updated_at?: Date }>('roles')
            .find(filter).sort({ name: 1 }).skip((params.page - 1) * params.limit).limit(params.limit).toArray();
        const permissions = await db.collection<{ role_id: string; permissions: string }>('admin_roles_permissions')
            .find({ role_id: { $in: roles.map((role) => role._id) } }).toArray();
        const byRole = new Map(permissions.map((item) => [item.role_id, item.permissions]));
        const items = roles.map((role) => ({ id: role._id, name: role.name, permissions: byRole.get(role._id) ?? null, created_at: role.created_at ?? null, updated_at: role.updated_at ?? null }));
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
        const role = await getMongoDatabase().collection<{ _id: string; name: string }>('roles').findOne({ _id: id });
        return role ? { id: role._id, name: role.name } : null;
    }

    async insertRoleRow(id: string, name: string): Promise<void> {
        const now = new Date();
        await getMongoDatabase().collection<{ _id: string; name: string; created_at: Date; updated_at: Date }>('roles').insertOne({ _id: id, name, created_at: now, updated_at: now });
    }

    async updateRoleName(id: string, name: string): Promise<number> {
        const result = await getMongoDatabase().collection<{ _id: string; name: string; updated_at?: Date }>('roles').updateOne({ _id: id }, { $set: { name, updated_at: new Date() } });
        return result.matchedCount;
    }

    async countAdminsByRoleId(roleId: string): Promise<number> {
        return getMongoDatabase().collection('admins').countDocuments({ role_id: roleId });
    }

    async deleteRolePermissions(roleId: string): Promise<void> {
        await getMongoDatabase().collection('admin_roles_permissions').deleteMany({ role_id: roleId });
    }

    async deleteRoleRow(id: string): Promise<number> {
        const result = await getMongoDatabase().collection<{ _id: string }>('roles').deleteOne({ _id: id });
        return result.deletedCount;
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
