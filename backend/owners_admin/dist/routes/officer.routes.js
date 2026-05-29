"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const officer_controller_1 = require("../controllers/officer.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/summary', ...adminOnly(officer_controller_1.getOfficerSummary));
router.get('/:id', ...adminOnly(officer_controller_1.getOfficerById));
router.get('/', ...adminOnly(officer_controller_1.listOfficers));
router.post('/', ...adminOnly(officer_controller_1.createOfficer));
router.patch('/:id/status', ...adminOnly(officer_controller_1.setOfficerStatus));
router.patch('/:id', ...adminOnly(officer_controller_1.updateOfficer));
router.delete('/:id', ...adminOnly(officer_controller_1.deleteOfficer));
exports.default = router;
//# sourceMappingURL=officer.routes.js.map