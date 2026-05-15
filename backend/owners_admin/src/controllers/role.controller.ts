import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { RoleService } from '../services/role.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const roleService = new RoleService();

const handleError = (err: unknown, res: Response): void => {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[RoleController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listRoles = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await roleService.list(req.query as Record<string, string | undefined>);
        res.status(200).json({ success: true, message: 'Roles fetched', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const createRole = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await roleService.create(req.body);
        res.status(201).json({ success: true, message: 'Role created', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const updateRole = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await roleService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Role updated', data });
    } catch (err) {
        handleError(err, res);
    }
};

export const deleteRole = async (
    req: Request,
    res: Response<ApiResponse>
): Promise<void> => {
    try {
        await roleService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Role deleted' });
    } catch (err) {
        handleError(err, res);
    }
};