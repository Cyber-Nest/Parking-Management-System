import crypto from 'crypto';
import { execute, queryRows } from '../config/database';

export type OfflineRecordType = 'ticket' | 'evidence' | 'payment' | 'other';
export type OfflineRecordStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface OfficerProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  badge_number: string | null;
  role: string;
  status: string;
  assigned_zone: string | null;
  last_login_at: Date | null;
  parking_lot_id: string | null;
  lot_name: string | null;
}

export interface OfficerShiftRow {
  id: string;
  officer_id: string;
  started_at: Date;
  ended_at: Date | null;
  status: 'active' | 'ended';
}

export interface OfficerOfflineRow {
  id: string;
  officer_id: string;
  record_type: OfflineRecordType;
  title: string;
  subtitle: string | null;
  payload_json: string;
  status: OfflineRecordStatus;
  error_message: string | null;
  client_id: string | null;
  created_at: Date;
  synced_at: Date | null;
}

const DEFAULT_SETTINGS = {
  printer: {
    selectedPrinter: 'bixolon',
    paperSize: '80mm',
    density: 'Normal',
    autoCut: true,
    printBeep: true,
    printBarcode: true,
  },
  camera: {
    resolution: '1920x1080',
    watermark: true,
    autoTimestamp: true,
    compression: 'medium',
  },
  sync: {
    autoSync: true,
    wifiOnly: false,
    backgroundSync: true,
    syncIntervalMinutes: 15,
    lastSyncAt: null as string | null,
  },
  gps: {
    mode: 'High Accuracy',
    updateFrequency: 'Every 15 Seconds',
  },
  preferences: {
    language: 'English',
    autoLock: true,
    dateTimeFormat: 'May 20, 2025 10:30 AM',
    timeZone: '(UTC-04:00) Toronto',
  },
};

export class OfficerPortalRepository {
  private portalTablesReady = false;

