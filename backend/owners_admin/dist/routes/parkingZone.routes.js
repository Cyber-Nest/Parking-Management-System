"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const parkingZone_controller_1 = require("../controllers/parkingZone.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/', ...adminOnly(parkingZone_controller_1.listParkingZones));
router.get('/:id', ...adminOnly(parkingZone_controller_1.getParkingZone));
router.post('/', ...adminOnly(parkingZone_controller_1.createParkingZone));
router.patch('/:id', ...adminOnly(parkingZone_controller_1.updateParkingZone));
router.delete('/:id', ...adminOnly(parkingZone_controller_1.deleteParkingZone));
exports.default = router;
//# sourceMappingURL=parkingZone.routes.js.map