"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const settings_repository_1 = require("../repositories/settings.repository");
const admin_repository_1 = require("../repositories/admin.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
const commonErrors_1 = require("./commonErrors");
const repository = new settings_repository_1.SettingsRepository();
const adminRepo = new admin_repository_1.AdminRepository();
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
    async getTaxPricing() {
        return repository.getTaxPricing();
    }
    async updateTaxPricing(patch) {
        await repository.updateTaxPricing(patch);
        return repository.getTaxPricing();
    }
    async listAdmins() {
        return repository.listAdmins();
    }
    async updateAdmin(id, patch) {
        const n = await repository.updateAdmin(id, patch);
        return n;
    }
    async listRolesWithPermissions() {
        return repository.listRolesWithPermissions();
    }
    async upsertRolePermissions(roleId, permissions) {
        await repository.upsertRolePermissions(roleId, JSON.stringify(permissions));
    }
    async findRoleIdByName(name) {
        return repository.findRoleIdByName(name);
    }
    async createAdmin(body) {
        const roleId = await repository.findRoleIdByName(body.role_name);
        if (!roleId)
            throw new commonErrors_1.ValidationError('Invalid role name');
        const raw = body.password?.trim() || 'Admin@123456';
        if (raw.length < 8)
            throw new commonErrors_1.ValidationError('password must be at least 8 characters');
        const passwordHash = await bcryptjs_1.default.hash(raw, env_1.env.bcryptSaltRounds);
        const id = await adminRepo.insertAdmin({
            email: body.email,
            passwordHash,
            fullName: body.full_name,
            roleId,
        });
        return { id };
    }
}
exports.SettingsService = SettingsService;
exports.default = SettingsService;
//# sourceMappingURL=settings.service.js.map