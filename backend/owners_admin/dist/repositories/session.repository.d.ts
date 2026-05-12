import { SessionStatus } from '../types';
export interface SessionListFilters {
    page: number;
    limit: number;
    q?: string;
    status?: SessionStatus;
    from?: string;
    to?: string;
}
export interface SessionRow {
    id: string;
    user_id: string | null;
    vehicle_id: string | null;
    license_plate: string;
    plan_id: string | null;
    plan_name: string | null;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    status: SessionStatus;
    notes: string | null;
    created_by_officer: string | null;
    created_at: Date;
}
export declare class SessionRepository {
    private buildWhere;
    list(filters: SessionListFilters): Promise<{
        items: SessionRow[];
        total: number;
    }>;
    summary(): Promise<{
        totalToday: number;
        activeCount: number;
        expiredCount: number;
        extendedCount: number;
        cancelledCount: number;
    }>;
    create(params: {
        licensePlate: string;
        planId?: string;
        planName?: string;
        startTime: string;
        endTime: string;
        durationMinutes: number;
        status?: SessionStatus;
        notes?: string;
        userId?: string;
        vehicleId?: string;
        createdByOfficer?: string;
    }): Promise<string>;
}
//# sourceMappingURL=session.repository.d.ts.map