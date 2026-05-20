"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.listRoles = void 0;
const role_service_1 = require("../services/role.service");
const commonErrors_1 = require("../services/commonErrors");
const roleService = new role_service_1.RoleService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[RoleController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listRoles = async (req, res) => {
    try {
        const data = await roleService.list(req.query);
        res.status(200).json({ success: true, message: 'Roles fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listRoles = listRoles;
const createRole = async (req, res) => {
    try {
        const data = await roleService.create(req.body);
        res.status(201).json({ success: true, message: 'Role created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createRole = createRole;
const updateRole = async (req, res) => {
    try {
        const data = await roleService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Role updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    try {
        await roleService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Role deleted' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=role.controller.js.map