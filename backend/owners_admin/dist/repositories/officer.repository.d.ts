import { OfficerRole } from '../types';
export type UiOfficerStatus = 'ACTIVE' | 'DISABLED';
export interface OfficerListFilters {
    page: number;
    limit: number;
    q?: string;
    status?: UiOfficerStatus;
    role?: OfficerRole;
}
export interface OfficerRow {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    badge_number: string | null;
    role: OfficerRole;
    status: 'active' | 'inactive' | 'suspended';
    last_login_at: Date | null;
    created_at: Date;
    tickets_issued?: number;
}
export declare class OfficerRepository {
    private buildWhere;
    list(filters: OfficerListFilters): Promise<{
        items: OfficerRow[];
        total: number;
    }>;
    findById(id: string): Promise<OfficerRow | null>;
    summary(): Promise<{
        totalOfficers: number;
        activeOfficers: number;
        disabledOfficers: number;
        ticketsIssuedToday: number;
    }>;
    create(params: {
        createdByAdminId: string;
        fullName: string;
        email: string;
        phone?: string;
        badgeNumber?: string;
        role: OfficerRole;
        passwordHash: string;
    }): Promise<string>;
    update(id: string, params: {
        fullName?: string;
        phone?: string;
        role?: OfficerRole;
        badgeNumber?: string;
    }): Promise<number>;
    setUiStatus(id: string, status: UiOfficerStatus): Promise<number>;
    remove(id: string): Promise<number>;
}
//# sourceMappingURL=officer.repository.d.ts.map