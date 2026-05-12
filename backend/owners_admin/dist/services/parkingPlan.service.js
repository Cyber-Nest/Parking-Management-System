"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkingPlanService = void 0;
const parkingPlan_repository_1 = require("../repositories/parkingPlan.repository");
const commonErrors_1 = require("./commonErrors");
const parkingPlanRepo = new parkingPlan_repository_1.ParkingPlanRepository();
class ParkingPlanService {
    async list() {
        return parkingPlanRepo.list();
    }
    async create(body) {
        if (!body.name?.trim()) {
            throw new commonErrors_1.ValidationError('name is required');
        }
        if (typeof body.price !== 'number' || body.price <= 0) {
            throw new commonErrors_1.ValidationError('price must be a positive number');
        }
        if (typeof body.duration !== 'number' || body.duration <= 0) {
            throw new commonErrors_1.ValidationError('duration must be a positive number (minutes)');
        }
        const id = await parkingPlanRepo.create({
            name: body.name,
            price: body.price,
            duration: body.duration,
        });
        return parkingPlanRepo.findById(id);
    }
    async update(id, body) {
        const affected = await parkingPlanRepo.update(id, body);
        if (affected === 0) {
            const exists = await parkingPlanRepo.findById(id);
            if (!exists)
                throw new commonErrors_1.NotFoundError('Parking plan not found');
        }
        return parkingPlanRepo.findById(id);
    }
    async remove(id) {
        const affected = await parkingPlanRepo.remove(id);
        if (affected === 0) {
            throw new commonErrors_1.NotFoundError('Parking plan not found');
        }
    }
}
exports.ParkingPlanService = ParkingPlanService;
//# sourceMappingURL=parkingPlan.service.js.map