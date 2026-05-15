import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { PaymentService } from '../services/payment.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const paymentService = new PaymentService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError || err instanceof NotFoundError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[PaymentController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listPayments = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await paymentService.list(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Payments fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getPaymentSummary = async (
  _req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await paymentService.summary();
    res.status(200).json({ success: true, message: 'Payment summary fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createPayment = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await paymentService.create(req.body);
    res.status(201).json({ success: true, message: 'Payment created', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getPaymentById = async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const data = await paymentService.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Payment fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getPaymentReceipt = async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const row = await paymentService.getById(req.params.id);
    const data = paymentService.getReceiptPayload(row);
    res.status(200).json({ success: true, message: 'Receipt data', data });
  } catch (err) {
    handleError(err, res);
  }
};
