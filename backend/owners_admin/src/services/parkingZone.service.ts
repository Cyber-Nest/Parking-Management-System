import { parkingZoneRepository } from '../repositories/parkingZone.repository';
import { DEFAULT_PARKING_IMAGE } from '../utils/parkingImages';
import { NotFoundError, ValidationError } from './commonErrors';

export class ParkingZoneService {
  async list(query: Record<string, string | undefined>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(query.limit) || 100));
    return parkingZoneRepository.list({ page, limit, q: query.q });
  }

  async getById(id: string) {
    const zone = await parkingZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Parking zone not found');
    return zone;
  }

  async create(body: Record<string, unknown>) {
    const parkingName = String(body.parking_name ?? body.name ?? '').trim();
    if (!parkingName) throw new ValidationError('parking_name is required');

    const address = String(body.address ?? 'Address not set').trim();
    const hourlyRate = Number(body.hourly_rate ?? body.hourlyRate ?? 4.5);
    const availableSpots = Number(body.available_spots ?? body.availableSpots ?? 10);
    const totalSpots = Number(body.total_spots ?? body.totalSpots ?? availableSpots);
    const spotId = String(body.spot_id ?? body.spotId ?? `SPOT-${Date.now().toString(36).slice(2, 8).toUpperCase()}`);
    const status = body.status === 'inactive' || body.isActive === false ? 'inactive' : 'active';

    const id = await parkingZoneRepository.create({
      parking_name: parkingName,
      address,
      image_url: String(body.image_url ?? body.imageUrl ?? DEFAULT_PARKING_IMAGE),
      hourly_rate: Number.isFinite(hourlyRate) ? hourlyRate : 4.5,
      available_spots: Number.isFinite(availableSpots) ? availableSpots : 10,
      total_spots: Number.isFinite(totalSpots) ? totalSpots : 10,
      spot_id: spotId,
      status,
    });

    return parkingZoneRepository.findById(id);
  }

  async update(id: string, body: Record<string, unknown>) {
    const existing = await parkingZoneRepository.findById(id);
    if (!existing) throw new NotFoundError('Parking zone not found');

    const affected = await parkingZoneRepository.update(id, {
      parking_name: body.parking_name !== undefined ? String(body.parking_name) : body.name !== undefined ? String(body.name) : undefined,
      address: body.address !== undefined ? String(body.address) : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url) : undefined,
      hourly_rate: body.hourly_rate !== undefined ? Number(body.hourly_rate) : body.hourlyRate !== undefined ? Number(body.hourlyRate) : undefined,
      available_spots: body.available_spots !== undefined ? Number(body.available_spots) : undefined,
      total_spots: body.total_spots !== undefined ? Number(body.total_spots) : undefined,
      spot_id: body.spot_id !== undefined ? String(body.spot_id) : undefined,
      status:
        body.status !== undefined
          ? (body.status === 'inactive' ? 'inactive' : 'active')
          : body.isActive !== undefined
            ? body.isActive
              ? 'active'
              : 'inactive'
            : undefined,
    });

    if (affected === 0 && body.isActive === undefined && body.parking_name === undefined) {
      throw new ValidationError('No fields to update');
    }

    return parkingZoneRepository.findById(id);
  }

  async remove(id: string) {
    const affected = await parkingZoneRepository.remove(id);
    if (affected === 0) throw new NotFoundError('Parking zone not found');
    return { deleted: true };
  }
}

export const parkingZoneService = new ParkingZoneService();
