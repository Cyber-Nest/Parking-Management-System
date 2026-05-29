"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = exports.TransactionController = void 0;
const transaction_service_1 = require("../services/transaction.service");
class TransactionController {
    async createTransaction(req, res) {
        try {
            const { amount, paymentMethod, transactionType, bookingId, penaltyId, userEmail, stripePaymentIntentId } = req.body;
            if (!amount || !paymentMethod || !transactionType || !userEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: amount, paymentMethod, transactionType, userEmail'
                });
            }
            const transaction = await transaction_service_1.transactionService.createTransaction({
                amount,
                paymentMethod,
                transactionType,
                bookingId,
                penaltyId,
                userEmail,
                stripePaymentIntentId,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
            return res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: transaction
            });
        }
        catch (error) {
            console.error('Error creating transaction:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create transaction'
            });
        }
    }
    async getTransaction(req, res) {
        try {
            const { id } = req.params;
            const transaction = await transaction_service_1.transactionService.getTransaction(id);
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: transaction
            });
        }
        catch (error) {
            console.error('Error fetching transaction:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction'
            });
        }
    }
    async getTransactionByReference(req, res) {
        try {
            const { reference } = req.params;
            const transaction = await transaction_service_1.transactionService.getTransactionByReference(reference);
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: transaction
            });
        }
        catch (error) {
            console.error('Error fetching transaction:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction'
            });
        }
    }
    async getTransactionsByEmail(req, res) {
        try {
            const { email } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await transaction_service_1.transactionService.getTransactionsByEmail(email, page, limit);
            return res.status(200).json({
                success: true,
                data: result.rows,
                pagination: {
                    total: result.count,
                    page,
                    limit,
                    pages: Math.ceil(result.count / limit)
                }
            });
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transactions'
            });
        }
    }
    async completeTransaction(req, res) {
        try {
            const { id } = req.params;
            await transaction_service_1.transactionService.completeTransaction(id);
            return res.status(200).json({
                success: true,
                message: 'Transaction marked as completed'
            });
        }
        catch (error) {
            console.error('Error completing transaction:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to complete transaction'
            });
        }
    }
    async failTransaction(req, res) {
        try {
            const { id } = req.params;
            const { responseCode, responseMessage } = req.body;
            if (!responseCode || !responseMessage) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: responseCode, responseMessage'
                });
            }
            await transaction_service_1.transactionService.failTransaction(id, responseCode, responseMessage);
            return res.status(200).json({
                success: true,
                message: 'Transaction marked as failed'
            });
        }
        catch (error) {
            console.error('Error failing transaction:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fail transaction'
            });
        }
    }
    async getTransactionStats(req, res) {
        try {
            const { from, to } = req.query;
            let startDate, endDate;
            if (from && to) {
                startDate = new Date(from);
                endDate = new Date(to);
            }
            const stats = await transaction_service_1.transactionService.getTransactionStats(startDate, endDate);
            return res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction stats'
            });
        }
    }
    async getRevenueByDate(req, res) {
        try {
            const { from, to } = req.query;
            if (!from || !to) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required query parameters: from, to'
                });
            }
            const startDate = new Date(from);
            const endDate = new Date(to);
            const revenue = await transaction_service_1.transactionService.getRevenueByDate(startDate, endDate);
            return res.status(200).json({
                success: true,
                data: revenue
            });
        }
        catch (error) {
            console.error('Error fetching revenue:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch revenue data'
            });
        }
    }
    async getTodayRevenue(_req, res) {
        try {
            const revenue = await transaction_service_1.transactionService.getTodayRevenue();
            return res.status(200).json({
                success: true,
                data: revenue
            });
        }
        catch (error) {
            console.error('Error fetching today revenue:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch today revenue'
            });
        }
    }
}
exports.TransactionController = TransactionController;
exports.transactionController = new TransactionController();
//# sourceMappingURL=transaction.controller.js.map