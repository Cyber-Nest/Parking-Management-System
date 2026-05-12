import { PaginatedResponse, SessionPublic } from '../types';
export declare class SessionService {
    list(query: Record<string, string | undefined>): Promise<PaginatedResponse<SessionPublic>>;
    summary(): Promise<{
        totalToday: number;
        activeCount: number;
        expiredCount: number;
        extendedCount: number;
        cancelledCount: number;
    }>;
}
//# sourceMappingURL=session.service.d.ts.map