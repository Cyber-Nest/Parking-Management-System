import { UiOfficerStatus } from '../repositories/officer.repository';
import { OfficerRole } from '../types';
export declare class OfficerService {
    summary(): Promise<{
        totalOfficers: number;
        activeOfficers: number;
        disabledOfficers: number;
        ticketsIssuedToday: number;
    }>;
    list(query: Record<string, string | undefined>): Promise<{
        items: {
            id: string;
            officer_id: string;
            full_name: string;
            email: string;
            phone: string | null;
            role: OfficerRole;
            status: string;
            tickets_issued: number;
            last_login_at: Date | null;
            created_at: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(adminId: string, body: {
        full_name: string;
        email: string;
        phone?: string;
        role: OfficerRole;
        badge_number?: string;
        password?: string;
    }): Promise<{
        id: string;
        password: string;
    }>;
    update(id: string, body: {
        full_name?: string;
        phone?: string;
        role?: OfficerRole;
        badge_number?: string;
    }): Promise<void>;
    setStatus(id: string, status: UiOfficerStatus): Promise<void>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=officer.service.d.ts.map