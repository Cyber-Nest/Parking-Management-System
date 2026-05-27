import { CreateTicketBody, PaginatedResponse, TicketPublic, TicketStatus } from '../types';
import { TicketRepository } from '../repositories/ticket.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { NotFoundError, ValidationError } from './commonErrors';
import { sendEmail, penaltyPaymentTemplate } from '../utils/email';
import { normalizePaymentMethod } from '../utils/paymentMethod';
import { env } from '../config/env';
import { invoiceService } from './invoice.service';

const ticketRepo = new TicketRepository();
const paymentRepo = new PaymentRepository();

export class TicketService {
  private async getOrCreatePenaltyInvoice(
    ticket: {
      id: string;
      ticket_number: string;
      license_plate: string;
      amount: number;
      reason: string;
      payment_id?: string | null;
    },
    customerEmail?: string,
  ) {
    const existingByPenalty = await invoiceService.getInvoiceByPenaltyId(ticket.id);
    if (existingByPenalty) return existingByPenalty;

    const invoice = await invoiceService.createInvoice({
      customerEmail: customerEmail?.trim() || 'no-reply@parksmart.com',
      itemDescription: `Penalty payment for ticket ${ticket.ticket_number}`,
      itemType: 'penalty',
      quantity: 1,
      unitPrice: Number(ticket.amount),
      subtotal: Number(ticket.amount),
      taxAmount: 0,
      serviceFee: 0,
      totalAmount: Number(ticket.amount),
      penaltyId: ticket.id,
    });

    if (invoice?.id) {
      await invoiceService.markAsPaid(invoice.id, Number(ticket.amount));
    }

    return invoice;
  }

