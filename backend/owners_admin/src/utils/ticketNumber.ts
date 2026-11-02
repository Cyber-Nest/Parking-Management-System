import { getMongoDatabase } from '../config/mongodb';

const MIN_TICKET_NUMBER = 10000;
const MAX_TICKET_NUMBER = 99999;

export const normalizeTicketNumberLookup = (ticketNumber: string): string[] => {
  const raw = ticketNumber.trim();
  const upper = raw.toUpperCase();
  const tktMatch = upper.match(/^TKT-(\d{5})$/);
  const numeric = tktMatch?.[1] ?? (upper.match(/^\d{5}$/) ? upper : '');

  return Array.from(new Set([raw, upper, numeric].filter(Boolean)));
};

export const nextNumericTicketNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = String(
      Math.floor(Math.random() * (MAX_TICKET_NUMBER - MIN_TICKET_NUMBER + 1)) +
        MIN_TICKET_NUMBER,
    );
    const existing = await getMongoDatabase().collection('penalty_tickets').findOne({ ticket_number: candidate }, { projection: { _id: 1 } });
    if (!existing) return candidate;
  }

  const rows = await getMongoDatabase().collection<{ ticket_number: string }>('penalty_tickets')
    .find({ ticket_number: { $regex: '^\\d{5}$' } }).project<{ ticket_number: string }>({ ticket_number: 1 }).sort({ ticket_number: 1 }).toArray();
  const used = new Set(rows.map((row) => row.ticket_number));
  for (let n = MIN_TICKET_NUMBER; n <= MAX_TICKET_NUMBER; n += 1) {
    const candidate = String(n);
    if (!used.has(candidate)) return candidate;
  }

  throw new Error('No available 5-digit ticket numbers');
};
