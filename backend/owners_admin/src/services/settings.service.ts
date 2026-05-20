import { SettingsRepository, SystemSettingsPublic, BrandingSettingsPublic } from '../repositories/settings.repository';
import { AdminRepository } from '../repositories/admin.repository';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { ValidationError } from './commonErrors';

const repository = new SettingsRepository();
const adminRepo = new AdminRepository();

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

    async getTaxPricing() {
        return repository.getTaxPricing();
    }

    async updateTaxPricing(
        patch: {
            tax_rate_percent?: number;
            service_fee?: number;
            rounding_rule?: string;
            prices_include_tax?: number;
            refund_allowed?: number;
            refund_approval_required?: number;
        }
    ) {
        await repository.updateTaxPricing(patch);
        return repository.getTaxPricing();
    }

    async listAdmins() {
        return repository.listAdmins();
    }

    async updateAdmin(id: string, patch: { full_name?: string; role_id?: string; is_active?: number }) {
        const n = await repository.updateAdmin(id, patch);
        return n;
    }

    async listRolesWithPermissions() {
        return repository.listRolesWithPermissions();
    }

    async upsertRolePermissions(roleId: string, permissions: unknown) {
        await repository.upsertRolePermissions(roleId, JSON.stringify(permissions));
    }

    async findRoleIdByName(name: string) {
        return repository.findRoleIdByName(name);
    }

    async createAdmin(body: { email: string; password: string; full_name: string; role_name: string }) {
        const roleId = await repository.findRoleIdByName(body.role_name);
        if (!roleId) throw new ValidationError('Invalid role name');
        const raw = body.password?.trim() || 'Admin@123456';
        if (raw.length < 8) throw new ValidationError('password must be at least 8 characters');
        const passwordHash = await bcrypt.hash(raw, env.bcryptSaltRounds);
        const id = await adminRepo.insertAdmin({
            email: body.email,
            passwordHash,
            fullName: body.full_name,
            roleId,
        });
        return { id };
    }
}

export default SettingsService;
