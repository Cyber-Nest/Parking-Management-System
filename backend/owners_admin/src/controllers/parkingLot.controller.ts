import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { parkingLotService } from '../services/parkingLot.service';
import { ValidationError } from '../services/commonErrors';

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[ParkingLotController]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listParkingLots = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingLotService.list(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Parking lots fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getParkingLot = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingLotService.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Parking lot fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createParkingLot = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingLotService.create(req.body);
    res.status(201).json({ success: true, message: 'Parking lot created', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateParkingLot = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingLotService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Parking lot updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteParkingLot = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingLotService.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Parking lot deleted', data });
  } catch (err) {
    handleError(err, res);
  }
};
