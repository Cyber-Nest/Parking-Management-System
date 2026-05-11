import bcrypt from 'bcryptjs';
import { OfficerRepository, UiOfficerStatus } from '../repositories/officer.repository';
import { OfficerRole } from '../types';
import { NotFoundError, ValidationError } from './commonErrors';
import { env } from '../config/env';

const officerRepo = new OfficerRepository();

export class OfficerService {
  async summary() {
    return officerRepo.summary();
  }

  async list(query: Record<string, string | undefined>) {
    const page = Math.max(1, Number(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));

    const { items, total } = await officerRepo.list({
      page,
      limit,
      q: query.q?.trim() || undefined,
      status: (query.status as UiOfficerStatus) || undefined,
      role: (query.role as OfficerRole) || undefined,
    });

    const mapped = items.map((o) => ({
      id: o.id,
      officer_id: o.badge_number ?? o.id,
      full_name: o.full_name,
      email: o.email,
      phone: o.phone,
      role: o.role,
      status: o.status === 'active' ? 'ACTIVE' : 'DISABLED',
      tickets_issued: o.tickets_issued ?? 0,
      last_login_at: o.last_login_at,
      created_at: o.created_at,
    }));

    return {
      items: mapped,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async create(adminId: string, body: { full_name: string; email: string; phone?: string; role: OfficerRole; badge_number?: string; password?: string }) {
    if (!body.full_name?.trim()) throw new ValidationError('full_name is required');
    if (!body.email?.trim()) throw new ValidationError('email is required');
    if (!body.role) throw new ValidationError('role is required');

    const rawPassword = body.password?.trim() || 'Officer@123';
    if (rawPassword.length < 8) throw new ValidationError('password must be at least 8 characters');

    const passwordHash = await bcrypt.hash(rawPassword, env.bcryptSaltRounds);

    const id = await officerRepo.create({
      createdByAdminId: adminId,
      fullName: body.full_name,
      email: body.email,
      phone: body.phone,
      badgeNumber: body.badge_number,
      role: body.role,
      passwordHash,
    });

    return { id, password: rawPassword };
  }

  async update(id: string, body: { full_name?: string; phone?: string; role?: OfficerRole; badge_number?: string }) {
    const affected = await officerRepo.update(id, {
      fullName: body.full_name,
      phone: body.phone,
      role: body.role,
      badgeNumber: body.badge_number,
    });
    if (affected === 0) {
      // if nothing updated, still allow idempotent calls, but validate officer exists
      const { items } = await officerRepo.list({ page: 1, limit: 1, q: id });
      if (!items.find((x) => x.id === id)) throw new NotFoundError('Officer not found');
    }
  }

  async setStatus(id: string, status: UiOfficerStatus) {
    const affected = await officerRepo.setUiStatus(id, status);
    if (affected === 0) throw new NotFoundError('Officer not found');
  }

  async remove(id: string) {
    const affected = await officerRepo.remove(id);
    if (affected === 0) throw new NotFoundError('Officer not found');
  }
}