import {
  enforcementRepository,
  EnforcementTicketInput,
  ManualEntryInput,
  OfficerEvidenceInput,
  OfficerEvidenceUpdateInput,
} from '../repositories/enforcement.repository';
import { TicketService } from './ticket.service';
import { NotFoundError, ValidationError } from './commonErrors';
import { ensureCloudinaryUrl, uploadMediaList } from './cloudinary.service';
import { sendEmail, penaltyNoticeTemplate } from '../utils/email';
import { queryRows } from '../config/database';

const ticketService = new TicketService();

const DEFAULT_OFFICER_NAME = 'Officer John';

export class EnforcementService {
  async dashboard(officerId?: string) {
    const data = await enforcementRepository.dashboard(officerId);
    if (officerId) {
      const { officerPortalService } = await import('./officerPortal.service');
      const onDutySeconds = await officerPortalService.getOnDutySecondsForDashboard(officerId);
      return {
        ...data,
        onDutySeconds,
        onDutyMinutes: Math.floor(onDutySeconds / 60),
      };
    }
    return data;
  }

  async scanPlate(plate: string) {
    if (!plate?.trim()) throw new ValidationError('plate is required');
    return enforcementRepository.findPlateStatus(plate);
  }

  async listTickets(query?: any) {
    return enforcementRepository.listTickets({
      limit: this.parseLimit(String(query?.limit ?? '25')),
      officerId: String(query?.officerId ?? '').trim() || undefined,
      status: String(query?.status ?? '').trim() || undefined,
      violationType: String(query?.violationType ?? '').trim() || undefined,
      location: String(query?.location ?? '').trim() || undefined,
      search: String(query?.search ?? '').trim() || undefined,
      fromDate: String(query?.fromDate ?? '').trim() || undefined,
      toDate: String(query?.toDate ?? '').trim() || undefined,
    });
  }

  async listSessions(query?: any) {
    return enforcementRepository.listSessions({
      limit: this.parseLimit(String(query?.limit ?? '100')),
      status: String(query?.status ?? '').trim() || undefined,
      zone: String(query?.zone ?? '').trim() || undefined,
      location: String(query?.location ?? '').trim() || undefined,
      search: String(query?.search ?? '').trim() || undefined,
      sort: String(query?.sort ?? '').trim() || undefined,
    });
  }

  async listEvidence(limit?: string) {
    return enforcementRepository.listEvidence(this.parseLimit(limit));
  }

  async uploadPhoto(body: { photo?: string; label?: string }) {
    const photo = body.photo?.trim();
    if (!photo) throw new ValidationError('photo is required');

    const photoUrl = await ensureCloudinaryUrl(photo, { folder: 'parksmart/evidence' });

    return {
      id: `PHOTO-${Date.now()}`,
      photoUrl,
      label: body.label?.trim() || 'Evidence Photo',
      uploadedAt: new Date().toISOString(),
    };
  }

  async captureEvidence(body: Partial<OfficerEvidenceInput>) {
    if (!body.licensePlate?.trim()) throw new ValidationError('licensePlate is required');
    if (!Array.isArray(body.photos) || body.photos.length === 0) {
      throw new ValidationError('At least one photo is required');
    }

    const fallbackOfficer = await enforcementRepository.findDefaultOfficer();
    const officerId = body.officerId?.trim() || fallbackOfficer?.id;
    if (!officerId) throw new ValidationError('No active officer is available to capture evidence');
    const officerName = body.officerName?.trim() || await this.getOfficerName(officerId) || fallbackOfficer?.full_name || DEFAULT_OFFICER_NAME;

    const photos = await uploadMediaList(body.photos, { folder: 'parksmart/evidence' });

    return enforcementRepository.createStandaloneEvidence({
      officerId,
      officerName,
      licensePlate: body.licensePlate,
      locationName: body.locationName,
      evidenceType: body.evidenceType,
      notes: body.notes,
      photos,
    });
  }

  async updateEvidence(id: string, body: Partial<OfficerEvidenceUpdateInput>) {
    if (!id?.trim()) throw new ValidationError('evidence id is required');
    const data = await enforcementRepository.updateEvidence(id, {
      licensePlate: body.licensePlate,
      locationName: body.locationName,
      reason: body.reason,
      notes: body.notes,
    });
    if (!data) throw new NotFoundError('Evidence not found');
    return data;
  }

  async deleteEvidence(id: string) {
    if (!id?.trim()) throw new ValidationError('evidence id is required');
    const deleted = await enforcementRepository.deleteEvidence(id);
    if (!deleted) throw new NotFoundError('Evidence not found');
    return { id };
  }

  async createManualEntry(body: Partial<ManualEntryInput>) {
    if (!body.licensePlate?.trim()) throw new ValidationError('licensePlate is required');
    const durationMinutes = Number(body.durationMinutes ?? 120);
    if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
      throw new ValidationError('durationMinutes must be a positive number');
    }

