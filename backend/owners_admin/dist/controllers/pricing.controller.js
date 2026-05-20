"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePricing = exports.updatePricing = exports.createPricing = exports.listPricings = void 0;
const pricing_service_1 = require("../services/pricing.service");
const commonErrors_1 = require("../services/commonErrors");
const pricingService = new pricing_service_1.PricingService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[PricingController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listPricings = async (req, res) => {
    try {
        const data = await pricingService.list(req.query);
        res.status(200).json({ success: true, message: 'Pricings fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listPricings = listPricings;
const createPricing = async (req, res) => {
    try {
        const data = await pricingService.create(req.body);
        res.status(201).json({ success: true, message: 'Pricing created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createPricing = createPricing;
const updatePricing = async (req, res) => {
    try {
        const data = await pricingService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Pricing updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updatePricing = updatePricing;
const deletePricing = async (req, res) => {
    try {
        await pricingService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Pricing deleted' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deletePricing = deletePricing;
//# sourceMappingURL=pricing.controller.js.map