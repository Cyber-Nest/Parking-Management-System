import { execute, queryRows } from '../config/database';
import { ParkingZoneRow } from '../types';

export class ParkingZoneRepository {
  async findById(id: string): Promise<ParkingZoneRow | null> {
    const rows = await queryRows<ParkingZoneRow>(
      `SELECT id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id
       FROM parking_zones WHERE id = ? LIMIT 1`,
      [id]
    );

    return rows[0] ?? null;
  }

  async decrementAvailableSpots(id: string): Promise<void> {
    await execute(
      `UPDATE parking_zones
       SET available_spots = GREATEST(available_spots - 1, 0)
       WHERE id = ? AND available_spots > 0`,
      [id]
    );
  }
}
