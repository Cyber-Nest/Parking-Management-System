"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTax = exports.updateTax = exports.createTax = exports.listTaxes = void 0;
const tax_service_1 = require("../services/tax.service");
const commonErrors_1 = require("../services/commonErrors");
const taxService = new tax_service_1.TaxService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[TaxController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listTaxes = async (req, res) => {
    try {
        const data = await taxService.list(req.query);
        res.status(200).json({ success: true, message: 'Taxes fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listTaxes = listTaxes;
const createTax = async (req, res) => {
    try {
        const data = await taxService.create(req.body);
        res.status(201).json({ success: true, message: 'Tax created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createTax = createTax;
const updateTax = async (req, res) => {
    try {
        const data = await taxService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Tax updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateTax = updateTax;
const deleteTax = async (req, res) => {
    try {
        await taxService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Tax deleted' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteTax = deleteTax;
//# sourceMappingURL=tax.controller.js.map