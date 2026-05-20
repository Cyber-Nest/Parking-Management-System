import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { PenaltyRuleService } from '../services/penaltyRule.service';
import { ValidationError } from '../services/commonErrors';

const penaltyRuleService = new PenaltyRuleService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[PenaltyRuleController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listPenaltyRules = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await penaltyRuleService.list(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Penalty rules fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createPenaltyRule = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { violation, code, amount, grace_minutes, grace, description, status } = req.body as any;
    if (!violation || String(violation).trim() === '') throw new ValidationError('violation is required');
    if (!code || String(code).trim() === '') throw new ValidationError('code is required');
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new ValidationError('amount must be a positive number');

    const data = await penaltyRuleService.create({
      violation: String(violation).trim(),
      code: String(code).trim(),
      amount: numericAmount,
      grace_minutes: grace_minutes !== undefined ? Number(grace_minutes) : grace !== undefined ? Number(grace) : 0,
      description: description ? String(description) : undefined,
      status: status ? String(status) : 'Active',
    });
    res.status(201).json({ success: true, message: 'Penalty rule created', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updatePenaltyRule = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as any;
    const updates: any = {};

    if (body.violation !== undefined) updates.violation = String(body.violation).trim();
    if (body.code !== undefined) updates.code = String(body.code).trim();
    if (body.amount !== undefined) {
      const n = Number(body.amount);
      if (!Number.isFinite(n) || n <= 0) throw new ValidationError('amount must be a positive number');
      updates.amount = n;
    }
    if (body.grace_minutes !== undefined) updates.grace_minutes = Number(body.grace_minutes);
    if (body.grace !== undefined && body.grace_minutes === undefined) updates.grace_minutes = Number(body.grace);
    if (body.description !== undefined) updates.description = body.description ? String(body.description) : null;
    if (body.status !== undefined) updates.status = String(body.status);

    const data = await penaltyRuleService.update(id, updates);
    res.status(200).json({ success: true, message: 'Penalty rule updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const deletePenaltyRule = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const ok = await penaltyRuleService.delete(req.params.id);
    res.status(ok ? 200 : 404).json({
      success: ok,
      message: ok ? 'Penalty rule deleted' : 'Penalty rule not found',
    });
  } catch (err) {
    handleError(err, res);
  }
};

