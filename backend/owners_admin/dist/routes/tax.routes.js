"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tax_controller_1 = require("../controllers/tax.controller");
const router = (0, express_1.Router)();
router.get('/', tax_controller_1.listTaxes);
router.post('/', tax_controller_1.createTax);
router.patch('/:id', tax_controller_1.updateTax);
router.delete('/:id', tax_controller_1.deleteTax);
exports.default = router;
//# sourceMappingURL=tax.routes.js.map