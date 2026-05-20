export declare class ParkingPlanService {
    list(): Promise<import("../repositories/parkingPlan.repository").ParkingPlanRow[]>;
    create(body: {
        name: string;
        price: number;
        duration: number;
        plan_type?: string;
        tax_percent?: number;
        status?: string;
    }): Promise<import("../repositories/parkingPlan.repository").ParkingPlanRow | null>;
    update(id: string, body: {
        name?: string;
        price?: number;
        duration?: number;
        plan_type?: string;
        tax_percent?: number;
        status?: string;
    }): Promise<import("../repositories/parkingPlan.repository").ParkingPlanRow | null>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=parkingPlan.service.d.ts.map