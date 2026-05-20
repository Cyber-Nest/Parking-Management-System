"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parkingZoneService = exports.ParkingZoneService = void 0;
const parkingZone_repository_1 = require("../repositories/parkingZone.repository");
const parkingImages_1 = require("../utils/parkingImages");
const commonErrors_1 = require("./commonErrors");
class ParkingZoneService {
    async list(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(200, Math.max(1, Number(query.limit) || 100));
        return parkingZone_repository_1.parkingZoneRepository.list({ page, limit, q: query.q });
    }
    async getById(id) {
        const zone = await parkingZone_repository_1.parkingZoneRepository.findById(id);
        if (!zone)
            throw new commonErrors_1.NotFoundError('Parking zone not found');
        return zone;
    }
    async create(body) {
        const parkingName = String(body.parking_name ?? body.name ?? '').trim();
        if (!parkingName)
            throw new commonErrors_1.ValidationError('parking_name is required');
        const address = String(body.address ?? 'Address not set').trim();
        const hourlyRate = Number(body.hourly_rate ?? body.hourlyRate ?? 4.5);
        const availableSpots = Number(body.available_spots ?? body.availableSpots ?? 10);
        const totalSpots = Number(body.total_spots ?? body.totalSpots ?? availableSpots);
        const spotId = String(body.spot_id ?? body.spotId ?? `SPOT-${Date.now().toString(36).slice(2, 8).toUpperCase()}`);
        const status = body.status === 'inactive' || body.isActive === false ? 'inactive' : 'active';
        const id = await parkingZone_repository_1.parkingZoneRepository.create({
            parking_name: parkingName,
            address,
            image_url: String(body.image_url ?? body.imageUrl ?? parkingImages_1.DEFAULT_PARKING_IMAGE),
            hourly_rate: Number.isFinite(hourlyRate) ? hourlyRate : 4.5,
            available_spots: Number.isFinite(availableSpots) ? availableSpots : 10,
            total_spots: Number.isFinite(totalSpots) ? totalSpots : 10,
            spot_id: spotId,
            status,
        });
        return parkingZone_repository_1.parkingZoneRepository.findById(id);
    }
    async update(id, body) {
        const existing = await parkingZone_repository_1.parkingZoneRepository.findById(id);
        if (!existing)
            throw new commonErrors_1.NotFoundError('Parking zone not found');
        const affected = await parkingZone_repository_1.parkingZoneRepository.update(id, {
            parking_name: body.parking_name !== undefined ? String(body.parking_name) : body.name !== undefined ? String(body.name) : undefined,
            address: body.address !== undefined ? String(body.address) : undefined,
            image_url: body.image_url !== undefined ? String(body.image_url) : undefined,
            hourly_rate: body.hourly_rate !== undefined ? Number(body.hourly_rate) : body.hourlyRate !== undefined ? Number(body.hourlyRate) : undefined,
            available_spots: body.available_spots !== undefined ? Number(body.available_spots) : undefined,
            total_spots: body.total_spots !== undefined ? Number(body.total_spots) : undefined,
            spot_id: body.spot_id !== undefined ? String(body.spot_id) : undefined,
            status: body.status !== undefined
                ? (body.status === 'inactive' ? 'inactive' : 'active')
                : body.isActive !== undefined
                    ? body.isActive
                        ? 'active'
                        : 'inactive'
                    : undefined,
        });
        if (affected === 0 && body.isActive === undefined && body.parking_name === undefined) {
            throw new commonErrors_1.ValidationError('No fields to update');
        }
        return parkingZone_repository_1.parkingZoneRepository.findById(id);
    }
    async remove(id) {
        const affected = await parkingZone_repository_1.parkingZoneRepository.remove(id);
        if (affected === 0)
            throw new commonErrors_1.NotFoundError('Parking zone not found');
        return { deleted: true };
    }
}
exports.ParkingZoneService = ParkingZoneService;
exports.parkingZoneService = new ParkingZoneService();
//# sourceMappingURL=parkingZone.service.js.map