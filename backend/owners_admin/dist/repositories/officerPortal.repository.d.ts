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
export declare class OfficerPortalRepository {
    private portalTablesReady;
    private ensurePortalTables;
    findOfficerById(id: string): Promise<OfficerProfileRow | null>;
    updateOfficerProfile(id: string, patch: {
        phone?: string;
        assigned_zone?: string;
    }): Promise<void>;
    getSettings(officerId: string): Promise<Record<string, unknown>>;
    saveSettings(officerId: string, settings: Record<string, unknown>): Promise<Record<string, unknown>>;
    getActiveShift(officerId: string): Promise<OfficerShiftRow | null>;
    startShift(officerId: string): Promise<OfficerShiftRow>;
    endShift(officerId: string): Promise<OfficerShiftRow | null>;
    getOnDutySecondsToday(officerId: string): Promise<number>;
    listOfflineRecords(officerId: string, status?: OfflineRecordStatus): Promise<OfficerOfflineRow[]>;
    createOfflineRecord(input: {
        officerId: string;
        recordType: OfflineRecordType;
        title: string;
        subtitle?: string;
        payload: Record<string, unknown>;
        clientId?: string;
    }): Promise<OfficerOfflineRow>;
    deleteOfflineRecord(officerId: string, recordId: string): Promise<boolean>;
    updateOfflineStatus(recordId: string, status: OfflineRecordStatus, errorMessage?: string | null): Promise<void>;
    countPendingOffline(officerId: string): Promise<number>;
}
export declare const officerPortalRepository: OfficerPortalRepository;
//# sourceMappingURL=officerPortal.repository.d.ts.map