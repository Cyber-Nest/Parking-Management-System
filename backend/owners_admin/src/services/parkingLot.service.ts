import { parkingLotRepository } from '../repositories/parkingLot.repository';
import { NotFoundError, ValidationError } from './commonErrors';

const getFrontendOrigin = (): string => {
  return (
    process.env.PARKING_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    'http://localhost:3000'
  );
};

const createParkingLotQrCodeUrl = (lotId: string): string => {
  const targetUrl = `${getFrontendOrigin()}/?lotId=${encodeURIComponent(lotId)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`;
};

export class ParkingLotService {
  async list(query: Record<string, string | undefined>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(query.limit) || 100));
    return parkingLotRepository.list({ page, limit, q: query.q });
  }

  async getById(id: string) {
    const lot = await parkingLotRepository.findById(id);
    if (!lot) throw new NotFoundError('Parking lot not found');
    return lot;
  }

  async create(body: Record<string, unknown>) {
    const lotName = String(body.lot_name ?? body.name ?? '').trim();
    if (!lotName) throw new ValidationError('lot_name is required');

    const id = body.id ? String(body.id) : `LOT-${Date.now()}`;
    const qrCodeUrl = body.qr_code_url
      ? String(body.qr_code_url)
      : createParkingLotQrCodeUrl(id);

    await parkingLotRepository.create({
      id,
      lot_name: lotName,
      owner_id: body.owner_id ? String(body.owner_id) : null,
      address: body.address ? String(body.address) : undefined,
      image_url: body.image_url ? String(body.image_url) : null,
      qr_code_url: qrCodeUrl,
    });

    return parkingLotRepository.findById(id);
  }

  async update(id: string, body: Record<string, unknown>) {
    const existing = await parkingLotRepository.findById(id);
    if (!existing) throw new NotFoundError('Parking lot not found');

    const affected = await parkingLotRepository.update(id, {
      lot_name: body.lot_name !== undefined ? String(body.lot_name) : undefined,
      owner_id: body.owner_id !== undefined ? String(body.owner_id) : undefined,
      address: body.address !== undefined ? String(body.address) : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url) : undefined,
      qr_code_url: body.qr_code_url !== undefined ? String(body.qr_code_url) : undefined,
    });

    if (affected === 0) throw new ValidationError('No fields to update');

    return parkingLotRepository.findById(id);
  }

  async remove(id: string) {
    const affected = await parkingLotRepository.remove(id);
    if (affected === 0) throw new NotFoundError('Parking lot not found');
    return { deleted: true };
  }
}

export const parkingLotService = new ParkingLotService();
