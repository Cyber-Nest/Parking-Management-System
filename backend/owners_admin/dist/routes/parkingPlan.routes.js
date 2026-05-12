"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const parkingPlan_controller_1 = require("../controllers/parkingPlan.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/', ...adminOnly(parkingPlan_controller_1.listParkingPlans));
router.post('/', ...adminOnly(parkingPlan_controller_1.createParkingPlan));
router.patch('/:id', ...adminOnly(parkingPlan_controller_1.updateParkingPlan));
router.delete('/:id', ...adminOnly(parkingPlan_controller_1.deleteParkingPlan));
exports.default = router;
//# sourceMappingURL=parkingPlan.routes.js.map