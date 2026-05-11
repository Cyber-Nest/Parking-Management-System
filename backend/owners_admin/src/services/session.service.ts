import { PaginatedResponse, SessionPublic, SessionStatus } from '../types';
import { SessionRepository } from '../repositories/session.repository';

const sessionRepo = new SessionRepository();

export class SessionService {
  async list(query: Record<string, string | undefined>): Promise<PaginatedResponse<SessionPublic>> {
    const page = Math.max(1, Number(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));

    const { items, total } = await sessionRepo.list({
      page,
      limit,
      q: query.q?.trim() || undefined,
      status: (query.status as SessionStatus) || undefined,
      from: query.from,
      to: query.to,
    });

    const mapped: SessionPublic[] = items.map((s) => ({
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