  private async ensurePortalTables() {
    if (this.portalTablesReady) return;
    await execute(
      `CREATE TABLE IF NOT EXISTS officer_settings (
        officer_id CHAR(36) PRIMARY KEY,
        settings_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    );
    await execute(
      `CREATE TABLE IF NOT EXISTS officer_shifts (
        id CHAR(36) PRIMARY KEY,
        officer_id CHAR(36) NOT NULL,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME NULL,
        status ENUM('active', 'ended') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_officer_shifts_officer_status (officer_id, status),
        INDEX idx_officer_shifts_started_at (started_at)
      )`,
    );
    await execute(
      `CREATE TABLE IF NOT EXISTS officer_offline_records (
        id CHAR(36) PRIMARY KEY,
        officer_id CHAR(36) NOT NULL,
        record_type ENUM('ticket', 'evidence', 'payment', 'other') NOT NULL DEFAULT 'other',
        title VARCHAR(191) NOT NULL,
        subtitle VARCHAR(255) NULL,
        payload_json LONGTEXT NOT NULL,
        status ENUM('pending', 'syncing', 'synced', 'failed') NOT NULL DEFAULT 'pending',
        error_message TEXT NULL,
        client_id VARCHAR(191) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME NULL,
        INDEX idx_officer_offline_records_officer_status (officer_id, status),
        INDEX idx_officer_offline_records_created_at (created_at)
      )`,
    );
    this.portalTablesReady = true;
  }

  async findOfficerById(id: string): Promise<OfficerProfileRow | null> {
    const rows = await queryRows<OfficerProfileRow>(
      `SELECT o.id, o.full_name, o.email, o.phone, o.badge_number, o.role, o.status, o.assigned_zone, o.last_login_at, o.parking_lot_id, pl.lot_name
       FROM officers o
       LEFT JOIN parking_lots pl ON o.parking_lot_id = pl.id
       WHERE o.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async updateOfficerProfile(
    id: string,
    patch: { phone?: string; assigned_zone?: string },
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (patch.phone !== undefined) {
      fields.push('phone = ?');
      values.push(patch.phone);
    }
    if (patch.assigned_zone !== undefined) {
      fields.push('assigned_zone = ?');
      values.push(patch.assigned_zone);
    }
    if (!fields.length) return;
    values.push(id);
    await execute(`UPDATE officers SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async getSettings(officerId: string): Promise<Record<string, unknown>> {
    await this.ensurePortalTables();
    const rows = await queryRows<{ settings_json: string }>(
      `SELECT settings_json FROM officer_settings WHERE officer_id = ? LIMIT 1`,
      [officerId],
    );
    if (!rows[0]?.settings_json) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(rows[0].settings_json) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async saveSettings(officerId: string, settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    await this.ensurePortalTables();
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    await execute(
      `INSERT INTO officer_settings (officer_id, settings_json)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json), updated_at = CURRENT_TIMESTAMP`,
      [officerId, JSON.stringify(merged)],
    );
    return merged;
  }

  async getActiveShift(officerId: string): Promise<OfficerShiftRow | null> {
    await this.ensurePortalTables();
    const rows = await queryRows<OfficerShiftRow>(
      `SELECT id, officer_id, started_at, ended_at, status
       FROM officer_shifts
       WHERE officer_id = ? AND status = 'active'
       ORDER BY started_at DESC
       LIMIT 1`,
      [officerId],
    );
    return rows[0] ?? null;
  }

  async startShift(officerId: string): Promise<OfficerShiftRow> {
    await this.ensurePortalTables();
    const existing = await this.getActiveShift(officerId);
    if (existing) return existing;

    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO officer_shifts (id, officer_id, started_at, status)
       VALUES (?, ?, NOW(), 'active')`,
      [id, officerId],
    );
    const rows = await queryRows<OfficerShiftRow>(
      `SELECT id, officer_id, started_at, ended_at, status FROM officer_shifts WHERE id = ?`,
      [id],
    );
    return rows[0]!;
  }

  async endShift(officerId: string): Promise<OfficerShiftRow | null> {
    await this.ensurePortalTables();
    const active = await this.getActiveShift(officerId);
    if (!active) return null;
    await execute(
      `UPDATE officer_shifts SET ended_at = NOW(), status = 'ended' WHERE id = ?`,
      [active.id],
    );
    const rows = await queryRows<OfficerShiftRow>(
      `SELECT id, officer_id, started_at, ended_at, status FROM officer_shifts WHERE id = ?`,
      [active.id],
    );
    return rows[0] ?? null;
  }

  async getOnDutySecondsToday(officerId: string): Promise<number> {
    await this.ensurePortalTables();
    const [completed, active] = await Promise.all([
      queryRows<{ seconds: number }>(
        `SELECT COALESCE(SUM(TIMESTAMPDIFF(SECOND, started_at, COALESCE(ended_at, NOW()))), 0) AS seconds
         FROM officer_shifts
         WHERE officer_id = ?
           AND DATE(started_at) = CURDATE()
           AND status = 'ended'`,
        [officerId],
      ),
      this.getActiveShift(officerId),
    ]);

    let total = Number(completed[0]?.seconds ?? 0);
    if (active) {
      total += Math.max(
        0,
        Math.floor((Date.now() - new Date(active.started_at).getTime()) / 1000),
      );
    }
    return total;
  }

  async listOfflineRecords(officerId: string, status?: OfflineRecordStatus): Promise<OfficerOfflineRow[]> {
    await this.ensurePortalTables();
    if (status) {
      return queryRows<OfficerOfflineRow>(
        `SELECT id, officer_id, record_type, title, subtitle, payload_json, status, error_message, client_id, created_at, synced_at
         FROM officer_offline_records
         WHERE officer_id = ? AND status = ?
         ORDER BY created_at ASC`,
        [officerId, status],
      );
    }
    return queryRows<OfficerOfflineRow>(
      `SELECT id, officer_id, record_type, title, subtitle, payload_json, status, error_message, client_id, created_at, synced_at
       FROM officer_offline_records
       WHERE officer_id = ? AND status IN ('pending', 'syncing', 'failed')
       ORDER BY created_at ASC`,
      [officerId],
    );
  }

  async createOfflineRecord(input: {
    officerId: string;
    recordType: OfflineRecordType;
    title: string;
    subtitle?: string;
    payload: Record<string, unknown>;
    clientId?: string;
  }): Promise<OfficerOfflineRow> {
    await this.ensurePortalTables();
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO officer_offline_records
       (id, officer_id, record_type, title, subtitle, payload_json, status, client_id)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        id,
        input.officerId,
        input.recordType,
        input.title,
        input.subtitle ?? null,
        JSON.stringify(input.payload),
        input.clientId ?? null,
      ],
    );
    const rows = await queryRows<OfficerOfflineRow>(
      `SELECT id, officer_id, record_type, title, subtitle, payload_json, status, error_message, client_id, created_at, synced_at
       FROM officer_offline_records WHERE id = ?`,
      [id],
    );
    return rows[0]!;
  }

  async deleteOfflineRecord(officerId: string, recordId: string): Promise<boolean> {
    await this.ensurePortalTables();
    const result = await execute(
      `DELETE FROM officer_offline_records WHERE id = ? AND officer_id = ?`,
      [recordId, officerId],
    );
    return (result as { affectedRows?: number }).affectedRows !== 0;
  }

  async updateOfflineStatus(
    recordId: string,
    status: OfflineRecordStatus,
    errorMessage?: string | null,
  ): Promise<void> {
    await this.ensurePortalTables();
    await execute(
      `UPDATE officer_offline_records
       SET status = ?, error_message = ?, synced_at = IF(? = 'synced', NOW(), synced_at)
       WHERE id = ?`,
      [status, errorMessage ?? null, status, recordId],
    );
  }

  async countPendingOffline(officerId: string): Promise<number> {
    await this.ensurePortalTables();
    const rows = await queryRows<{ total: number }>(
      `SELECT COUNT(*) AS total FROM officer_offline_records
       WHERE officer_id = ? AND status IN ('pending', 'failed')`,
      [officerId],
    );
    return Number(rows[0]?.total ?? 0);
  }
}

export const officerPortalRepository = new OfficerPortalRepository();