  private async sendPenaltyPaymentEmail(
    ticket: {
      id: string;
      ticket_number: string;
      license_plate: string;
      amount: number;
      reason: string;
    },
    customerEmail: string,
    paymentMethod: string,
    paidAt: string,
    invoice: Awaited<ReturnType<typeof invoiceService.createInvoice>> | null,
  ) {
    const emailHtml = penaltyPaymentTemplate({
      customerEmail,
      licensePlate: ticket.license_plate,
      ticketNumber: ticket.ticket_number,
      amount: Number(ticket.amount),
      paymentMethod: paymentMethod.toUpperCase(),
      paidAt: new Date(paidAt).toLocaleString(),
      reason: ticket.reason,
      receiptUrl: invoice?.id
        ? `${env.frontendUrl.replace(/\/$/, '')}/receipt/${invoice.id}`
        : undefined,
      invoiceNumber: invoice?.invoice_number,
    });

    const attachments = [];
    if (invoice?.pdf_file_path) {
      attachments.push({
        filename: `receipt-${invoice.invoice_number}.pdf`,
        path: invoice.pdf_file_path,
      });
    }

    await sendEmail({
      to: customerEmail,
      subject: `ParkSmart Penalty Payment Confirmed - Ticket #${ticket.ticket_number}`,
      html: emailHtml,
      emailType: 'penalty_payment',
      relatedId: ticket.id,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  }

  async ensurePenaltyReceipt(ticketId: string, customerEmail?: string) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    if (ticket.status !== 'paid') return null;
    return this.getOrCreatePenaltyInvoice(ticket, customerEmail);
  }

  async list(query: Record<string, string | undefined>): Promise<PaginatedResponse<TicketPublic>> {
    const page = Math.max(1, Number(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));

    const { items, total } = await ticketRepo.list({
      page,
      limit,
      q: query.q?.trim() || undefined,
      status: (query.status as TicketStatus) || undefined,
      officerId: query.officer_id,
      from: query.from,
      to: query.to,
    });

    const mapped: TicketPublic[] = items.map((t) => ({
      id: t.id,
      ticket_number: t.ticket_number,
      officer_id: t.officer_id,
      officer_name: t.officer_name,
      license_plate: t.license_plate,
      amount: t.amount,
      reason: t.reason,
      status: t.status,
      date_issued: t.date_issued,
      due_date: t.due_date,
      paid_at: t.paid_at,
      remarks: t.remarks,
      note: t.note,
      dispute_raised: t.dispute_raised === 1,
      photos: [],
      location_name: t.location_name ?? null,
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
    return ticketRepo.summary();
  }

  async create(body: CreateTicketBody & { officer_id: string; officer_name: string; status?: TicketStatus; remarks?: string }) {
    if (!body.officer_id) throw new ValidationError('officer_id is required');
    if (!body.officer_name?.trim()) throw new ValidationError('officer_name is required');
    if (!body.license_plate?.trim()) throw new ValidationError('license_plate is required');
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      throw new ValidationError('amount must be a positive number');
    }
    if (!body.reason?.trim()) throw new ValidationError('reason is required');

    const id = await ticketRepo.create({
      officerId: body.officer_id,
      officerName: body.officer_name,
      licensePlate: body.license_plate,
      amount: body.amount,
      reason: body.reason,
      status: body.status,
      dueDate: body.due_date,
      sessionId: body.session_id,
      remarks: body.remarks,
    });

    return { id };
  }

  /** Flat payload for admin print / reprint (same pattern as payment receipt). */
  getPrintPayload(t: TicketPublic): Record<string, unknown> {
    return {
      ticket_id: t.id,
      ticket_number: t.ticket_number,
      license_plate: t.license_plate,
      violation: t.reason,
      amount: t.amount,
      status: t.status,
      officer_name: t.officer_name,
      location_name: t.location_name,
      date_issued: t.date_issued,
      due_date: t.due_date,
      paid_at: t.paid_at,
      remarks: t.remarks,
      note: t.note,
    };
  }

  async getById(id: string): Promise<TicketPublic> {
    const t = await ticketRepo.findById(id);
    if (!t) throw new NotFoundError('Ticket not found');
    return {
      id: t.id,
      ticket_number: t.ticket_number,
      officer_id: t.officer_id,
      officer_name: t.officer_name,
      license_plate: t.license_plate,
      amount: t.amount,
      reason: t.reason,
      status: t.status,
      date_issued: t.date_issued,
      due_date: t.due_date,
      paid_at: t.paid_at,
      remarks: t.remarks,
      note: t.note,
      dispute_raised: t.dispute_raised === 1,
      photos: [],
      location_name: t.location_name ?? null,
    };
  }

  async getByTicketNumber(ticketNumber: string): Promise<TicketPublic> {
    const t = await ticketRepo.findByTicketNumber(ticketNumber);
    if (!t) throw new NotFoundError('Ticket not found');
    return {
      id: t.id,
      ticket_number: t.ticket_number,
      officer_id: t.officer_id,
      officer_name: t.officer_name,
      license_plate: t.license_plate,
      amount: t.amount,
      reason: t.reason,
      status: t.status,
      date_issued: t.date_issued,
      due_date: t.due_date,
      paid_at: t.paid_at,
      remarks: t.remarks,
      note: t.note,
      dispute_raised: t.dispute_raised === 1,
      photos: [],
      location_name: t.location_name ?? null,
    };
  }

  async disputeTicket(ticketNumber: string, disputeMessage: string): Promise<TicketPublic> {
    const ticket = await ticketRepo.findByTicketNumber(ticketNumber);
    if (!ticket) throw new NotFoundError('Ticket not found');
    if (ticket.status === 'paid' || ticket.status === 'cancelled') {
      throw new ValidationError('Cannot dispute a paid or cancelled ticket');
    }
    await ticketRepo.raiseDispute(ticket.id, disputeMessage);
    return this.getById(ticket.id);
  }

  async updateTicket(
    id: string,
    body: {
      license_plate?: string;
      amount?: number;
      reason?: string;
      due_date?: string | null;
      location_name?: string | null;
    }
  ): Promise<TicketPublic> {
    const existing = await ticketRepo.findById(id);
    if (!existing) throw new NotFoundError('Ticket not found');
    if (existing.status === 'paid' || existing.status === 'cancelled') {
      throw new ValidationError('Cannot edit a paid or cancelled ticket');
    }
    await ticketRepo.updateTicket(id, {
      licensePlate: body.license_plate,
      amount: body.amount,
      reason: body.reason,
      dueDate: body.due_date,
      locationName: body.location_name,
    });
    return this.getById(id);
  }

  async addNote(id: string, note: string): Promise<void> {
    if (!note?.trim()) throw new ValidationError('note is required');
    const n = await ticketRepo.appendRemarks(id, note.trim());
    if (n === 0) throw new NotFoundError('Ticket not found');
  }

  async cancelTicket(id: string): Promise<void> {
    const t = await ticketRepo.findById(id);
    if (!t) throw new NotFoundError('Ticket not found');
    if (t.status === 'paid') throw new ValidationError('Cannot cancel a paid ticket');
    if (t.status === 'cancelled') return;
    await ticketRepo.setStatus(id, 'cancelled');
  }

  async markPaid(
    id: string,
    body?: { payment_method?: string; transaction_ref?: string; customer_email?: string },
  ): Promise<{ payment_id: string; invoice_id?: string; invoice_number?: string }> {
    const t = await ticketRepo.findById(id);
    if (!t) throw new NotFoundError('Ticket not found');
    const method = normalizePaymentMethod(body?.payment_method, 'cash');

    if (t.status === 'paid') {
      const invoice = await this.getOrCreatePenaltyInvoice(t, body?.customer_email);
      if (body?.customer_email) {
        try {
          await this.sendPenaltyPaymentEmail(
            t,
            body.customer_email,
            method,
            t.paid_at ? new Date(t.paid_at).toISOString() : new Date().toISOString(),
            invoice,
          );
        } catch (emailError) {
          console.error('[TicketService] Failed to resend penalty payment email:', emailError);
        }
      }
      return {
        payment_id: t.payment_id ?? '',
        invoice_id: invoice?.id,
        invoice_number: invoice?.invoice_number,
      };
    }

    if (t.status !== 'unpaid' && t.status !== 'disputed') {
      throw new ValidationError('Only unpaid or disputed tickets can be marked paid');
    }
    const paidAtStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const paymentId = await paymentRepo.create({
      ticketId: id,
      licensePlate: t.license_plate,
      amount: Number(t.amount),
      paymentMethod: method,
      paymentType: 'penalty',
      status: 'success',
      transactionRef: body?.transaction_ref ?? `ADMIN-${Date.now()}`,
      paidAt: paidAtStr,
    });
    await ticketRepo.setStatus(id, 'paid', { paymentId });

    let invoice: Awaited<ReturnType<typeof invoiceService.createInvoice>> | null = null;
    try {
      invoice = await this.getOrCreatePenaltyInvoice({ ...t, payment_id: paymentId }, body?.customer_email);
    } catch (invoiceError) {
      console.error('[TicketService] Penalty invoice creation failed:', invoiceError);
    }

    // Send penalty payment confirmation email if customer email is available
    if (body?.customer_email) {
      try {
        await this.sendPenaltyPaymentEmail(t, body.customer_email, method, paidAtStr, invoice);

        console.log(`[TicketService] Penalty payment confirmation sent to ${body.customer_email}` +
          (invoice?.pdf_file_path ? ' with receipt PDF' : ''));
      } catch (emailError) {
        console.error('[TicketService] Failed to send penalty payment email:', emailError);
      }
    }

    return {
      payment_id: paymentId,
      invoice_id: invoice?.id,
      invoice_number: invoice?.invoice_number,
    };
  }
}
