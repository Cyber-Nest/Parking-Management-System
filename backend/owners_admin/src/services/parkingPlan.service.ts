import { ParkingPlanRepository } from '../repositories/parkingPlan.repository';
import { NotFoundError, ValidationError } from './commonErrors';

const parkingPlanRepo = new ParkingPlanRepository();

export class ParkingPlanService {
  async list() {
    return parkingPlanRepo.list();
  }

  async create(body: {
    name: string;
    price: number;
    duration: number;
    plan_type?: string;
    tax_percent?: number;
    status?: string;
  }) {
    if (!body.name?.trim()) {
      throw new ValidationError('name is required');
    }
    if (typeof body.price !== 'number' || body.price <= 0) {
      throw new ValidationError('price must be a positive number');
    }
    if (typeof body.duration !== 'number' || body.duration <= 0) {
      throw new ValidationError('duration must be a positive number (minutes)');
    }

    const id = await parkingPlanRepo.create({
      name: body.name,
      price: body.price,
      duration: body.duration,
      plan_type: body.plan_type,
      tax_percent: body.tax_percent,
      status: body.status,
    });
    return parkingPlanRepo.findById(id);
  }

  async update(
    id: string,
    body: {
      name?: string;
      price?: number;
      duration?: number;
      plan_type?: string;
      tax_percent?: number;
      status?: string;
    }
  ) {
    const affected = await parkingPlanRepo.update(id, body);
    if (affected === 0) {
      const exists = await parkingPlanRepo.findById(id);
      if (!exists) throw new NotFoundError('Parking plan not found');
    }
    return parkingPlanRepo.findById(id);
  }

  async remove(id: string) {
    const affected = await parkingPlanRepo.remove(id);
    if (affected === 0) {
      throw new NotFoundError('Parking plan not found');
    }
  }
}
