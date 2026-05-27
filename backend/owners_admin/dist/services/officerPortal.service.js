"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officerPortalService = exports.OfficerPortalService = void 0;
exports.resolveOfficerId = resolveOfficerId;
exports.resolveOfficerIdWithFallback = resolveOfficerIdWithFallback;
const enforcement_repository_1 = require("../repositories/enforcement.repository");
const officerPortal_repository_1 = require("../repositories/officerPortal.repository");
const enforcement_service_1 = require("./enforcement.service");
const commonErrors_1 = require("./commonErrors");
const enforcementService = new enforcement_service_1.EnforcementService();
function resolveOfficerId(req) {
    const auth = req.user;
    if (auth?.userType === 'officer' && auth.id)
        return auth.id;
    throw new commonErrors_1.ValidationError('Officer authentication required');
}
async function resolveOfficerIdWithFallback(req) {
    try {
        return resolveOfficerId(req);
    }
    catch {
        const fallback = await enforcement_repository_1.enforcementRepository.findDefaultOfficer();
        if (!fallback)
            throw new commonErrors_1.ValidationError('No active officer available');
        return fallback.id;
    }
}
function mapOfflineRow(row) {
    let payload = {};
    try {
        payload = JSON.parse(row.payload_json);
    }
    catch {
        payload = {};
    }
    return {
        id: row.id,
        type: row.record_type,
        title: row.title,
        subtitle: row.subtitle ?? '',
        payload,
        status: row.status,
        errorMessage: row.error_message,
        createdAt: row.created_at,
        syncedAt: row.synced_at,
    };
}
class OfficerPortalService {
    async getProfile(officerId) {
        const officer = await officerPortal_repository_1.officerPortalRepository.findOfficerById(officerId);
        if (!officer)
            throw new commonErrors_1.NotFoundError('Officer not found');
        return {
            id: officer.id,
            fullName: officer.full_name,
            email: officer.email,
            phone: officer.phone,
            badgeNumber: officer.badge_number,
            role: officer.role,
            status: officer.status,
            assignedZone: officer.assigned_zone ?? 'Zone A — Downtown',
            lastLoginAt: officer.last_login_at,
        };
    }
    async updateProfile(officerId, body) {
        await officerPortal_repository_1.officerPortalRepository.updateOfficerProfile(officerId, {
            phone: body.phone?.trim(),
            assigned_zone: body.assignedZone?.trim(),
        });
        return this.getProfile(officerId);
    }
    async getSettings(officerId) {
        return officerPortal_repository_1.officerPortalRepository.getSettings(officerId);
    }
    async saveSettings(officerId, body) {
        return officerPortal_repository_1.officerPortalRepository.saveSettings(officerId, body);
    }
    async getShiftState(officerId) {
        const [activeShift, onDutySecondsToday, pendingOffline] = await Promise.all([
            officerPortal_repository_1.officerPortalRepository.getActiveShift(officerId),
            officerPortal_repository_1.officerPortalRepository.getOnDutySecondsToday(officerId),
            officerPortal_repository_1.officerPortalRepository.countPendingOffline(officerId),
        ]);
        return {
            onDuty: Boolean(activeShift),
            shift: activeShift
                ? {
                    id: activeShift.id,
                    startedAt: activeShift.started_at,
                    endedAt: activeShift.ended_at,
                    status: activeShift.status,
                }
                : null,
            onDutySecondsToday,
            pendingOfflineCount: pendingOffline,
        };
    }
    async startShift(officerId) {
        await officerPortal_repository_1.officerPortalRepository.startShift(officerId);
        return this.getShiftState(officerId);
    }
    async endShift(officerId) {
        await officerPortal_repository_1.officerPortalRepository.endShift(officerId);
        return this.getShiftState(officerId);
    }
    async listOffline(officerId) {
        const rows = await officerPortal_repository_1.officerPortalRepository.listOfflineRecords(officerId);
        return rows.map(mapOfflineRow);
    }
    async createOffline(officerId, body) {
        if (!body.type || !body.title?.trim()) {
            throw new commonErrors_1.ValidationError('type and title are required');
        }
        const row = await officerPortal_repository_1.officerPortalRepository.createOfflineRecord({
            officerId,
            recordType: body.type,
            title: body.title.trim(),
            subtitle: body.subtitle?.trim(),
            payload: body.payload ?? {},
            clientId: body.clientId,
        });
        return mapOfflineRow(row);
    }
    async deleteOffline(officerId, recordId) {
        const deleted = await officerPortal_repository_1.officerPortalRepository.deleteOfflineRecord(officerId, recordId);
        if (!deleted)
            throw new commonErrors_1.NotFoundError('Offline record not found');
    }
    async syncOffline(officerId) {
        const rows = await officerPortal_repository_1.officerPortalRepository.listOfflineRecords(officerId);
        const results = [];
        for (const row of rows) {
            await officerPortal_repository_1.officerPortalRepository.updateOfflineStatus(row.id, 'syncing');
            let payload = {};
            try {
                payload = JSON.parse(row.payload_json);
            }
            catch {
                await officerPortal_repository_1.officerPortalRepository.updateOfflineStatus(row.id, 'failed', 'Invalid payload JSON');
                results.push({ id: row.id, success: false, error: 'Invalid payload JSON' });
                continue;
            }
            try {
                switch (row.record_type) {
                    case 'ticket': {
                        const photos = Array.isArray(payload.photos) ? payload.photos : [];
                        await enforcementService.createTicket({
                            ...payload,
                            officerId,
                            photos,
                        });
                        break;
                    }
                    case 'evidence': {
                        const photos = Array.isArray(payload.photos) ? payload.photos : [];
                        if (!photos.length)
                            throw new commonErrors_1.ValidationError('Evidence photos required');
                        await enforcementService.captureEvidence({
                            officerId,
                            licensePlate: String(payload.licensePlate ?? ''),
                            locationName: payload.locationName,
                            notes: payload.notes,
                            photos,
                        });
                        break;
                    }
                    case 'payment': {
                        const ticketId = String(payload.ticketId ?? '');
                        if (!ticketId)
                            throw new commonErrors_1.ValidationError('ticketId is required for payment sync');
                        await enforcementService.payTicket(ticketId, {
                            payment_method: String(payload.payment_method ?? 'cash'),
                            transaction_ref: payload.transaction_ref,
                        });
                        break;
                    }
                    default:
                        break;
                }
                await officerPortal_repository_1.officerPortalRepository.updateOfflineStatus(row.id, 'synced');
                results.push({ id: row.id, success: true });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Sync failed';
                await officerPortal_repository_1.officerPortalRepository.updateOfflineStatus(row.id, 'failed', message);
                results.push({ id: row.id, success: false, error: message });
            }
        }
        const settings = await officerPortal_repository_1.officerPortalRepository.getSettings(officerId);
        const sync = settings.sync ?? {};
        sync.lastSyncAt = new Date().toISOString();
        await officerPortal_repository_1.officerPortalRepository.saveSettings(officerId, { ...settings, sync });
        const syncedIds = results.filter((r) => r.success).map((r) => r.id);
        for (const id of syncedIds) {
            await officerPortal_repository_1.officerPortalRepository.deleteOfflineRecord(officerId, id);
        }
        return {
            processed: results.length,
            succeeded: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
            results,
            lastSyncAt: sync.lastSyncAt,
        };
    }
    async getOnDutySecondsForDashboard(officerId) {
        return officerPortal_repository_1.officerPortalRepository.getOnDutySecondsToday(officerId);
    }
}
exports.OfficerPortalService = OfficerPortalService;
exports.officerPortalService = new OfficerPortalService();
//# sourceMappingURL=officerPortal.service.js.map