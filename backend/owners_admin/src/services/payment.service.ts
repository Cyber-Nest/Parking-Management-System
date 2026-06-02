import { PaymentRepository, PaymentRow } from '../repositories/payment.repository';
import { CreatePaymentBody, PaginatedResponse, PaymentPublic, PaymentStatus } from '../types';
import { ValidationError, NotFoundError } from './commonErrors';

const paymentRepo = new PaymentRepository();

export class PaymentService {
  async list(query: Record<string, string | undefined>): Promise<PaginatedResponse<PaymentPublic>> {
    const page = Math.max(1, Number(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));

    const { items, total } = await paymentRepo.list({
      page,
      limit,
      q: query.q?.trim() || undefined,
      status: (query.status as PaymentStatus) || undefined,
      paymentMethod: query.payment_method as any,
      paymentType: query.payment_type as any,
      from: query.from,
      to: query.to,
      parkingLotId: query.parking_lot_id ?? query.parkingLotId ?? query.lotId,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async summary(query: Record<string, string | undefined> = {}) {
    return paymentRepo.summary({
      parkingLotId: query.parking_lot_id ?? query.parkingLotId ?? query.lotId,
    });
  }

  async create(body: CreatePaymentBody & { status?: PaymentStatus; user_id?: string; paid_at?: string }) {
    if (!body.license_plate?.trim()) throw new ValidationError('license_plate is required');
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      throw new ValidationError('amount must be a positive number');
    }
    if (!body.payment_method) throw new ValidationError('payment_method is required');
    if (!body.payment_type) throw new ValidationError('payment_type is required');

    const id = await paymentRepo.create({
      sessionId: body.session_id,
      ticketId: body.ticket_id,
      userId: body.user_id,
      licensePlate: body.license_plate,
      amount: body.amount,
      paymentMethod: body.payment_method,
      paymentType: body.payment_type,
      status: body.status,
      transactionRef: body.transaction_ref,
      paidAt: body.paid_at,
    });

    return { id };
  }

  async getById(id: string) {
    const row = await paymentRepo.findById(id);
    if (!row) throw new NotFoundError('Payment not found');
    return row;
  }

  getReceiptPayload(row: PaymentRow) {
    const subtotal = Number(row.amount);
    return {
      receipt_id: row.id,
      receipt_number: row.receipt_number,
      license_plate: row.license_plate,
      amount: subtotal,
      payment_method: row.payment_method,
      payment_type: row.payment_type,
      status: row.status,
      transaction_ref: row.transaction_ref,
      paid_at: row.paid_at,
      receipt_date: row.receipt_date,
      created_at: row.created_at,
      session_id: row.session_id,
      ticket_id: row.ticket_id,
      line_items: [
        { description: `${row.payment_type} payment`, amount: subtotal },
      ],
      total: subtotal,
    };
  }
}
