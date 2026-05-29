import { Request, Response } from 'express';
import { officerAuthService } from '../services/officerAuth.service';
import { ApiResponse } from '../types';

const authService = officerAuthService;

const handleError = (err: unknown, res: Response): void => {
  console.error('[OfficerAuthController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const login = async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }
    const data = await authService.login({ email, password });
    res.status(200).json({ success: true, message: 'Login successful', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const forgotPassword = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }
    await authService.forgotPassword({ email });
    res.status(200).json({ success: true, message: 'If this email is registered, you will receive a reset link shortly.' });
  } catch (err) {
    handleError(err, res);
  }
};

export const resetPassword = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { token, officerId, newPassword } = req.body as { token?: string; officerId?: string; newPassword?: string };
    if (!token || !officerId || !newPassword) {
      res.status(400).json({ success: false, message: 'token, officerId and newPassword are required' });
      return;
    }
    await authService.resetPassword({ token, officerId, newPassword } as any);
    res.status(200).json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    handleError(err, res);
  }
};

export const refreshToken = async (req: Request, res: Response<ApiResponse<{ accessToken: string }>>): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'refreshToken is required' });
      return;
    }
    const accessToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, message: 'Token refreshed', data: { accessToken } });
  } catch (err) {
    handleError(err, res);
  }
};
