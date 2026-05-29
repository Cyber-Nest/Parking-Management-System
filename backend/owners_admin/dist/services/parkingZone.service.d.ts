export declare class ParkingZoneService {
    list(query: Record<string, string | undefined>): Promise<{
        items: import("../types").ParkingZoneRow[];
        total: number;
    }>;
    getById(id: string): Promise<import("../types").ParkingZoneRow & {
        status?: string;
    }>;
    create(body: Record<string, unknown>): Promise<(import("../types").ParkingZoneRow & {
        status?: string;
    }) | null>;
    update(id: string, body: Record<string, unknown>): Promise<(import("../types").ParkingZoneRow & {
        status?: string;
    }) | null>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
export declare const parkingZoneService: ParkingZoneService;
//# sourceMappingURL=parkingZone.service.d.ts.map