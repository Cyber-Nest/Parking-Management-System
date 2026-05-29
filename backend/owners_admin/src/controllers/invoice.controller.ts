import { Request, Response } from 'express';
import { invoiceService } from '../services/invoice.service';
import fs from 'fs';
import path from 'path';

export class InvoiceController {
  async createInvoice(req: Request, res: Response) {
    try {
      const {
        customerEmail, customerName, vehiclePlateNumber, vehicleModel,
        vehicleColor, itemDescription, itemType, quantity, unitPrice,
        subtotal, taxAmount, taxRate, discountAmount, serviceFee,
        totalAmount, bookingId, penaltyId, transactionId, parkingZone,
        parkingLocation, startTime, endTime, durationMinutes
      } = req.body;

      if (!customerEmail || !itemDescription || !totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: customerEmail, itemDescription, totalAmount'
        });
      }

      const invoice = await invoiceService.createInvoice({
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
    } catch (error) {
      console.error('Error creating invoice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create invoice'
      });
    }
  }

  async getInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getInvoice(id);

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
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice'
      });
    }
  }

  async getInvoiceByNumber(req: Request, res: Response) {
    try {
      const { invoiceNumber } = req.params;
      const invoice = await invoiceService.getInvoiceByNumber(invoiceNumber);

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
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice'
      });
    }
  }

  async getInvoicesByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await invoiceService.getInvoicesByEmail(email, page, limit);

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
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch invoices'
      });
    }
  }

  async downloadInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const filePath = await invoiceService.downloadInvoice(id);

      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Invoice file not found'
        });
      }

      const fileName = path.basename(filePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      return;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download invoice'
      });
    }
  }

  async markAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paidAmount } = req.body;

      if (!paidAmount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: paidAmount'
        });
      }

      const result = await invoiceService.markAsPaid(id, paidAmount);

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
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark invoice as paid'
      });
    }
  }

  async getInvoiceStats(_req: Request, res: Response) {
    try {
      const stats = await invoiceService.getInvoiceStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice stats'
      });
    }
  }

  async getTodayInvoices(_req: Request, res: Response) {
    try {
      const stats = await invoiceService.getTodayInvoices();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching today invoices:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch today invoices'
      });
    }
  }
}

export const invoiceController = new InvoiceController();
