import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OfficerRepository, UiOfficerStatus } from '../repositories/officer.repository';
import { AdminRepository } from '../repositories/admin.repository';
import { OfficerRole } from '../types';
import { NotFoundError, ValidationError } from './commonErrors';
import { env } from '../config/env';
import { sendEmail, officerWelcomeTemplate } from '../utils/email';

const officerRepo = new OfficerRepository();
const adminRepo = new AdminRepository();

const generateRandomPassword = (): string => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()-_=+';
  const allChars = upper + lower + digits + symbols;
  const requiredChars = [
    upper[Math.floor(crypto.randomInt(0, upper.length))],
    lower[Math.floor(crypto.randomInt(0, lower.length))],
    digits[Math.floor(crypto.randomInt(0, digits.length))],
    symbols[Math.floor(crypto.randomInt(0, symbols.length))],
  ];

  const remainingLength = 12 - requiredChars.length;
  for (let i = 0; i < remainingLength; i += 1) {
    requiredChars.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // shuffle the generated password characters
  for (let i = requiredChars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  return requiredChars.join('');
};

export class OfficerService {
  async getById(id: string) {
    const o = await officerRepo.findById(id);
    if (!o) throw new NotFoundError('Officer not found');
    return {
      id: o.id,
      officer_id: o.badge_number ?? o.id,
      full_name: o.full_name,
      email: o.email,
      phone: o.phone,
      role: o.role,
      status: o.status === 'active' ? 'ACTIVE' : 'DISABLED',
      parking_lot_id: o.parking_lot_id,
      tickets_issued: o.tickets_issued ?? 0,
      last_login_at: o.last_login_at,
      created_at: o.created_at,
    };
  }

  async summary(query: Record<string, string | undefined> = {}) {
    return officerRepo.summary({
      parkingLotId: query.parking_lot_id ?? query.parkingLotId ?? query.lotId,
    });
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
      parkingLotId: query.parking_lot_id ?? query.parkingLotId ?? query.lotId,
    });

    const mapped = items.map((o) => ({
      id: o.id,
      officer_id: o.badge_number ?? o.id,
      full_name: o.full_name,
      email: o.email,
      phone: o.phone,
      role: o.role,
      status: o.status === 'active' ? 'ACTIVE' : 'DISABLED',
      parking_lot_id: o.parking_lot_id,
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

  async create(adminId: string, body: { full_name: string; email: string; phone?: string; role: OfficerRole; badge_number?: string; password?: string; parking_lot_id?: string }) {
    if (!body || typeof body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    if (!adminId?.trim()) {
      throw new ValidationError('Administrator context is required');
    }
    const creatorId = adminId.trim();
    const adminUser = await adminRepo.findById(creatorId);
    if (!adminUser) {
      throw new ValidationError('Your admin account was not found. Please sign out and sign in again.');
    }

    if (!body.full_name?.trim()) throw new ValidationError('full_name is required');
    if (!body.email?.trim()) throw new ValidationError('email is required');
    if (!body.role) throw new ValidationError('role is required');

    const roleNorm = String(body.role).trim().toUpperCase();
    if (roleNorm !== 'OFFICER' && roleNorm !== 'SUPERVISOR') {
      throw new ValidationError('role must be OFFICER or SUPERVISOR');
    }
    const role = roleNorm as OfficerRole;

    const rawPassword = body.password?.trim() || generateRandomPassword();
    if (rawPassword.length < 8) throw new ValidationError('password must be at least 8 characters');

    const passwordHash = await bcrypt.hash(rawPassword, env.bcryptSaltRounds);

    try {
      const id = await officerRepo.create({
        createdByAdminId: creatorId,
        fullName: body.full_name,
        email: body.email,
        phone: body.phone,
        badgeNumber: body.badge_number,
        role,
        passwordHash,
        parkingLotId: body.parking_lot_id,
      });

      // Send welcome email with credentials (best-effort)
      try {
        await sendEmail({
          to: body.email,
          subject: 'ParkSmart — Officer Account Created',
          html: officerWelcomeTemplate(body.full_name, body.email, rawPassword, env.officerLoginUrl),
          emailType: 'officer_created',
          relatedId: id,
        });
      } catch (mailErr) {
        console.error('[OfficerService] Failed to send welcome email:', mailErr);
      }

      return { id, password: rawPassword };
    } catch (e: unknown) {
      const err = e as { code?: string; errno?: number; sqlMessage?: string; message?: string };
      if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        const msg = String(err.sqlMessage ?? err.message ?? '').toLowerCase();
        if (msg.includes('email')) {
          throw new ValidationError('Email already exists');
        }
        throw new ValidationError('This officer conflicts with existing data (duplicate unique field)');
      }
      if (err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new ValidationError(
          'Could not create officer because your admin account is not linked correctly. Sign out and sign in again, or contact support.'
        );
      }
      throw e;
    }
  }

  async update(id: string, body: { full_name?: string; phone?: string; role?: OfficerRole; badge_number?: string; parking_lot_id?: string }) {
    const affected = await officerRepo.update(id, {
      fullName: body.full_name,
      phone: body.phone,
      role: body.role,
      badgeNumber: body.badge_number,
      parkingLotId: body.parking_lot_id,
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
