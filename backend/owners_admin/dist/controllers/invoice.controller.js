"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = exports.InvoiceController = void 0;
const invoice_service_1 = require("../services/invoice.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class InvoiceController {
    async createInvoice(req, res) {
        try {
            const { customerEmail, customerName, vehiclePlateNumber, vehicleModel, vehicleColor, itemDescription, itemType, quantity, unitPrice, subtotal, taxAmount, taxRate, discountAmount, serviceFee, totalAmount, bookingId, penaltyId, transactionId, parkingZone, parkingLocation, startTime, endTime, durationMinutes } = req.body;
            if (!customerEmail || !itemDescription || !totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: customerEmail, itemDescription, totalAmount'
                });
            }
            const invoice = await invoice_service_1.invoiceService.createInvoice({
                customerEmail,
                customerName,
                vehiclePlateNumber,
                vehicleModel,
                vehicleColor,
                itemDescription,
                itemType: itemType || 'parking_booking',
                quantity: quantity || 1,
                unitPrice: unitPrice || totalAmount,
                subtotal: subtotal || totalAmount,
                taxAmount: taxAmount || 0,
                taxRate,
                discountAmount,
                serviceFee,
                totalAmount,
                bookingId,
                penaltyId,
                transactionId,
                parkingZone,
                parkingLocation,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                durationMinutes
            });
            return res.status(201).json({
                success: true,
                message: 'Invoice created successfully',
                data: invoice
            });
        }
        catch (error) {
            console.error('Error creating invoice:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create invoice'
            });
        }
    }
    async getInvoice(req, res) {
        try {
            const { id } = req.params;
            const invoice = await invoice_service_1.invoiceService.getInvoice(id);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: invoice
            });
        }
        catch (error) {
            console.error('Error fetching invoice:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch invoice'
            });
        }
    }
    async getInvoiceByNumber(req, res) {
        try {
            const { invoiceNumber } = req.params;
            const invoice = await invoice_service_1.invoiceService.getInvoiceByNumber(invoiceNumber);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: invoice
            });
        }
        catch (error) {
            console.error('Error fetching invoice:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch invoice'
            });
        }
    }
    async getInvoicesByEmail(req, res) {
        try {
            const { email } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await invoice_service_1.invoiceService.getInvoicesByEmail(email, page, limit);
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
            console.error('Error fetching invoices:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch invoices'
            });
        }
    }
    async downloadInvoice(req, res) {
        try {
            const { id } = req.params;
            const filePath = await invoice_service_1.invoiceService.downloadInvoice(id);
            if (!filePath) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }
            if (!fs_1.default.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice file not found'
                });
            }
            const fileName = path_1.default.basename(filePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            const stream = fs_1.default.createReadStream(filePath);
            stream.pipe(res);
        }
        catch (error) {
            console.error('Error downloading invoice:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to download invoice'
            });
        }
    }
    async markAsPaid(req, res) {
        try {
            const { id } = req.params;
            const { paidAmount } = req.body;
            if (!paidAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required field: paidAmount'
                });
            }
            const result = await invoice_service_1.invoiceService.markAsPaid(id, paidAmount);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Invoice marked as paid',
                data: result
            });
        }
        catch (error) {
            console.error('Error marking invoice as paid:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark invoice as paid'
            });
        }
    }
    async getInvoiceStats(req, res) {
        try {
            const stats = await invoice_service_1.invoiceService.getInvoiceStats();
            return res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch invoice stats'
            });
        }
    }
    async getTodayInvoices(req, res) {
        try {
            const stats = await invoice_service_1.invoiceService.getTodayInvoices();
            return res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching today invoices:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch today invoices'
            });
        }
    }
}
exports.InvoiceController = InvoiceController;
exports.invoiceController = new InvoiceController();
//# sourceMappingURL=invoice.controller.js.map