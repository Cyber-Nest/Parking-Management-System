import { ParkingZoneRow } from '../types';
export interface ParkingZoneListFilters {
    page?: number;
    limit?: number;
    q?: string;
}
export declare class ParkingZoneRepository {
    list(filters?: ParkingZoneListFilters): Promise<{
        items: ParkingZoneRow[];
        total: number;
    }>;
    findById(id: string): Promise<(ParkingZoneRow & {
        status?: string;
    }) | null>;
    create(params: {
        id?: string;
        parking_name: string;
        address: string;
        image_url: string;
        hourly_rate: number;
        available_spots: number;
        total_spots: number;
        spot_id: string;
        status?: 'active' | 'inactive';
    }): Promise<string>;
    update(id: string, params: Partial<{
        parking_name: string;
        address: string;
        image_url: string;
        hourly_rate: number;
        available_spots: number;
        total_spots: number;
        spot_id: string;
        status: 'active' | 'inactive';
    }>): Promise<number>;
    remove(id: string): Promise<number>;
    decrementAvailableSpots(id: string): Promise<void>;
    findCustomerSubZones(excludeId: string, limit?: number): Promise<ParkingZoneRow[]>;
}
export declare const parkingZoneRepository: ParkingZoneRepository;
//# sourceMappingURL=parkingZone.repository.d.ts.map