"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforcementService = exports.EnforcementService = void 0;
const enforcement_repository_1 = require("../repositories/enforcement.repository");
const ticket_service_1 = require("./ticket.service");
const commonErrors_1 = require("./commonErrors");
const cloudinary_service_1 = require("./cloudinary.service");
const ticketService = new ticket_service_1.TicketService();
const DEFAULT_OFFICER_NAME = 'Officer John';
class EnforcementService {
    async dashboard(officerId) {
        const data = await enforcement_repository_1.enforcementRepository.dashboard(officerId);
        if (officerId) {
            const { officerPortalService } = await Promise.resolve().then(() => __importStar(require('./officerPortal.service')));
            const onDutySeconds = await officerPortalService.getOnDutySecondsForDashboard(officerId);
            return {
                ...data,
                onDutySeconds,
                onDutyMinutes: Math.floor(onDutySeconds / 60),
            };
        }
        return data;
    }
    async scanPlate(plate) {
        if (!plate?.trim())
            throw new commonErrors_1.ValidationError('plate is required');
        return enforcement_repository_1.enforcementRepository.findPlateStatus(plate);
    }
    async listTickets(query) {
        return enforcement_repository_1.enforcementRepository.listTickets({
            limit: this.parseLimit(String(query?.limit ?? '25')),
            status: String(query?.status ?? '').trim() || undefined,
            violationType: String(query?.violationType ?? '').trim() || undefined,
            location: String(query?.location ?? '').trim() || undefined,
            search: String(query?.search ?? '').trim() || undefined,
            fromDate: String(query?.fromDate ?? '').trim() || undefined,
            toDate: String(query?.toDate ?? '').trim() || undefined,
        });
    }
    async listSessions(query) {
        return enforcement_repository_1.enforcementRepository.listSessions({
            limit: this.parseLimit(String(query?.limit ?? '100')),
            status: String(query?.status ?? '').trim() || undefined,
            zone: String(query?.zone ?? '').trim() || undefined,
            location: String(query?.location ?? '').trim() || undefined,
            search: String(query?.search ?? '').trim() || undefined,
            sort: String(query?.sort ?? '').trim() || undefined,
        });
    }
    async listEvidence(limit) {
        return enforcement_repository_1.enforcementRepository.listEvidence(this.parseLimit(limit));
    }
    async uploadPhoto(body) {
        const photo = body.photo?.trim();
        if (!photo)
            throw new commonErrors_1.ValidationError('photo is required');
        const photoUrl = await (0, cloudinary_service_1.ensureCloudinaryUrl)(photo, { folder: 'parksmart/evidence' });
        return {
            id: `PHOTO-${Date.now()}`,
            photoUrl,
            label: body.label?.trim() || 'Evidence Photo',
            uploadedAt: new Date().toISOString(),
        };
    }
    async captureEvidence(body) {
        if (!body.licensePlate?.trim())
            throw new commonErrors_1.ValidationError('licensePlate is required');
        if (!Array.isArray(body.photos) || body.photos.length === 0) {
            throw new commonErrors_1.ValidationError('At least one photo is required');
        }
        const fallbackOfficer = await enforcement_repository_1.enforcementRepository.findDefaultOfficer();
        const officerId = body.officerId?.trim() || fallbackOfficer?.id;
        if (!officerId)
            throw new commonErrors_1.ValidationError('No active officer is available to capture evidence');
        const photos = await (0, cloudinary_service_1.uploadMediaList)(body.photos, { folder: 'parksmart/evidence' });
        return enforcement_repository_1.enforcementRepository.createStandaloneEvidence({
            officerId,
            officerName: body.officerName?.trim() || fallbackOfficer?.full_name || DEFAULT_OFFICER_NAME,
            licensePlate: body.licensePlate,
            locationName: body.locationName,
            evidenceType: body.evidenceType,
            notes: body.notes,
            photos,
        });
    }
    async updateEvidence(id, body) {
        if (!id?.trim())
            throw new commonErrors_1.ValidationError('evidence id is required');
        const data = await enforcement_repository_1.enforcementRepository.updateEvidence(id, {
            licensePlate: body.licensePlate,
            locationName: body.locationName,
            reason: body.reason,
            notes: body.notes,
        });
        if (!data)
            throw new commonErrors_1.NotFoundError('Evidence not found');
        return data;
    }
    async deleteEvidence(id) {
        if (!id?.trim())
            throw new commonErrors_1.ValidationError('evidence id is required');
        const deleted = await enforcement_repository_1.enforcementRepository.deleteEvidence(id);
        if (!deleted)
            throw new commonErrors_1.NotFoundError('Evidence not found');
        return { id };
    }
    async createManualEntry(body) {
        if (!body.licensePlate?.trim())
            throw new commonErrors_1.ValidationError('licensePlate is required');
        const durationMinutes = Number(body.durationMinutes ?? 120);
        if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
            throw new commonErrors_1.ValidationError('durationMinutes must be a positive number');
        }
        const fallbackOfficer = await enforcement_repository_1.enforcementRepository.findDefaultOfficer();
        const officerId = body.officerId?.trim() || fallbackOfficer?.id;
        if (!officerId)
            throw new commonErrors_1.ValidationError('No active officer is available to create a manual entry');
        return enforcement_repository_1.enforcementRepository.createManualEntry({
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
    async vehicleHistory(plate, limit) {
        if (!plate?.trim())
            throw new commonErrors_1.ValidationError('plate is required');
        return enforcement_repository_1.enforcementRepository.vehicleHistory(plate, this.parseLimit(limit));
    }
    async createTicket(body) {
        if (!body.licensePlate?.trim())
            throw new commonErrors_1.ValidationError('licensePlate is required');
        if (!body.violationType?.trim())
            throw new commonErrors_1.ValidationError('violationType is required');
        if (!Number.isFinite(Number(body.fineAmount)) || Number(body.fineAmount) <= 0) {
            throw new commonErrors_1.ValidationError('fineAmount must be a positive number');
        }
        if (!Array.isArray(body.photos) || body.photos.length < 3) {
            throw new commonErrors_1.ValidationError('At least 3 evidence photos are required');
        }
        const fallbackOfficer = await enforcement_repository_1.enforcementRepository.findDefaultOfficer();
        const officerId = body.officerId?.trim() || fallbackOfficer?.id;
        if (!officerId)
            throw new commonErrors_1.ValidationError('No active officer is available to issue this ticket');
        const photos = await (0, cloudinary_service_1.uploadMediaList)(body.photos, { folder: 'parksmart/tickets' });
        const ticket = await enforcement_repository_1.enforcementRepository.createTicket({
            officerId,
            officerName: body.officerName?.trim() || fallbackOfficer?.full_name || DEFAULT_OFFICER_NAME,
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
        if (!ticket)
            throw new commonErrors_1.NotFoundError('Ticket could not be created');
        return ticket;
    }
    async payTicket(id, body) {
        if (!id?.trim())
            throw new commonErrors_1.ValidationError('ticket id is required');
        return ticketService.markPaid(id, {
            payment_method: body.payment_method,
            transaction_ref: body.transaction_ref,
            customer_email: body.customer_email,
        });
    }
    async addTicketEvidence(id, body) {
        if (!id?.trim())
            throw new commonErrors_1.ValidationError('ticket id is required');
        if (!Array.isArray(body.photos) || body.photos.length === 0) {
            throw new commonErrors_1.ValidationError('At least one evidence photo is required');
        }
        const ticket = await enforcement_repository_1.enforcementRepository.findTicketById(id);
        if (!ticket)
            throw new commonErrors_1.NotFoundError('Ticket not found');
        const photos = await (0, cloudinary_service_1.uploadMediaList)(body.photos.filter((p) => p?.trim()).map((p) => p.trim()), { folder: 'parksmart/tickets' });
        for (const photoUrl of photos) {
            await enforcement_repository_1.enforcementRepository.attachTicketPhoto(id, photoUrl);
        }
        if (body.note?.trim()) {
            await ticketService.addNote(id, body.note.trim());
        }
        return { ticketId: id, photos };
    }
    async reviewTicket(id, note) {
        if (!id?.trim())
            throw new commonErrors_1.ValidationError('ticket id is required');
        const ticket = await ticketService.getById(id);
        if (!ticket)
            throw new commonErrors_1.NotFoundError('Ticket not found');
        const reviewNote = note?.trim() || 'Review requested by officer';
        if (ticket.status === 'paid') {
            throw new commonErrors_1.ValidationError('Reviews cannot be sent for paid tickets. Only unpaid or disputed tickets can be sent for review.');
        }
        if (ticket.status === 'cancelled') {
            throw new commonErrors_1.ValidationError('Reviews cannot be sent for cancelled tickets.');
        }
        if (ticket.status === 'resolved') {
            throw new commonErrors_1.ValidationError('Reviews cannot be sent for resolved tickets.');
        }
        if (ticket.status === 'disputed') {
            await ticketService.addNote(id, reviewNote);
            return ticketService.getById(id);
        }
        const data = await ticketService.disputeTicket(ticket.ticket_number, reviewNote);
        await ticketService.addNote(id, reviewNote);
        return data;
    }
    async createTicketsBatch(items) {
        const results = [];
        for (const item of items) {
            try {
                const ticket = await this.createTicket(item);
                results.push({ success: true, id: ticket.id });
            }
            catch (err) {
                results.push({ success: false, error: err?.message ?? String(err) });
            }
        }
        return results;
    }
    async getPrintPayload(id) {
        const ticket = await enforcement_repository_1.enforcementRepository.findTicketById(id);
        if (!ticket)
            throw new commonErrors_1.NotFoundError('Ticket not found');
        let details = {};
        try {
            details = ticket.remarks ? JSON.parse(ticket.remarks) : {};
        }
        catch {
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
    parseLimit(limit) {
        return Math.min(100, Math.max(1, Number(limit ?? 25) || 25));
    }
}
exports.EnforcementService = EnforcementService;
exports.enforcementService = new EnforcementService();
//# sourceMappingURL=enforcement.service.js.map