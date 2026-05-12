"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingPlan = exports.updateParkingPlan = exports.createParkingPlan = exports.listParkingPlans = void 0;
const parkingPlan_service_1 = require("../services/parkingPlan.service");
const commonErrors_1 = require("../services/commonErrors");
const parkingPlanService = new parkingPlan_service_1.ParkingPlanService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.BadRequestError || err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[ParkingPlanController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listParkingPlans = async (_req, res) => {
    try {
        const data = await parkingPlanService.list();
        res.status(200).json({ success: true, message: 'Parking plans fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listParkingPlans = listParkingPlans;
const createParkingPlan = async (req, res) => {
    try {
        const { name, price, duration } = req.body;
        const data = await parkingPlanService.create({
            name: name ?? '',
            price: Number(price),
            duration: Number(duration),
        });
        res.status(201).json({ success: true, message: 'Parking plan created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createParkingPlan = createParkingPlan;
const updateParkingPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, duration } = req.body;
        const data = await parkingPlanService.update(id, {
            name,
            price: price !== undefined ? Number(price) : undefined,
            duration: duration !== undefined ? Number(duration) : undefined,
        });
        res.status(200).json({ success: true, message: 'Parking plan updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateParkingPlan = updateParkingPlan;
const deleteParkingPlan = async (req, res) => {
    try {
        await parkingPlanService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Parking plan deleted' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteParkingPlan = deleteParkingPlan;
//# sourceMappingURL=parkingPlan.controller.js.map