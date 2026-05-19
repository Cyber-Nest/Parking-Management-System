import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';

export class TransactionController {
  async createTransaction(req: Request, res: Response) {
    try {
      const { amount, paymentMethod, transactionType, bookingId, penaltyId, userEmail, stripePaymentIntentId } = req.body;

      if (!amount || !paymentMethod || !transactionType || !userEmail) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: amount, paymentMethod, transactionType, userEmail'
        });
      }

      const transaction = await transactionService.createTransaction({
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
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create transaction'
      });
    }
  }

  async getTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.getTransaction(id);

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
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction'
      });
    }
  }

  async getTransactionByReference(req: Request, res: Response) {
    try {
      const { reference } = req.params;
      const transaction = await transactionService.getTransactionByReference(reference);

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
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction'
      });
    }
  }

  async getTransactionsByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await transactionService.getTransactionsByEmail(email, page, limit);

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
      console.error('Error fetching transactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions'
      });
    }
  }

  async completeTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await transactionService.completeTransaction(id);

      return res.status(200).json({
        success: true,
        message: 'Transaction marked as completed'
      });
    } catch (error) {
      console.error('Error completing transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to complete transaction'
      });
    }
  }

  async failTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { responseCode, responseMessage } = req.body;

      if (!responseCode || !responseMessage) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: responseCode, responseMessage'
        });
      }

      await transactionService.failTransaction(id, responseCode, responseMessage);

      return res.status(200).json({
        success: true,
        message: 'Transaction marked as failed'
      });
    } catch (error) {
      console.error('Error failing transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fail transaction'
      });
    }
  }

  async getTransactionStats(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      let startDate, endDate;

      if (from && to) {
        startDate = new Date(from as string);
        endDate = new Date(to as string);
      }

      const stats = await transactionService.getTransactionStats(startDate, endDate);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction stats'
      });
    }
  }

  async getRevenueByDate(req: Request, res: Response) {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          message: 'Missing required query parameters: from, to'
        });
      }

      const startDate = new Date(from as string);
      const endDate = new Date(to as string);

      const revenue = await transactionService.getRevenueByDate(startDate, endDate);

      return res.status(200).json({
        success: true,
        data: revenue
      });
    } catch (error) {
      console.error('Error fetching revenue:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue data'
      });
    }
  }

  async getTodayRevenue(req: Request, res: Response) {
    try {
      const revenue = await transactionService.getTodayRevenue();

      return res.status(200).json({
        success: true,
        data: revenue
      });
    } catch (error) {
      console.error('Error fetching today revenue:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch today revenue'
      });
    }
  }
}

export const transactionController = new TransactionController();
