import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { TaxService } from '../services/tax.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const taxService = new TaxService();

const handleError = (err: unknown, res: Response): void => {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[TaxController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listTaxes = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await taxService.list(req.query as Record<string, string | undefined>);
        res.status(200).json({ success: true, message: 'Taxes fetched', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const createTax = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await taxService.create(req.body);
        res.status(201).json({ success: true, message: 'Tax created', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const updateTax = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await taxService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Tax updated', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const deleteTax = async (
    req: Request,
    res: Response<ApiResponse>
): Promise<void> => {
    try {
        await taxService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Tax deleted' });
    } catch (err) {
        handleError(err, res);
    }
};