import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { UserService } from '../services/user.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const userService = new UserService();

const handleError = (err: unknown, res: Response): void => {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[UserController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listUsers = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await userService.list(req.query as Record<string, string | undefined>);
        res.status(200).json({ success: true, message: 'Users fetched', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const createUser = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await userService.create(req.body);
        res.status(201).json({ success: true, message: 'User created', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const updateUser = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await userService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'User updated', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const deleteUser = async (
    req: Request,
    res: Response<ApiResponse>
): Promise<void> => {
    try {
        await userService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        handleError(err, res);
    }
};