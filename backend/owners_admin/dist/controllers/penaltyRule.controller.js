"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePenaltyRule = exports.updatePenaltyRule = exports.createPenaltyRule = exports.listPenaltyRules = void 0;
const penaltyRule_service_1 = require("../services/penaltyRule.service");
const commonErrors_1 = require("../services/commonErrors");
const penaltyRuleService = new penaltyRule_service_1.PenaltyRuleService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[PenaltyRuleController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listPenaltyRules = async (req, res) => {
    try {
        const data = await penaltyRuleService.list(req.query);
        res.status(200).json({ success: true, message: 'Penalty rules fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listPenaltyRules = listPenaltyRules;
const createPenaltyRule = async (req, res) => {
    try {
        const { violation, code, amount, grace_minutes, grace, description, status } = req.body;
        if (!violation || String(violation).trim() === '')
            throw new commonErrors_1.ValidationError('violation is required');
        if (!code || String(code).trim() === '')
            throw new commonErrors_1.ValidationError('code is required');
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0)
            throw new commonErrors_1.ValidationError('amount must be a positive number');
        const data = await penaltyRuleService.create({
            violation: String(violation).trim(),
            code: String(code).trim(),
            amount: numericAmount,
            grace_minutes: grace_minutes !== undefined ? Number(grace_minutes) : grace !== undefined ? Number(grace) : 0,
            description: description ? String(description) : undefined,
            status: status ? String(status) : 'Active',
        });
        res.status(201).json({ success: true, message: 'Penalty rule created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createPenaltyRule = createPenaltyRule;
const updatePenaltyRule = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updates = {};
        if (body.violation !== undefined)
            updates.violation = String(body.violation).trim();
        if (body.code !== undefined)
            updates.code = String(body.code).trim();
        if (body.amount !== undefined) {
            const n = Number(body.amount);
            if (!Number.isFinite(n) || n <= 0)
                throw new commonErrors_1.ValidationError('amount must be a positive number');
            updates.amount = n;
        }
        if (body.grace_minutes !== undefined)
            updates.grace_minutes = Number(body.grace_minutes);
        if (body.grace !== undefined && body.grace_minutes === undefined)
            updates.grace_minutes = Number(body.grace);
        if (body.description !== undefined)
            updates.description = body.description ? String(body.description) : null;
        if (body.status !== undefined)
            updates.status = String(body.status);
        const data = await penaltyRuleService.update(id, updates);
        res.status(200).json({ success: true, message: 'Penalty rule updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updatePenaltyRule = updatePenaltyRule;
const deletePenaltyRule = async (req, res) => {
    try {
        const ok = await penaltyRuleService.delete(req.params.id);
        res.status(ok ? 200 : 404).json({
            success: ok,
            message: ok ? 'Penalty rule deleted' : 'Penalty rule not found',
        });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deletePenaltyRule = deletePenaltyRule;
//# sourceMappingURL=penaltyRule.controller.js.map