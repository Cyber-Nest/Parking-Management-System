"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = exports.InvoiceService = void 0;
const invoice_repository_1 = require("../repositories/invoice.repository");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// pdfkit is CommonJS; `import * as` breaks at runtime (PDFDocument is not a constructor)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
class InvoiceService {
    constructor() {
        this.invoiceDir = path_1.default.join(__dirname, '../../invoices');
        if (!fs_1.default.existsSync(this.invoiceDir)) {
            fs_1.default.mkdirSync(this.invoiceDir, { recursive: true });
        }
    }
    async createInvoice(dto) {
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const invoice = await invoice_repository_1.invoiceRepository.createInvoice({
            invoice_number: invoiceNumber,
            customer_email: dto.customerEmail,
            customer_name: dto.customerName,
            vehicle_plate_number: dto.vehiclePlateNumber,
            vehicle_model: dto.vehicleModel,
            vehicle_color: dto.vehicleColor,
            item_description: dto.itemDescription,
            item_type: dto.itemType,
            quantity: dto.quantity,
            unit_price: dto.unitPrice,
            subtotal: dto.subtotal,
            tax_amount: dto.taxAmount,
            tax_rate: dto.taxRate || 13.0,
            discount_amount: dto.discountAmount || 0,
            service_fee: dto.serviceFee || 0,
            total_amount: dto.totalAmount,
            currency: 'CAD',
            booking_id: dto.bookingId,
            penalty_id: dto.penaltyId,
            transaction_id: dto.transactionId,
            parking_zone: dto.parkingZone,
            parking_location: dto.parkingLocation,
            start_time: dto.startTime,
            end_time: dto.endTime,
            duration_minutes: dto.durationMinutes,
            status: 'issued',
            metadata: {
                created_at: new Date().toISOString()
            }
        });
        if (!invoice) {
            throw new Error('Failed to create invoice');
        }
        const pdfPath = await this.generatePDF(invoice);
        await invoice_repository_1.invoiceRepository.updateInvoice(invoice.id, {
            pdf_file_path: pdfPath,
            file_generated_at: new Date(),
        });
        return invoice_repository_1.invoiceRepository.findInvoiceById(invoice.id);
    }
    async getInvoice(id) {
        return await invoice_repository_1.invoiceRepository.findInvoiceById(id);
    }
    async getInvoiceByNumber(invoiceNumber) {
        return await invoice_repository_1.invoiceRepository.findByNumber(invoiceNumber);
    }
    async getInvoicesByEmail(email, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        return await invoice_repository_1.invoiceRepository.findByEmail(email, limit, offset);
    }
    async getInvoiceByBookingId(bookingId) {
        return await invoice_repository_1.invoiceRepository.findByBookingId(bookingId);
    }
    async markAsPaid(invoiceId, paidAmount) {
        return await invoice_repository_1.invoiceRepository.markAsPaid(invoiceId, paidAmount);
    }
    async getInvoiceStats() {
        return await invoice_repository_1.invoiceRepository.getInvoiceStats();
    }
    async getTodayInvoices() {
        return await invoice_repository_1.invoiceRepository.getTodayInvoices();
    }
    async downloadInvoice(invoiceId) {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice)
            return null;
        // Record download
        await invoice_repository_1.invoiceRepository.recordDownload(invoiceId);
        return invoice.pdf_file_path;
    }
    async generatePDF(invoice) {
        const fileName = `${invoice.invoice_number}.pdf`;
        const filePath = path_1.default.join(this.invoiceDir, fileName);
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown(0.5);
            // Invoice details
            doc.fontSize(10).font('Helvetica');
            doc.text(`Invoice #: ${invoice.invoice_number}`, { align: 'left' });
            doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, { align: 'left' });
            doc.moveDown(1);
            // Customer info
            doc.fontSize(11).font('Helvetica-Bold').text('CUSTOMER INFORMATION');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${invoice.customer_name || 'N/A'}`);
            doc.text(`Email: ${invoice.customer_email}`);
            if (invoice.vehicle_plate_number) {
                doc.text(`Vehicle: ${invoice.vehicle_model} (${invoice.vehicle_plate_number})`);
            }
            doc.moveDown(1);
            // Items
            doc.fontSize(11).font('Helvetica-Bold').text('INVOICE ITEMS');
            doc.fontSize(9).font('Helvetica');
            const tableTop = doc.y;
            const col1 = 50;
            const col2 = 300;
            const col3 = 450;
            doc.text('Description', col1, tableTop);
            doc.text('Amount', col2, tableTop);
            doc.text('Total', col3, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            let yPosition = tableTop + 30;
            doc.text(invoice.item_description || 'Parking Service', col1, yPosition);
            doc.text(`$${parseFloat(invoice.unit_price).toFixed(2)}`, col2, yPosition);
            doc.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, col3, yPosition);
            yPosition += 30;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            // Totals
            yPosition += 20;
            doc.fontSize(10);
            if (invoice.discount_amount > 0) {
                doc.text(`Discount: -$${parseFloat(invoice.discount_amount).toFixed(2)}`, col3, yPosition);
                yPosition += 20;
            }
            doc.text(`Tax (${invoice.tax_rate || 13}%): $${parseFloat(invoice.tax_amount).toFixed(2)}`, col3, yPosition);
            yPosition += 20;
            if (invoice.service_fee > 0) {
                doc.text(`Service Fee: $${parseFloat(invoice.service_fee).toFixed(2)}`, col3, yPosition);
                yPosition += 20;
            }
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text(`Total Amount Due: $${parseFloat(invoice.total_amount).toFixed(2)}`, col3, yPosition);
            // Footer
            doc.moveTo(50, doc.page.height - 100).lineTo(550, doc.page.height - 100).stroke();
            doc.fontSize(9).font('Helvetica');
            doc.text('Thank you for your business!', { align: 'center', y: doc.page.height - 80 });
            doc.text('For inquiries, contact support@parksmart.com', { align: 'center' });
            doc.end();
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
            doc.on('error', reject);
        });
    }
}
exports.InvoiceService = InvoiceService;
exports.invoiceService = new InvoiceService();
//# sourceMappingURL=invoice.service.js.map