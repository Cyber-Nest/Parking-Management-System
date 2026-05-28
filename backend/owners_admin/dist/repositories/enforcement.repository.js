"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforcementRepository = exports.EnforcementRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class EnforcementRepository {
    constructor() {
        this.evidenceTableReady = false;
        this.photoCapacityReady = false;
    }
    async nextTicketNumber() {
        const rows = await (0, database_1.queryRows)(`SELECT MAX(CAST(SUBSTRING(ticket_number, 5) AS UNSIGNED)) AS max_number
       FROM penalty_tickets
       WHERE ticket_number REGEXP '^TKT-[0-9]+$'`);
        const next = Number(rows[0]?.max_number ?? 0) + 1;
        return `TKT-${String(next).padStart(3, '0')}`;
    }
    async ensureStandaloneEvidenceTable() {
        if (this.evidenceTableReady)
            return;
        await (0, database_1.execute)(`CREATE TABLE IF NOT EXISTS officer_evidence (
        id CHAR(36) PRIMARY KEY,
        officer_id CHAR(36) NULL,
        officer_name VARCHAR(191) NOT NULL,
        license_plate VARCHAR(50) NOT NULL,
        location_name VARCHAR(150) NULL,
        evidence_type VARCHAR(100) NOT NULL DEFAULT 'general',
        notes TEXT NULL,
        photo_url LONGTEXT NOT NULL,
        photo_taken_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_officer_evidence_plate (license_plate),
        INDEX idx_officer_evidence_uploaded_at (uploaded_at)
      )`);
        this.evidenceTableReady = true;
    }
    async ensurePhotoCapacity() {
        if (this.photoCapacityReady)
            return;
        await (0, database_1.execute)(`ALTER TABLE ticket_photos MODIFY photo_url LONGTEXT NOT NULL`);
        this.photoCapacityReady = true;
    }
    async findDefaultOfficer() {
        const rows = await (0, database_1.queryRows)(`SELECT id, full_name
       FROM officers
       WHERE status = 'active'
       ORDER BY created_at ASC
       LIMIT 1`);
        return rows[0] ?? null;
    }
    async dashboard(_officerId) {
        const [ticketsToday, activeSessions, collectedToday, recentScans, activeSession, summaryRows] = await Promise.all([
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM penalty_tickets WHERE DATE(date_issued) = CURDATE()`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'active' AND end_time >= NOW()`),
            (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total
         FROM payments
         WHERE status = 'success' AND DATE(COALESCE(paid_at, created_at)) = CURDATE()`),
            (0, database_1.queryRows)(`SELECT license_plate, location_name, start_time AS checked_at, 'valid' AS scan_status
         FROM parking_sessions
         ORDER BY start_time DESC
         LIMIT 5`),
            (0, database_1.queryRows)(`SELECT id, license_plate, plan_name, location_name, start_time, end_time, duration_minutes,
                status, notes, created_by_officer, created_at
         FROM parking_sessions
         WHERE status = 'active' AND end_time >= NOW()
         ORDER BY end_time ASC
         LIMIT 1`),
            (0, database_1.queryRows)(`SELECT reason, COUNT(*) AS total
         FROM penalty_tickets
         WHERE DATE(date_issued) = CURDATE()
         GROUP BY reason
         ORDER BY total DESC`),
        ]);
        return {
            ticketsToday: Number(ticketsToday[0]?.total ?? 0),
            activeSessions: Number(activeSessions[0]?.total ?? 0),
            collectedToday: Number(collectedToday[0]?.total ?? 0),
            onDutyMinutes: 0,
            onDutySeconds: 0,
            recentScans,
            activeSession: activeSession[0] ?? null,
            violationSummary: summaryRows,
        };
    }
    async findPlateStatus(plate) {
        const normalized = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const [sessions, tickets] = await Promise.all([
            (0, database_1.queryRows)(`SELECT ps.id, ps.license_plate, ps.plan_name, ps.location_name, ps.start_time, ps.end_time,
                ps.duration_minutes, ps.status, ps.notes, ps.created_by_officer, ps.created_at, ps.user_id,
                COALESCE(u.username, u.email) AS customer_name,
                u.email AS customer_email,
                (SELECT p.amount FROM payments p
                 WHERE p.session_id = ps.id AND p.status = 'success'
                 ORDER BY p.paid_at DESC LIMIT 1) AS amount_paid,
                (SELECT p.payment_method FROM payments p
                 WHERE p.session_id = ps.id AND p.status = 'success'
                 ORDER BY p.paid_at DESC LIMIT 1) AS payment_method,
                (SELECT p.paid_at FROM payments p
                 WHERE p.session_id = ps.id AND p.status = 'success'
                 ORDER BY p.paid_at DESC LIMIT 1) AS paid_at
         FROM parking_sessions ps
         LEFT JOIN users u ON u.id = ps.user_id
         WHERE REPLACE(REPLACE(UPPER(ps.license_plate), ' ', ''), '-', '') = ?
         ORDER BY ps.start_time DESC
         LIMIT 1`, [normalized]),
            (0, database_1.queryRows)(`SELECT id, ticket_number, officer_id, officer_name, session_id, license_plate, location_name,
                amount, reason, status, date_issued, due_date, remarks, note, created_at
         FROM penalty_tickets
         WHERE REPLACE(REPLACE(UPPER(license_plate), ' ', ''), '-', '') = ?
         ORDER BY date_issued DESC
         LIMIT 5`, [normalized]),
        ]);
        const session = sessions[0] ?? null;
        const now = Date.now();
        const validSession = session && session.status === 'active' && new Date(session.end_time).getTime() >= now;
        const openTicket = tickets.find((t) => t.status === 'unpaid' || t.status === 'disputed') ?? null;
        const customer = session
            ? {
                user_id: session.user_id ?? null,
                name: session.customer_name?.trim() || 'Guest / Walk-in',
                email: session.customer_email ?? null,
            }
            : null;
        let status;
        if (validSession) {
            status = 'valid';
        }
        else if (session) {
            status = 'expired';
        }
        else if (openTicket) {
            status = 'violation';
        }
        else {
            status = 'not_found';
        }
        return {
            plate: normalized,
            status,
            session,
            openTicket,
            recentTickets: tickets,
            customer,
        };
    }
    async listTickets(query = {}) {
        const conditions = [];
        const values = [];
        if (query.status) {
            conditions.push('status = ?');
            values.push(query.status);
        }
        if (query.violationType) {
            conditions.push('reason LIKE ?');
            values.push(`%${query.violationType}%`);
        }
        if (query.location) {
            conditions.push('location_name LIKE ?');
            values.push(`%${query.location}%`);
        }
        if (query.search) {
            const searchTerm = `%${query.search}%`;
            conditions.push('(ticket_number LIKE ? OR license_plate LIKE ? OR reason LIKE ? OR location_name LIKE ?)');
            values.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (query.fromDate) {
            conditions.push('DATE(date_issued) >= ?');
            values.push(query.fromDate);
        }
        if (query.toDate) {
            conditions.push('DATE(date_issued) <= ?');
            values.push(query.toDate);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = Number(query.limit ?? 25);
        return (0, database_1.queryRows)(`SELECT id, ticket_number, officer_id, officer_name, session_id, license_plate, location_name,
              amount, reason, status, date_issued, due_date, remarks, note, created_at
       FROM penalty_tickets
       ${whereClause}
       ORDER BY date_issued DESC
       LIMIT ?`, [...values, limit]);
    }
    async listSessions(query = {}) {
        const conditions = [];
        const values = [];
        conditions.push('end_time > NOW()');
        if (query.status) {
            if (query.status === 'active') {
                conditions.push("status = 'active'");
            }
            else if (query.status === 'expiring_soon') {
                conditions.push("status = 'active'");
                conditions.push('end_time <= DATE_ADD(NOW(), INTERVAL 10 MINUTE)');
            }
            else if (query.status === 'issue') {
                conditions.push("status = 'issue'");
            }
        }
        else {
            conditions.push("status = 'active'");
        }
        if (query.zone) {
            conditions.push('(plan_name LIKE ? OR location_name LIKE ?)');
            values.push(`%${query.zone}%`, `%${query.zone}%`);
        }
        if (query.location) {
            conditions.push('location_name LIKE ?');
            values.push(`%${query.location}%`);
        }
        if (query.search) {
            const searchTerm = `%${query.search}%`;
            conditions.push('(license_plate LIKE ? OR id LIKE ? OR location_name LIKE ? OR plan_name LIKE ?)');
            values.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        const orderBy = query.sort === 'Expiry Time Soonest'
            ? 'ORDER BY end_time ASC'
            : query.sort === 'Plate Number'
                ? 'ORDER BY license_plate ASC'
                : query.sort === 'Amount'
                    ? 'ORDER BY amount_paid DESC'
                    : 'ORDER BY start_time DESC';
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = Number(query.limit ?? 100);
        return (0, database_1.queryRows)(`SELECT id, license_plate, plan_name, location_name, start_time, end_time, duration_minutes,
              status, notes, created_by_officer, created_at,
              COALESCE((SELECT SUM(amount) FROM payments p WHERE p.session_id = parking_sessions.id AND p.status = 'success'), 0) AS amount_paid,
              (SELECT payment_method FROM payments p WHERE p.session_id = parking_sessions.id AND p.status = 'success' ORDER BY paid_at DESC LIMIT 1) AS payment_method,
              CASE WHEN created_by_officer IS NOT NULL THEN 'ADMIN' ELSE 'APP' END AS source
       FROM parking_sessions
       ${whereClause}
       ${orderBy}
       LIMIT ?`, [...values, limit]);
    }
    async listEvidence(limit = 50) {
        await this.ensureStandaloneEvidenceTable();
        return (0, database_1.queryRows)(`(SELECT p.id, p.ticket_id, t.ticket_number, t.license_plate, t.reason,
               p.photo_url, p.photo_taken_at, p.uploaded_at, 'ticket' AS source,
               t.location_name, t.officer_name, t.note AS notes
        FROM ticket_photos p
        INNER JOIN penalty_tickets t ON t.id = p.ticket_id)
       UNION ALL
       (SELECT e.id, NULL AS ticket_id, NULL AS ticket_number, e.license_plate,
               e.evidence_type AS reason, e.photo_url, e.photo_taken_at, e.uploaded_at,
               'standalone' AS source, e.location_name, e.officer_name, e.notes
        FROM officer_evidence e)
       ORDER BY uploaded_at DESC
       LIMIT ?`, [limit]);
    }
    async createStandaloneEvidence(input) {
        await this.ensureStandaloneEvidenceTable();
        const normalizedPlate = input.licensePlate.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
        const rows = [];
        for (const photoUrl of input.photos) {
            const id = crypto_1.default.randomUUID();
            await (0, database_1.execute)(`INSERT INTO officer_evidence
         (id, officer_id, officer_name, license_plate, location_name, evidence_type, notes, photo_url, photo_taken_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                id,
                input.officerId,
                input.officerName,
                normalizedPlate,
                input.locationName ?? null,
                input.evidenceType ?? 'general',
                input.notes ?? null,
                photoUrl,
            ]);
            rows.push({
                id,
                ticket_id: null,
                ticket_number: null,
                license_plate: normalizedPlate,
                reason: input.evidenceType ?? 'general',
                photo_url: photoUrl,
                photo_taken_at: new Date(),
                uploaded_at: new Date(),
                source: 'standalone',
                location_name: input.locationName ?? null,
                officer_name: input.officerName,
                notes: input.notes ?? null,
            });
        }
        return rows;
    }
    async updateEvidence(id, input) {
        await this.ensureStandaloneEvidenceTable();
        const standalone = await (0, database_1.queryRows)(`SELECT id, NULL AS ticket_id, NULL AS ticket_number, license_plate, evidence_type AS reason,
              photo_url, photo_taken_at, uploaded_at, 'standalone' AS source, location_name, officer_name, notes
       FROM officer_evidence
       WHERE id = ?
       LIMIT 1`, [id]);
        const normalizedPlate = input.licensePlate?.trim()
            ? input.licensePlate.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
            : undefined;
        if (standalone[0]) {
            await (0, database_1.execute)(`UPDATE officer_evidence
         SET license_plate = COALESCE(?, license_plate),
             location_name = ?,
             evidence_type = COALESCE(?, evidence_type),
             notes = ?
         WHERE id = ?`, [
                normalizedPlate ?? null,
                input.locationName?.trim() || null,
                input.reason?.trim() || null,
                input.notes?.trim() || null,
                id,
            ]);
        }
        else {
            const ticketPhoto = await (0, database_1.queryRows)(`SELECT ticket_id FROM ticket_photos WHERE id = ? LIMIT 1`, [id]);
            if (!ticketPhoto[0])
                return null;
            await (0, database_1.execute)(`UPDATE penalty_tickets
         SET license_plate = COALESCE(?, license_plate),
             location_name = ?,
             reason = COALESCE(?, reason),
             note = ?
         WHERE id = ?`, [
                normalizedPlate ?? null,
                input.locationName?.trim() || null,
                input.reason?.trim() || null,
                input.notes?.trim() || null,
                ticketPhoto[0].ticket_id,
            ]);
        }
        const rows = await this.listEvidence(200);
        return rows.find((row) => row.id === id) ?? null;
    }
    async deleteEvidence(id) {
        await this.ensureStandaloneEvidenceTable();
        const standaloneResult = await (0, database_1.execute)(`DELETE FROM officer_evidence WHERE id = ?`, [id]);
        if (standaloneResult.affectedRows > 0)
            return true;
        const ticketPhotoResult = await (0, database_1.execute)(`DELETE FROM ticket_photos WHERE id = ?`, [id]);
        return ticketPhotoResult.affectedRows > 0;
    }
    async createManualEntry(input) {
        const id = crypto_1.default.randomUUID();
        const now = new Date();
        const durationMinutes = Number(input.durationMinutes ?? 120);
        const end = new Date(now.getTime() + durationMinutes * 60 * 1000);
        const details = JSON.stringify({
            provinceState: input.provinceState ?? '',
            vehicleMake: input.vehicleMake ?? '',
            vehicleModel: input.vehicleModel ?? '',
            vehicleColor: input.vehicleColor ?? '',
            vehicleType: input.vehicleType ?? '',
        });
        const notesPayload = details;
        await (0, database_1.execute)(`INSERT INTO parking_sessions
       (id, license_plate, plan_name, location_name, start_time, end_time, duration_minutes, status, notes, created_by_officer)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`, [
            id,
            input.licensePlate.trim().toUpperCase(),
            input.planName ?? 'Manual Entry',
            input.locationName ?? null,
            now.toISOString().slice(0, 19).replace('T', ' '),
            end.toISOString().slice(0, 19).replace('T', ' '),
            durationMinutes,
            notesPayload,
            input.officerId,
        ]);
        const rows = await (0, database_1.queryRows)(`SELECT id, license_plate, plan_name, location_name, start_time, end_time, duration_minutes,
              status, notes, created_by_officer, created_at
       FROM parking_sessions
       WHERE id = ?
       LIMIT 1`, [id]);
        return rows[0];
    }
    async vehicleHistory(plate, limit = 10) {
        await this.ensureStandaloneEvidenceTable();
        const normalized = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const [sessions, tickets, evidence] = await Promise.all([
            (0, database_1.queryRows)(`SELECT ps.id, ps.license_plate, ps.plan_name, ps.location_name, ps.start_time, ps.end_time,
                ps.duration_minutes, ps.status, ps.notes, ps.created_by_officer, ps.created_at, ps.user_id,
                COALESCE(u.username, u.email) AS customer_name,
                u.email AS customer_email,
                (SELECT p.amount FROM payments p
                 WHERE p.session_id = ps.id AND p.status = 'success'
                 ORDER BY p.paid_at DESC LIMIT 1) AS amount_paid,
                (SELECT p.payment_method FROM payments p
                 WHERE p.session_id = ps.id AND p.status = 'success'
                 ORDER BY p.paid_at DESC LIMIT 1) AS payment_method,
                (SELECT p.paid_at FROM payments p
                 WHERE p.session_id = ps.id AND p.status = 'success'
                 ORDER BY p.paid_at DESC LIMIT 1) AS paid_at
         FROM parking_sessions ps
         LEFT JOIN users u ON u.id = ps.user_id
         WHERE REPLACE(REPLACE(UPPER(ps.license_plate), ' ', ''), '-', '') = ?
         ORDER BY ps.start_time DESC
         LIMIT ?`, [normalized, limit]),
            (0, database_1.queryRows)(`SELECT id, ticket_number, officer_id, officer_name, session_id, license_plate, location_name,
                amount, reason, status, date_issued, due_date, remarks, note, created_at
         FROM penalty_tickets
         WHERE REPLACE(REPLACE(UPPER(license_plate), ' ', ''), '-', '') = ?
         ORDER BY date_issued DESC
         LIMIT ?`, [normalized, limit]),
            (0, database_1.queryRows)(`(SELECT p.id, p.ticket_id, t.ticket_number, t.license_plate, t.reason,
                 p.photo_url, p.photo_taken_at, p.uploaded_at, 'ticket' AS source,
                 t.location_name, t.officer_name, t.note AS notes
          FROM ticket_photos p
          INNER JOIN penalty_tickets t ON t.id = p.ticket_id
          WHERE REPLACE(REPLACE(UPPER(t.license_plate), ' ', ''), '-', '') = ?)
         UNION ALL
         (SELECT e.id, NULL AS ticket_id, NULL AS ticket_number, e.license_plate,
                 e.evidence_type AS reason, e.photo_url, e.photo_taken_at, e.uploaded_at,
                 'standalone' AS source, e.location_name, e.officer_name, e.notes
          FROM officer_evidence e
          WHERE REPLACE(REPLACE(UPPER(e.license_plate), ' ', ''), '-', '') = ?)
         ORDER BY uploaded_at DESC
         LIMIT ?`, [normalized, normalized, limit]),
        ]);
        return { plate: normalized, sessions, tickets, evidence };
    }
    async createTicket(input) {
        await this.ensurePhotoCapacity();
        const id = crypto_1.default.randomUUID();
        const ticketNumber = await this.nextTicketNumber();
        const violationDate = input.violationDateTime ?? new Date().toISOString().slice(0, 19).replace('T', ' ');
        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const totalAmount = Number(input.fineAmount) + Number(input.lateFee ?? 0);
        const remarks = JSON.stringify({
            provinceState: input.provinceState ?? 'Ontario (ON)',
            vehicleMake: input.vehicleMake ?? '',
            vehicleModel: input.vehicleModel ?? '',
            vehicleColor: input.vehicleColor ?? '',
            vehicleType: input.vehicleType ?? '',
            violationSubType: input.violationSubType ?? '',
            fineAmount: Number(input.fineAmount),
            lateFee: Number(input.lateFee ?? 0),
            officerNotes: input.officerNotes ?? '',
            violationDetails: input.violationDetails ?? '',
            meterNumber: input.meterNumber ?? '',
            zoneArea: input.zoneArea ?? '',
            beatArea: input.beatArea ?? '',
        });
        await (0, database_1.execute)(`INSERT INTO penalty_tickets
       (id, ticket_number, officer_id, officer_name, session_id, license_plate, location_name,
        amount, reason, status, date_issued, due_date, remarks, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            ticketNumber,
            input.officerId,
            input.officerName,
            input.sessionId ?? null,
            input.licensePlate.trim().toUpperCase(),
            input.locationName ?? null,
            totalAmount,
            input.violationType.trim(),
            input.status ?? 'unpaid',
            violationDate,
            dueDate,
            remarks,
            input.officerNotes ?? null,
        ]);
        for (const photoUrl of input.photos ?? []) {
            if (!photoUrl.trim())
                continue;
            await (0, database_1.execute)(`INSERT INTO ticket_photos (id, ticket_id, photo_url, photo_taken_at)
         VALUES (?, ?, ?, NOW())`, [crypto_1.default.randomUUID(), id, photoUrl.trim()]);
        }
        return this.findTicketById(id);
    }
    async attachTicketPhoto(ticketId, photoUrl) {
        if (!ticketId?.trim())
            throw new Error('ticket id is required');
        if (!photoUrl?.trim())
            throw new Error('photo url is required');
        await (0, database_1.execute)(`INSERT INTO ticket_photos (id, ticket_id, photo_url, photo_taken_at)
       VALUES (?, ?, ?, NOW())`, [crypto_1.default.randomUUID(), ticketId, photoUrl.trim()]);
    }
    async findTicketById(id) {
        const [ticketRows, photoRows] = await Promise.all([
            (0, database_1.queryRows)(`SELECT id, ticket_number, officer_id, officer_name, session_id, license_plate, location_name,
                amount, reason, status, date_issued, due_date, remarks, note, created_at
         FROM penalty_tickets
         WHERE id = ?
         LIMIT 1`, [id]),
            (0, database_1.queryRows)(`SELECT photo_url FROM ticket_photos WHERE ticket_id = ? ORDER BY uploaded_at ASC`, [id]),
        ]);
        const ticket = ticketRows[0] ?? null;
        return ticket ? { ...ticket, photos: photoRows.map((p) => p.photo_url) } : null;
    }
}
exports.EnforcementRepository = EnforcementRepository;
exports.enforcementRepository = new EnforcementRepository();
//# sourceMappingURL=enforcement.repository.js.map