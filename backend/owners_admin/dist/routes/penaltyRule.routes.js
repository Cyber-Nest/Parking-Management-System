"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const penaltyRule_controller_1 = require("../controllers/penaltyRule.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/', ...adminOnly(penaltyRule_controller_1.listPenaltyRules));
router.post('/', ...adminOnly(penaltyRule_controller_1.createPenaltyRule));
router.patch('/:id', ...adminOnly(penaltyRule_controller_1.updatePenaltyRule));
router.delete('/:id', ...adminOnly(penaltyRule_controller_1.deletePenaltyRule));
exports.default = router;
//# sourceMappingURL=penaltyRule.routes.js.map