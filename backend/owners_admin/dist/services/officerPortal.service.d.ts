import { Request } from 'express';
import { OfflineRecordType } from '../repositories/officerPortal.repository';
export declare function resolveOfficerId(req: Request): string;
export declare function resolveOfficerIdWithFallback(req: Request): Promise<string>;
export declare class OfficerPortalService {
    getProfile(officerId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        badgeNumber: string | null;
        role: string;
        status: string;
        assignedZone: string;
        lastLoginAt: Date | null;
    }>;
    updateProfile(officerId: string, body: {
        phone?: string;
        assignedZone?: string;
    }): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        badgeNumber: string | null;
        role: string;
        status: string;
        assignedZone: string;
        lastLoginAt: Date | null;
    }>;
    getSettings(officerId: string): Promise<Record<string, unknown>>;
    saveSettings(officerId: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
    getShiftState(officerId: string): Promise<{
        onDuty: boolean;
        shift: {
            id: string;
            startedAt: Date;
            endedAt: Date | null;
            status: "active" | "ended";
        } | null;
        onDutySecondsToday: number;
        pendingOfflineCount: number;
    }>;
    startShift(officerId: string): Promise<{
        onDuty: boolean;
        shift: {
            id: string;
            startedAt: Date;
            endedAt: Date | null;
            status: "active" | "ended";
        } | null;
        onDutySecondsToday: number;
        pendingOfflineCount: number;
    }>;
    endShift(officerId: string): Promise<{
        onDuty: boolean;
        shift: {
            id: string;
            startedAt: Date;
            endedAt: Date | null;
            status: "active" | "ended";
        } | null;
        onDutySecondsToday: number;
        pendingOfflineCount: number;
    }>;
    listOffline(officerId: string): Promise<{
        id: string;
        type: OfflineRecordType;
        title: string;
        subtitle: string;
        payload: Record<string, unknown>;
        status: string;
        errorMessage: string | null;
        createdAt: Date;
        syncedAt: Date | null;
    }[]>;
    createOffline(officerId: string, body: {
        type: OfflineRecordType;
        title: string;
        subtitle?: string;
        payload: Record<string, unknown>;
        clientId?: string;
    }): Promise<{
        id: string;
        type: OfflineRecordType;
        title: string;
        subtitle: string;
        payload: Record<string, unknown>;
        status: string;
        errorMessage: string | null;
        createdAt: Date;
        syncedAt: Date | null;
    }>;
    deleteOffline(officerId: string, recordId: string): Promise<void>;
    syncOffline(officerId: string): Promise<{
        processed: number;
        succeeded: number;
        failed: number;
        results: {
            id: string;
            success: boolean;
            error?: string;
        }[];
        lastSyncAt: unknown;
    }>;
    getOnDutySecondsForDashboard(officerId: string): Promise<number>;
}
export declare const officerPortalService: OfficerPortalService;
//# sourceMappingURL=officerPortal.service.d.ts.map