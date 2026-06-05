import { parkingZoneRepository } from '../repositories/parkingZone.repository';
import { DEFAULT_PARKING_IMAGE, sanitizeParkingImageUrl } from '../utils/parkingImages';
import { NotFoundError, ValidationError } from './commonErrors';
import { ensureCloudinaryUrl, isCloudinaryUrl } from './cloudinary.service';
import { parkingLotRepository } from '../repositories/parkingLot.repository';
async function resolveZoneImageUrl(raw: unknown): Promise<string> {
  const value = String(raw ?? '').trim();
  if (!value) return DEFAULT_PARKING_IMAGE;
  if (isCloudinaryUrl(value)) return value;
  if (/^data:image\//i.test(value)) {
    return ensureCloudinaryUrl(value, { folder: 'parksmart/zones' });
  }
  return sanitizeParkingImageUrl(value);
}

export class ParkingZoneService {
  async list(query: Record<string, string | undefined>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(query.limit) || 100));
    const lotId = query.lotId ?? query.lotID ?? query.parking_lot_id;
    return parkingZoneRepository.list({ page, limit, q: query.q, lotId });
  }

  async getById(id: string) {
    const zone = await parkingZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Parking zone not found');
    return zone;
  }

  async create(body: Record<string, unknown>) {
  const parkingName = String(
    body.parking_name ?? body.name ?? ''
  ).trim();

  if (!parkingName) {
    throw new ValidationError('parking_name is required');
  }

  const parkingLotId =
    body.parking_lot_id !== undefined
      ? String(body.parking_lot_id)
      : body.lotId !== undefined
        ? String(body.lotId)
        : undefined;

  const parkingLot = parkingLotId
    ? await parkingLotRepository.findById(parkingLotId)
    : null;

  const address = String(
    body.address ??
    parkingLot?.address ??
    'Address not set'
  ).trim();

  const hourlyRate = Number(
    body.hourly_rate ??
    body.hourlyRate ??
    4.5
  );

  const availableSpots = Number(
    body.available_spots ??
    body.availableSpots ??
    100
  );

  const totalSpots = Number(
    body.total_spots ??
    body.totalSpots ??
    availableSpots
  );

  const spotId = String(
    body.spot_id ??
    body.spotId ??
    `SPOT-${Date.now().toString(36).slice(2, 8).toUpperCase()}`
  );

  const status =
    body.status === 'inactive' || body.isActive === false
      ? 'inactive'
      : 'active';

  const image_url = await resolveZoneImageUrl(
    body.image_url ??
    body.imageUrl ??
    DEFAULT_PARKING_IMAGE
  );

  const id = await parkingZoneRepository.create({
    parking_name: parkingName,
    address,
    image_url,
    hourly_rate: Number.isFinite(hourlyRate)
      ? hourlyRate
      : 4.5,
    available_spots: Number.isFinite(availableSpots)
      ? availableSpots
      : 100,
    total_spots: Number.isFinite(totalSpots)
      ? totalSpots
      : 100,
    spot_id: spotId,
    status,
    parking_lot_id: parkingLotId,
  });

  return parkingZoneRepository.findById(id);
}

  async update(id: string, body: Record<string, unknown>) {
    const existing = await parkingZoneRepository.findById(id);
    if (!existing) throw new NotFoundError('Parking zone not found');

    let image_url: string | undefined;
    if (body.image_url !== undefined || body.imageUrl !== undefined) {
      image_url = await resolveZoneImageUrl(body.image_url ?? body.imageUrl);
    }

    const affected = await parkingZoneRepository.update(id, {
      parking_name: body.parking_name !== undefined ? String(body.parking_name) : body.name !== undefined ? String(body.name) : undefined,
      address: body.address !== undefined ? String(body.address) : undefined,
      image_url,
      hourly_rate: body.hourly_rate !== undefined ? Number(body.hourly_rate) : body.hourlyRate !== undefined ? Number(body.hourlyRate) : undefined,
      available_spots: body.available_spots !== undefined ? Number(body.available_spots) : undefined,
      total_spots: body.total_spots !== undefined ? Number(body.total_spots) : undefined,
      spot_id: body.spot_id !== undefined ? String(body.spot_id) : undefined,
      parking_lot_id: body.parking_lot_id !== undefined ? (body.parking_lot_id === null ? null : String(body.parking_lot_id)) : undefined,
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
