import { invoiceRepository } from "../repositories/invoice.repository";
import fs from "fs";
import path from "path";
// pdfkit is CommonJS; `import * as` breaks at runtime (PDFDocument is not a constructor)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

export interface CreateInvoiceDTO {
  customerEmail: string;
  customerName?: string;
  vehiclePlateNumber?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  itemDescription: string;
  itemType: "parking_booking" | "penalty" | "extension" | "adjustment";
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  taxRate?: number;
  discountAmount?: number;
  serviceFee?: number;
  totalAmount: number;
  bookingId?: string;
  penaltyId?: string;
  transactionId?: string;
  parkingZone?: string;
  parkingLocation?: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
}

export class InvoiceService {
  // private readonly invoiceDir = path.join(__dirname, '../../invoices');
  private readonly invoiceDir = "/tmp/invoices";
  constructor() {
    if (!fs.existsSync(this.invoiceDir)) {
      fs.mkdirSync(this.invoiceDir, { recursive: true });
    }
  }

  async createInvoice(dto: CreateInvoiceDTO) {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const invoice = await invoiceRepository.createInvoice({
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
      currency: "CAD",
      booking_id: dto.bookingId,
      penalty_id: dto.penaltyId,
      transaction_id: dto.transactionId,
      parking_zone: dto.parkingZone,
      parking_location: dto.parkingLocation,
      start_time: dto.startTime,
      end_time: dto.endTime,
      duration_minutes: dto.durationMinutes,
      status: "issued",
      metadata: {
        created_at: new Date().toISOString(),
      },
    });

    if (!invoice) {
      throw new Error("Failed to create invoice");
    }

    const pdfPath = await this.generatePDF(invoice);

    await invoiceRepository.updateInvoice(invoice.id, {
      pdf_file_path: pdfPath,
      file_generated_at: new Date(),
    });

    return invoiceRepository.findInvoiceById(invoice.id);
  }

  async getInvoice(id: string) {
    return await invoiceRepository.findInvoiceById(id);
  }

  async getInvoiceByTransactionId(transactionId: string) {
    return await invoiceRepository.findByTransactionId(transactionId);
  }

  async getInvoiceByPenaltyId(penaltyId: string) {
    return await invoiceRepository.findByPenaltyId(penaltyId);
  }

  async getInvoiceByNumber(invoiceNumber: string) {
    return await invoiceRepository.findByNumber(invoiceNumber);
  }

  async getInvoicesByEmail(email: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return await invoiceRepository.findByEmail(email, limit, offset);
  }

  async getInvoiceByBookingId(bookingId: string) {
    return await invoiceRepository.findByBookingId(bookingId);
  }

  async markAsPaid(invoiceId: string, paidAmount: number) {
    return await invoiceRepository.markAsPaid(invoiceId, paidAmount);
  }

  async getInvoiceStats() {
    return await invoiceRepository.getInvoiceStats();
  }

  async getTodayInvoices() {
    return await invoiceRepository.getTodayInvoices();
  }

  async downloadInvoice(invoiceId: string): Promise<string | null> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) return null;

    // Record download
    await invoiceRepository.recordDownload(invoiceId);

    return invoice.pdf_file_path ?? null;
  }

  private async generatePDF(invoice: any): Promise<string> {
    const fileName = `${invoice.invoice_number}.pdf`;
    const filePath = path.join(this.invoiceDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("INVOICE", { align: "center" });
      doc.moveDown(0.5);

      // Invoice details
      doc.fontSize(10).font("Helvetica");
      doc.text(`Invoice #: ${invoice.invoice_number}`, { align: "left" });
      doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, {
        align: "left",
      });
      doc.moveDown(1);

      // Customer info
      doc.fontSize(11).font("Helvetica-Bold").text("CUSTOMER INFORMATION");
      doc.fontSize(10).font("Helvetica");
      // doc.text(`Name: ${invoice.customer_name || "N/A"}`);
      doc.text(`Email: ${invoice.customer_email}`);
      if (invoice.vehicle_plate_number) {
        doc.text(
          `Vehicle: ${invoice.vehicle_model} (${invoice.vehicle_plate_number})`,
        );
      }
      doc.moveDown(1);

      // Items
      doc.fontSize(11).font("Helvetica-Bold").text("INVOICE ITEMS");
      doc.fontSize(9).font("Helvetica");

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 300;
      const col3 = 450;

      doc.text("Description", col1, tableTop);
      doc.text("Amount", col2, tableTop);
      doc.text("Total", col3, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      let yPosition = tableTop + 30;
      doc.text(invoice.item_description || "Parking Service", col1, yPosition);
      doc.text(
        `$${parseFloat(invoice.unit_price).toFixed(2)}`,
        col2,
        yPosition,
      );
      doc.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, col3, yPosition);

      yPosition += 30;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

      // Totals
      yPosition += 20;
      doc.fontSize(10);

      if (invoice.discount_amount > 0) {
        doc.text(
          `Discount: -$${parseFloat(invoice.discount_amount).toFixed(2)}`,
          col3,
          yPosition,
        );
        yPosition += 20;
      }

      doc.text(
        `Tax (${invoice.tax_rate || 13}%): $${parseFloat(invoice.tax_amount).toFixed(2)}`,
        col3,
        yPosition,
      );
      yPosition += 20;

      if (invoice.service_fee > 0) {
        doc.text(
          `Service Fee: $${parseFloat(invoice.service_fee).toFixed(2)}`,
          col3,
          yPosition,
        );
        yPosition += 20;
      }

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text(
        `Total Amount Due: $${parseFloat(invoice.total_amount).toFixed(2)}`,
        col3,
        yPosition,
      );

      // Footer
      doc
        .moveTo(50, doc.page.height - 100)
        .lineTo(550, doc.page.height - 100)
        .stroke();
      doc.fontSize(9).font("Helvetica");
      doc.text("Thank you for your business!", 50, doc.page.height - 80, {
        align: "center",
      });
      doc.text("For inquiries, contact support@parksmart.com", {
        align: "center",
      });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
      doc.on("error", reject);
    });
  }
}

export const invoiceService = new InvoiceService();
