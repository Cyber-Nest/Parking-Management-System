import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { parkingZoneService } from '../services/parkingZone.service';
import { ValidationError } from '../services/commonErrors';

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[ParkingZoneController]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listParkingZones = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingZoneService.list(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Parking zones fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getParkingZone = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingZoneService.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Parking zone fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createParkingZone = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingZoneService.create(req.body);
    res.status(201).json({ success: true, message: 'Parking zone created', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateParkingZone = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingZoneService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Parking zone updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteParkingZone = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
  try {
    const data = await parkingZoneService.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Parking zone deleted', data });
  } catch (err) {
    handleError(err, res);
  }
};
