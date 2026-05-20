import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { PricingService } from '../services/pricing.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const pricingService = new PricingService();

const handleError = (err: unknown, res: Response): void => {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[PricingController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listPricings = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await pricingService.list(req.query as Record<string, string | undefined>);
        res.status(200).json({ success: true, message: 'Pricings fetched', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const createPricing = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await pricingService.create(req.body);
        res.status(201).json({ success: true, message: 'Pricing created', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const updatePricing = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await pricingService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Pricing updated', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const deletePricing = async (
    req: Request,
    res: Response<ApiResponse>
): Promise<void> => {
    try {
        await pricingService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Pricing deleted' });
    } catch (err) {
        handleError(err, res);
    }
};