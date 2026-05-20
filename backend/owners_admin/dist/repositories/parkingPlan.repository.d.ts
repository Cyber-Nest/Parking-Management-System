export interface ParkingPlanRow {
    id: string;
    name: string;
    price: number;
    duration: number;
    plan_type: string | null;
    tax_percent: number;
    status: string;
    created_at?: Date;
    updated_at?: Date;
}
export declare class ParkingPlanRepository {
    list(): Promise<ParkingPlanRow[]>;
    findById(id: string): Promise<ParkingPlanRow | null>;
    findByPriceAndDuration(price: number, duration: number): Promise<ParkingPlanRow | null>;
    /** Match customer booking duration to an active plan (exact duration, then closest price). */
    findForBooking(durationMinutes: number, price?: number): Promise<ParkingPlanRow | null>;
    create(params: {
        name: string;
        price: number;
        duration: number;
        plan_type?: string;
        tax_percent?: number;
        status?: string;
    }): Promise<string>;
    update(id: string, params: {
        name?: string;
        price?: number;
        duration?: number;
        plan_type?: string;
        tax_percent?: number;
        status?: string;
    }): Promise<number>;
    remove(id: string): Promise<number>;
}
//# sourceMappingURL=parkingPlan.repository.d.ts.map