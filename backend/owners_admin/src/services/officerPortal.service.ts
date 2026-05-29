import { Request } from 'express';
import { AuthenticatedRequest } from '../types';
import { enforcementRepository } from '../repositories/enforcement.repository';
import {
  officerPortalRepository,
  OfflineRecordType,
} from '../repositories/officerPortal.repository';
import { EnforcementService } from './enforcement.service';
import { NotFoundError, ValidationError } from './commonErrors';

const enforcementService = new EnforcementService();

export function resolveOfficerId(req: Request): string {
  const auth = (req as AuthenticatedRequest).user;
  if (auth?.userType === 'officer' && auth.id) return auth.id;
  throw new ValidationError('Officer authentication required');
}

export async function resolveOfficerIdWithFallback(req: Request): Promise<string> {
  try {
    return resolveOfficerId(req);
  } catch {
    const fallback = await enforcementRepository.findDefaultOfficer();
    if (!fallback) throw new ValidationError('No active officer available');
    return fallback.id;
  }
}

function mapOfflineRow(row: {
  id: string;
  record_type: OfflineRecordType;
  title: string;
  subtitle: string | null;
  payload_json: string;
  status: string;
  error_message: string | null;
  created_at: Date;
  synced_at: Date | null;
}) {
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(row.payload_json);
  } catch {
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

export class OfficerPortalService {
  async getProfile(officerId: string) {
    const officer = await officerPortalRepository.findOfficerById(officerId);
    if (!officer) throw new NotFoundError('Officer not found');
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

  async updateProfile(officerId: string, body: { phone?: string; assignedZone?: string }) {
    await officerPortalRepository.updateOfficerProfile(officerId, {
      phone: body.phone?.trim(),
      assigned_zone: body.assignedZone?.trim(),
    });
    return this.getProfile(officerId);
  }

  async getSettings(officerId: string) {
    return officerPortalRepository.getSettings(officerId);
  }

  async saveSettings(officerId: string, body: Record<string, unknown>) {
    return officerPortalRepository.saveSettings(officerId, body);
  }

  async getShiftState(officerId: string) {
    const [activeShift, onDutySecondsToday, pendingOffline] = await Promise.all([
      officerPortalRepository.getActiveShift(officerId),
      officerPortalRepository.getOnDutySecondsToday(officerId),
      officerPortalRepository.countPendingOffline(officerId),
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

  async startShift(officerId: string) {
    await officerPortalRepository.startShift(officerId);
    return this.getShiftState(officerId);
  }

  async endShift(officerId: string) {
    await officerPortalRepository.endShift(officerId);
    return this.getShiftState(officerId);
  }

  async listOffline(officerId: string) {
    const rows = await officerPortalRepository.listOfflineRecords(officerId);
    return rows.map(mapOfflineRow);
  }

  async createOffline(
    officerId: string,
    body: {
      type: OfflineRecordType;
      title: string;
      subtitle?: string;
      payload: Record<string, unknown>;
      clientId?: string;
    },
  ) {
    if (!body.type || !body.title?.trim()) {
      throw new ValidationError('type and title are required');
    }
    const row = await officerPortalRepository.createOfflineRecord({
      officerId,
      recordType: body.type,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim(),
      payload: body.payload ?? {},
      clientId: body.clientId,
    });
    return mapOfflineRow(row);
  }

  async deleteOffline(officerId: string, recordId: string) {
    const deleted = await officerPortalRepository.deleteOfflineRecord(officerId, recordId);
    if (!deleted) throw new NotFoundError('Offline record not found');
  }

  async syncOffline(officerId: string) {
    const rows = await officerPortalRepository.listOfflineRecords(officerId);
    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const row of rows) {
      await officerPortalRepository.updateOfflineStatus(row.id, 'syncing');
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(row.payload_json);
      } catch {
        await officerPortalRepository.updateOfflineStatus(row.id, 'failed', 'Invalid payload JSON');
        results.push({ id: row.id, success: false, error: 'Invalid payload JSON' });
        continue;
      }

      try {
        switch (row.record_type) {
          case 'ticket': {
            const photos = Array.isArray(payload.photos) ? (payload.photos as string[]) : [];
            await enforcementService.createTicket({
              ...payload,
              officerId,
              photos,
            } as Parameters<typeof enforcementService.createTicket>[0]);
            break;
          }
          case 'evidence': {
            const photos = Array.isArray(payload.photos) ? (payload.photos as string[]) : [];
            if (!photos.length) throw new ValidationError('Evidence photos required');
            await enforcementService.captureEvidence({
              officerId,
              licensePlate: String(payload.licensePlate ?? ''),
              locationName: payload.locationName as string | undefined,
              notes: payload.notes as string | undefined,
              photos,
            });
            break;
          }
          case 'payment': {
            const ticketId = String(payload.ticketId ?? '');
            if (!ticketId) throw new ValidationError('ticketId is required for payment sync');
            await enforcementService.payTicket(ticketId, {
              payment_method: String(payload.payment_method ?? 'cash'),
              transaction_ref: payload.transaction_ref as string | undefined,
            });
            break;
          }
          default:
            break;
        }
        await officerPortalRepository.updateOfflineStatus(row.id, 'synced');
        results.push({ id: row.id, success: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sync failed';
        await officerPortalRepository.updateOfflineStatus(row.id, 'failed', message);
        results.push({ id: row.id, success: false, error: message });
      }
    }

    const settings = await officerPortalRepository.getSettings(officerId);
    const sync = (settings.sync as Record<string, unknown>) ?? {};
    sync.lastSyncAt = new Date().toISOString();
    await officerPortalRepository.saveSettings(officerId, { ...settings, sync });

    const syncedIds = results.filter((r) => r.success).map((r) => r.id);
    for (const id of syncedIds) {
      await officerPortalRepository.deleteOfflineRecord(officerId, id);
    }

    return {
      processed: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
      lastSyncAt: sync.lastSyncAt,
    };
  }

  async getOnDutySecondsForDashboard(officerId: string): Promise<number> {
    return officerPortalRepository.getOnDutySecondsToday(officerId);
  }
}

export const officerPortalService = new OfficerPortalService();
