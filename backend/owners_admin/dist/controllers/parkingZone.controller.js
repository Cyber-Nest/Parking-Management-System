"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingZone = exports.updateParkingZone = exports.createParkingZone = exports.getParkingZone = exports.listParkingZones = void 0;
const parkingZone_service_1 = require("../services/parkingZone.service");
const commonErrors_1 = require("../services/commonErrors");
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[ParkingZoneController]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listParkingZones = async (req, res) => {
    try {
        const data = await parkingZone_service_1.parkingZoneService.list(req.query);
        res.status(200).json({ success: true, message: 'Parking zones fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listParkingZones = listParkingZones;
const getParkingZone = async (req, res) => {
    try {
        const data = await parkingZone_service_1.parkingZoneService.getById(req.params.id);
        res.status(200).json({ success: true, message: 'Parking zone fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getParkingZone = getParkingZone;
const createParkingZone = async (req, res) => {
    try {
        const data = await parkingZone_service_1.parkingZoneService.create(req.body);
        res.status(201).json({ success: true, message: 'Parking zone created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createParkingZone = createParkingZone;
const updateParkingZone = async (req, res) => {
    try {
        const data = await parkingZone_service_1.parkingZoneService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Parking zone updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateParkingZone = updateParkingZone;
const deleteParkingZone = async (req, res) => {
    try {
        const data = await parkingZone_service_1.parkingZoneService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Parking zone deleted', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteParkingZone = deleteParkingZone;
//# sourceMappingURL=parkingZone.controller.js.map