"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.listUsers = void 0;
const user_service_1 = require("../services/user.service");
const commonErrors_1 = require("../services/commonErrors");
const userService = new user_service_1.UserService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[UserController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listUsers = async (req, res) => {
    try {
        const data = await userService.list(req.query);
        res.status(200).json({ success: true, message: 'Users fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listUsers = listUsers;
const createUser = async (req, res) => {
    try {
        const data = await userService.create(req.body);
        res.status(201).json({ success: true, message: 'User created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const data = await userService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'User updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        await userService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map