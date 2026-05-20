"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricing_controller_1 = require("../controllers/pricing.controller");
const router = (0, express_1.Router)();
router.get('/', pricing_controller_1.listPricings);
router.post('/', pricing_controller_1.createPricing);
router.patch('/:id', pricing_controller_1.updatePricing);
router.delete('/:id', pricing_controller_1.deletePricing);
exports.default = router;
//# sourceMappingURL=pricing.routes.js.map