    const fallbackOfficer = await enforcementRepository.findDefaultOfficer();
    const officerId = body.officerId?.trim() || fallbackOfficer?.id;
    if (!officerId) throw new ValidationError('No active officer is available to create a manual entry');

    return enforcementRepository.createManualEntry({
      officerId,
      licensePlate: body.licensePlate,
      provinceState: body.provinceState,
      vehicleMake: body.vehicleMake,
      vehicleModel: body.vehicleModel,
      vehicleColor: body.vehicleColor,
      vehicleType: body.vehicleType,
      locationName: body.locationName,
      planName: body.planName,
      durationMinutes,
      notes: body.notes,
    });
  }

  async vehicleHistory(plate: string, limit?: string) {
    if (!plate?.trim()) throw new ValidationError('plate is required');
    return enforcementRepository.vehicleHistory(plate, this.parseLimit(limit));
  }

  async createTicket(body: Partial<EnforcementTicketInput>) {
    if (!body.licensePlate?.trim()) throw new ValidationError('licensePlate is required');
    if (!body.violationType?.trim()) throw new ValidationError('violationType is required');
    if (!Number.isFinite(Number(body.fineAmount)) || Number(body.fineAmount) <= 0) {
      throw new ValidationError('fineAmount must be a positive number');
    }
    if (!Array.isArray(body.photos) || body.photos.length < 3) {
      throw new ValidationError('At least 3 evidence photos are required');
    }

    const fallbackOfficer = await enforcementRepository.findDefaultOfficer();
    const officerId = body.officerId?.trim() || fallbackOfficer?.id;
    if (!officerId) throw new ValidationError('No active officer is available to issue this ticket');
    const officerName = body.officerName?.trim() || await this.getOfficerName(officerId) || fallbackOfficer?.full_name || DEFAULT_OFFICER_NAME;

    const photos = await uploadMediaList(body.photos, { folder: 'parksmart/tickets' });

    const ticket = await enforcementRepository.createTicket({
      officerId,
      officerName,
      licensePlate: body.licensePlate,
      provinceState: body.provinceState,
      vehicleMake: body.vehicleMake,
      vehicleModel: body.vehicleModel,
      vehicleColor: body.vehicleColor,
      vehicleType: body.vehicleType,
      violationType: body.violationType,
      violationSubType: body.violationSubType,
      fineAmount: Number(body.fineAmount),
      lateFee: Number(body.lateFee ?? 0),
      locationName: body.locationName,
      violationDateTime: body.violationDateTime,
      sessionId: body.sessionId,
      officerNotes: body.officerNotes,
      violationDetails: body.violationDetails,
      meterNumber: body.meterNumber,
      zoneArea: body.zoneArea,
      beatArea: body.beatArea,
      photos,
      status: body.status,
    });
    if (!ticket) throw new NotFoundError('Ticket could not be created');

    try {
      let customerEmail: string | undefined;

      // 1. Try to get email from the session if it exists
      if (ticket.session_id) {
        const sessionRows = await queryRows<{ customer_email: string | null }>(
          `SELECT COALESCE(u.email, b.customer_email) AS customer_email
           FROM parking_sessions ps
           LEFT JOIN users u ON u.id = ps.user_id
           LEFT JOIN bookings b
             ON REPLACE(REPLACE(UPPER(b.vehicle_plate_number), ' ', ''), '-', '') = REPLACE(REPLACE(UPPER(ps.license_plate), ' ', ''), '-', '')
            AND b.start_time <= ps.end_time
            AND b.end_time >= ps.start_time
           WHERE ps.id = ?
           LIMIT 1`,
          [ticket.session_id]
        );
        if (sessionRows[0]?.customer_email) {
          customerEmail = sessionRows[0].customer_email;
        }
      }

      // 2. Fallback to latest booking by plate
      if (!customerEmail) {
        const userRows = await queryRows<{ email: string }>(
          `SELECT customer_email AS email
           FROM bookings 
           WHERE REPLACE(REPLACE(UPPER(vehicle_plate_number), ' ', ''), '-', '') = REPLACE(REPLACE(UPPER(?), ' ', ''), '-', '')
           ORDER BY start_time DESC 
           LIMIT 1`,
          [ticket.license_plate]
        );
        if (userRows[0]?.email) {
          customerEmail = userRows[0].email;
        }
      }

      // 3. Fallback to latest app session by plate
      if (!customerEmail) {
        const sessionUserRows = await queryRows<{ email: string }>(
          `SELECT u.email
           FROM parking_sessions ps
           JOIN users u ON u.id = ps.user_id
           WHERE REPLACE(REPLACE(UPPER(ps.license_plate), ' ', ''), '-', '') = REPLACE(REPLACE(UPPER(?), ' ', ''), '-', '')
             AND u.email IS NOT NULL
           ORDER BY ps.start_time DESC
           LIMIT 1`,
          [ticket.license_plate]
        );
        if (sessionUserRows[0]?.email) {
          customerEmail = sessionUserRows[0].email;
        }
      }
      
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Parks-Smart Citation Issued - Ticket #${ticket.ticket_number}`,
          html: penaltyNoticeTemplate({
            customerEmail,
            licensePlate: ticket.license_plate,
            ticketNumber: ticket.ticket_number,
            amount: Number(ticket.amount),
            reason: ticket.reason,
            location: ticket.location_name || 'Unknown Location',
            issuedAt: ticket.date_issued ? new Date(ticket.date_issued).toLocaleString() : new Date().toLocaleString(),
            dueDate: ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : 'Upon receipt',
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
          }),
          emailType: 'penalty_notice',
          relatedId: ticket.id
        });
      }
    } catch (emailErr) {
      console.error('[EnforcementService] Failed to send penalty notice email:', emailErr);
    }

    return ticket;
  }

  async payTicket(id: string, body: { payment_method?: string; transaction_ref?: string; customer_email?: string }) {
    if (!id?.trim()) throw new ValidationError('ticket id is required');
    return ticketService.markPaid(id, {
      payment_method: body.payment_method,
      transaction_ref: body.transaction_ref,
      customer_email: body.customer_email,
    });
  }

  async addTicketEvidence(id: string, body: { photos?: string[]; note?: string }) {
    if (!id?.trim()) throw new ValidationError('ticket id is required');
    if (!Array.isArray(body.photos) || body.photos.length === 0) {
      throw new ValidationError('At least one evidence photo is required');
    }

    const ticket = await enforcementRepository.findTicketById(id);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const photos = await uploadMediaList(
      body.photos.filter((p) => p?.trim()).map((p) => p.trim()),
      { folder: 'parksmart/tickets' },
    );

    for (const photoUrl of photos) {
      await enforcementRepository.attachTicketPhoto(id, photoUrl);
    }

    if (body.note?.trim()) {
      await ticketService.addNote(id, body.note.trim());
    }

    return { ticketId: id, photos };
  }

  async reviewTicket(id: string, note?: string) {
    if (!id?.trim()) throw new ValidationError('ticket id is required');
    const ticket = await ticketService.getById(id);
    if (!ticket) throw new NotFoundError('Ticket not found');
    const reviewNote = note?.trim() || 'Review requested by officer';

    if (ticket.status === 'paid') {
      throw new ValidationError(
        'Reviews cannot be sent for paid tickets. Only unpaid or disputed tickets can be sent for review.',
      );
    }
    if (ticket.status === 'cancelled') {
      throw new ValidationError('Reviews cannot be sent for cancelled tickets.');
    }
    if (ticket.status === 'resolved') {
      throw new ValidationError('Reviews cannot be sent for resolved tickets.');
    }

    if (ticket.status === 'disputed') {
      await ticketService.addNote(id, reviewNote);
      return ticketService.getById(id);
    }

    const data = await ticketService.disputeTicket(ticket.ticket_number, reviewNote);
    await ticketService.addNote(id, reviewNote);
    return data;
  }

  async createTicketsBatch(items: Partial<EnforcementTicketInput>[]) {
    const results: Array<{ success: boolean; id?: string; error?: string }> = [];
    for (const item of items) {
      try {
        const ticket = await this.createTicket(item);
        results.push({ success: true, id: ticket.id });
      } catch (err: any) {
        results.push({ success: false, error: err?.message ?? String(err) });
      }
    }
    return results;
  }

  async getPrintPayload(id: string) {
    const ticket = await enforcementRepository.findTicketById(id);
    if (!ticket) throw new NotFoundError('Ticket not found');

    let details: Record<string, unknown> = {};
    try {
      details = ticket.remarks ? JSON.parse(ticket.remarks) : {};
    } catch {
      details = {};
    }

    return {
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      issuedAt: ticket.date_issued,
      dueDate: ticket.due_date,
      officerName: ticket.officer_name,
      officerId: ticket.officer_id,
      licensePlate: ticket.license_plate,
      locationName: ticket.location_name,
      violationType: ticket.reason,
      totalAmount: Number(ticket.amount),
      status: ticket.status,
      details,
      photos: ticket.photos,
      receiptLines: [
        'PARKSMART ENFORCEMENT',
        'PARKING VIOLATION NOTICE',
        `Ticket #: ${ticket.ticket_number}`,
        `Plate: ${ticket.license_plate}`,
        `Violation: ${ticket.reason}`,
        `Total Due: $${Number(ticket.amount).toFixed(2)} CAD`,
      ],
    };
  }

  private parseLimit(limit?: string) {
    return Math.min(100, Math.max(1, Number(limit ?? 25) || 25));
  }

  private async getOfficerName(officerId: string): Promise<string | null> {
    try {
      const { officerPortalService } = await import('./officerPortal.service');
      const profile = await officerPortalService.getProfile(officerId);
      return profile.fullName || null;
    } catch {
      return null;
    }
  }
}

export const enforcementService = new EnforcementService();
