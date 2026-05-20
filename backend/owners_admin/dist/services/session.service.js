"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const session_repository_1 = require("../repositories/session.repository");
const sessionRepo = new session_repository_1.SessionRepository();
class SessionService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { items, total } = await sessionRepo.list({
            page,
            limit,
            q: query.q?.trim() || undefined,
            status: query.status || undefined,
            from: query.from,
            to: query.to,
        });
        const mapped = items.map((s) => ({
            id: s.id,
            license_plate: s.license_plate,
            plan_name: s.plan_name,
            start_time: s.start_time,
            end_time: s.end_time,
            duration_minutes: s.duration_minutes,
            status: s.status,
            notes: s.notes,
            created_at: s.created_at,
        }));
        return {
            items: mapped,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async summary() {
        return sessionRepo.summary();
    }
}
exports.SessionService = SessionService;
//# sourceMappingURL=session.service.js.map