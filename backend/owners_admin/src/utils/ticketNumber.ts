import { queryRows } from '../config/database';

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
    const rows = await queryRows<{ total: number }>(
      `SELECT COUNT(*) AS total FROM penalty_tickets WHERE ticket_number = ?`,
      [candidate],
    );
    if (Number(rows[0]?.total ?? 0) === 0) return candidate;
  }

  const rows = await queryRows<{ ticket_number: string }>(
    `SELECT ticket_number
     FROM penalty_tickets
     WHERE ticket_number REGEXP '^[0-9]{5}$'
     ORDER BY ticket_number ASC`,
  );
  const used = new Set(rows.map((row) => row.ticket_number));
  for (let n = MIN_TICKET_NUMBER; n <= MAX_TICKET_NUMBER; n += 1) {
    const candidate = String(n);
    if (!used.has(candidate)) return candidate;
  }

  throw new Error('No available 5-digit ticket numbers');
};
