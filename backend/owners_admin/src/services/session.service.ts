import { PaginatedResponse, SessionPublic, SessionStatus } from '../types';
import { SessionRepository } from '../repositories/session.repository';
import { NotFoundError, ValidationError } from './commonErrors';

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
      parkingLotId: query.parking_lot_id ?? query.parkingLotId ?? query.lotId,
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
      amount: s.amount,
      created_at: s.created_at,
      parking_lot_id: s.parking_lot_id,
      parking_lot_name: s.parking_lot_name,
      subzone_id: s.subzone_id,
      subzone_name: s.subzone_name,
    }));

    return {
      items: mapped,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async summary(query: Record<string, string | undefined> = {}) {
    return sessionRepo.summary({
      parkingLotId: query.parking_lot_id ?? query.parkingLotId ?? query.lotId,
    });
  }

  async cancel(id: string, body: { reason?: string } = {}) {
    if (!id?.trim()) throw new ValidationError('session id is required');
    const session = await sessionRepo.cancel(id, body.reason);
    if (!session) throw new NotFoundError('Session not found');
    return {
      id: session.id,
      license_plate: session.license_plate,
      plan_name: session.plan_name,
      start_time: session.start_time,
      end_time: session.end_time,
      duration_minutes: session.duration_minutes,
      status: session.status,
      notes: session.notes,
      created_at: session.created_at,
    };
  }
}
