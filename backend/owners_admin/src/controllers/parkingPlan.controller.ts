import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { ParkingPlanService } from '../services/parkingPlan.service';
import { BadRequestError, NotFoundError, ValidationError } from '../services/commonErrors';

const parkingPlanService = new ParkingPlanService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof BadRequestError || err instanceof ValidationError || err instanceof NotFoundError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[ParkingPlanController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listParkingPlans = async (
  _req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await parkingPlanService.list();
    res.status(200).json({ success: true, message: 'Parking plans fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createParkingPlan = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { name, price, duration, plan_type, tax_percent, status, parking_lot_id } = req.body as {
      name?: string;
      price?: number;
      duration?: number;
      plan_type?: string;
      tax_percent?: number;
      status?: string;
      parking_lot_id?: string | null;
    };
    const data = await parkingPlanService.create({
      name: name ?? '',
      price: Number(price),
      duration: Number(duration),
      plan_type: plan_type,
      tax_percent: tax_percent !== undefined ? Number(tax_percent) : undefined,
      status: status,
      parking_lot_id: parking_lot_id ?? null,
    });
    res.status(201).json({ success: true, message: 'Parking plan created', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateParkingPlan = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, duration, plan_type, tax_percent, status, parking_lot_id } = req.body as {
      name?: string;
      price?: number;
      duration?: number;
      plan_type?: string;
      tax_percent?: number;
      status?: string;
      parking_lot_id?: string | null;
    };
    const data = await parkingPlanService.update(id, {
      name,
      price: price !== undefined ? Number(price) : undefined,
      duration: duration !== undefined ? Number(duration) : undefined,
      plan_type,
      tax_percent: tax_percent !== undefined ? Number(tax_percent) : undefined,
      status,
      parking_lot_id: parking_lot_id ?? undefined,
    });
    res.status(200).json({ success: true, message: 'Parking plan updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteParkingPlan = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    await parkingPlanService.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Parking plan deleted' });
  } catch (err) {
    handleError(err, res);
  }
};
