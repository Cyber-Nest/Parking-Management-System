// src/utils/email.ts
// Nodemailer email sender — logs every send to email_logs table

import nodemailer from 'nodemailer';
import { execute } from '../config/database';
import { SendEmailOptions } from '../types';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

/**
 * Send an email and log result to email_logs table
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  const { to, subject, html, emailType, relatedId, attachments } = options;
  let status: 'sent' | 'failed' = 'sent';
  let errorMessage: string | null = null;

  try {
    const mailOptions: any = {
      from: env.smtp.from,
      to,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Successfully sent "${emailType}" email to ${to}`);
  } catch (err) {
    status = 'failed';
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Failed to send:', errorMessage, '| To:', to, '| Type:', emailType);
  }

  // Log to DB regardless of success
  try {
    await execute(
      `INSERT INTO email_logs (recipient_email, email_type, subject, related_id, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [to, emailType, subject, relatedId ?? null, status, errorMessage]
    );
  } catch (dbErr) {
    console.error('[Email] Failed to log email to DB:', dbErr);
  }

  return status === 'sent';
};

// ─── Email Templates ──────────────────────────────────────────

export const passwordResetTemplate = (name: string, resetLink: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <!-- Header -->
          <tr>
            <td style="background:#006B5E;padding:28px 32px;border-radius:10px 10px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:26px;letter-spacing:1px">
                🅿️ ParkSmart
              </h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">
                Admin Portal
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:white;padding:36px 32px;border:1px solid #e0e0e0">
              <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:20px">
                Password Reset Request
              </h2>
              <p style="color:#444;line-height:1.7;margin:0 0 12px">
                Hi <strong>${name}</strong>,
              </p>
              <p style="color:#444;line-height:1.7;margin:0 0 28px">
                We received a request to reset your ParkSmart Admin password.
                Click the button below to create a new password.
              </p>
              <div style="text-align:center;margin:0 0 28px">
                <a href="${resetLink}"
                   style="display:inline-block;background:#006B5E;color:white;
                          padding:15px 40px;text-decoration:none;border-radius:8px;
                          font-weight:bold;font-size:15px;letter-spacing:0.5px">
                  Reset My Password
                </a>
              </div>
              <div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;margin-bottom:24px">
                <p style="margin:0;color:#92400e;font-size:13px">
                  ⏰ This link expires in <strong>1 hour</strong>.
                  If you didn't request this, please ignore this email — your password won't change.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:18px 32px;border-radius:0 0 10px 10px;
                       border:1px solid #e0e0e0;border-top:none;text-align:center">
              <p style="margin:0;color:#999;font-size:12px">
                © 2026 ParkSmart Systems. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export interface PaymentReceiptData {
  bookingId?: string;
  customerName?: string;
  customerEmail: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  parkingName: string;
  parkingLocation: string;
  startTime: Date;
  endTime: Date;
  durationLabel: string;
  bookingReference: string;
  invoiceNumber: string;
  totalAmount: number;
  basePrice: number;
  serviceFee: number;
  frontendUrl?: string;
}

export const paymentReceiptTemplate = (data: PaymentReceiptData): string => {
  const startTimeStr = data.startTime.toLocaleString();
  const endTimeStr = data.endTime.toLocaleString();
  const amountStr = `$${data.totalAmount.toFixed(2)}`;
  const extendBookingUrl = data.bookingId && data.frontendUrl
    ? `${data.frontendUrl}/customer/bookings/${data.bookingId}/extend`
    : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #006B5E 0%, #00897B 100%);padding:28px 32px;border-radius:10px 10px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:26px;letter-spacing:1px">
                🅿️ ParkSmart
              </h1>
              <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px;font-weight:bold">
                Parking Reservation Confirmed
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:white;padding:36px 32px;border:1px solid #e0e0e0">
              <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:6px;padding:16px;margin-bottom:24px;text-align:center">
                <p style="margin:0;color:#155724;font-size:14px;font-weight:bold">
                  ✓ Payment Successful
                </p>
              </div>

              <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:18px">
                Booking Details
              </h2>

              <!-- Booking Info Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Reservation #</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.bookingReference}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Invoice #</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.invoiceNumber}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Parking Location</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.parkingName}</p>
                    <p style="margin:2px 0 0;color:#999;font-size:12px">${data.parkingLocation}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Duration</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.durationLabel}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Vehicle</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.vehicleModel}</p>
                    <p style="margin:2px 0 0;color:#999;font-size:12px">${data.vehiclePlateNumber}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Parking Time</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:13px"><strong>Start:</strong> ${startTimeStr}</p>
                    <p style="margin:4px 0 0;color:#1a1a2e;font-size:13px"><strong>End:</strong> ${endTimeStr}</p>
                  </td>
                </tr>
              </table>

              <!-- Price Breakdown -->
              <h3 style="color:#1a1a2e;margin:24px 0 12px;font-size:14px;font-weight:bold">
                Amount Paid
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr>
                  <td style="padding:8px 0;text-align:right">
                    <p style="margin:0;color:#666;font-size:13px">Parking Fee:</p>
                  </td>
                  <td style="padding:8px 0 8px 16px;text-align:right;width:120px">
                    <p style="margin:0;color:#1a1a2e;font-size:13px;font-weight:bold">$${data.basePrice.toFixed(2)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;text-align:right;border-bottom:2px solid #006B5E">
                    <p style="margin:0;color:#666;font-size:13px">Service Fee:</p>
                  </td>
                  <td style="padding:8px 0 8px 16px;text-align:right;width:120px;border-bottom:2px solid #006B5E">
                    <p style="margin:0;color:#1a1a2e;font-size:13px;font-weight:bold">$${data.serviceFee.toFixed(2)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;text-align:right">
                    <p style="margin:0;color:#1a1a2e;font-size:16px;font-weight:bold">Total Paid:</p>
                  </td>
                  <td style="padding:12px 0 12px 16px;text-align:right;width:120px">
                    <p style="margin:0;color:#006B5E;font-size:18px;font-weight:bold">${amountStr}</p>
                  </td>
                </tr>
              </table>

              ${extendBookingUrl ? `
              <!-- Extend Booking CTA -->
              <div style="text-align:center;margin:24px 0">
                <a href="${extendBookingUrl}"
                   style="display:inline-block;background:#006B5E;color:white;
                          padding:12px 32px;text-decoration:none;border-radius:8px;
                          font-weight:bold;font-size:14px;letter-spacing:0.5px">
                  Extend Your Booking
                </a>
              </div>
              ` : ''}

              <!-- Important Info -->
              <div style="background:#fffbea;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin-bottom:24px">
                <p style="margin:0 0 8px 0;color:#92400e;font-size:13px;font-weight:bold">
                  ℹ️ Important Information
                </p>
                <ul style="margin:8px 0 0;padding-left:20px;color:#92400e;font-size:12px;line-height:1.6">
                  <li>Your parking reservation is confirmed and active</li>
                  <li>Invoice PDF is attached to this email</li>
                  <li>Please display your booking reference at entry</li>
                  <li>Late charges may apply if you exceed your reserved time</li>
                  <li>Click "Extend Your Booking" above to add more time before your reservation expires</li>
                </ul>
              </div>

              <p style="color:#999;line-height:1.7;margin:0;font-size:12px">
                Thank you for choosing ParkSmart! If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:18px 32px;border-radius:0 0 10px 10px;
                       border:1px solid #e0e0e0;border-top:none;text-align:center">
              <p style="margin:0;color:#999;font-size:12px">
                © 2026 ParkSmart Systems. All rights reserved.<br>
                <a href="https://parksmart.com" style="color:#006B5E;text-decoration:none">Visit ParkSmart</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export interface PenaltyNoticeData {
  customerEmail: string;
  licensePlate: string;
  ticketNumber: string;
  amount: number;
  reason: string;
  location: string;
  issuedAt: string;
  dueDate: string;
  frontendUrl?: string;
}

export const penaltyNoticeTemplate = (data: PenaltyNoticeData): string => {
  const paymentUrl = data.frontendUrl
    ? `${data.frontendUrl}/customer/penalties/${data.ticketNumber}`
    : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #d32f2f 0%, #c62828 100%);padding:28px 32px;border-radius:10px 10px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:26px;letter-spacing:1px">
                🅿️ ParkSmart
              </h1>
              <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px;font-weight:bold">
                Parking Violation Notice
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:white;padding:36px 32px;border:1px solid #e0e0e0">
              <div style="background:#ffebee;border:1px solid #ffcdd2;border-radius:6px;padding:16px;margin-bottom:24px;text-align:center">
                <p style="margin:0;color:#c62828;font-size:14px;font-weight:bold">
                  ⚠️ Parking Violation Issued
                </p>
              </div>

              <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:18px">
                Violation Details
              </h2>

              <!-- Violation Info Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Ticket Number</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.ticketNumber}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Amount</p>
                    <p style="margin:6px 0 0;color:#d32f2f;font-size:16px;font-weight:bold">$${data.amount.toFixed(2)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">License Plate</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.licensePlate}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Location</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.location}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:12px 0">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Violation Reason</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px">${data.reason}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Issued Date</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.issuedAt}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Due Date</p>
                    <p style="margin:6px 0 0;color:#d32f2f;font-size:14px;font-weight:bold">${data.dueDate}</p>
                  </td>
                </tr>
              </table>

              ${paymentUrl ? `
              <!-- Payment CTA -->
              <div style="text-align:center;margin:24px 0">
                <a href="${paymentUrl}"
                   style="display:inline-block;background:#d32f2f;color:white;
                          padding:12px 32px;text-decoration:none;border-radius:8px;
                          font-weight:bold;font-size:14px;letter-spacing:0.5px">
                  View Ticket & Pay
                </a>
              </div>
              ` : ''}

              <!-- Important Info -->
              <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:16px;border-radius:4px;margin-bottom:24px">
                <p style="margin:0 0 8px 0;color:#856404;font-size:13px;font-weight:bold">
                  ⚠️ Important
                </p>
                <ul style="margin:8px 0 0;padding-left:20px;color:#856404;font-size:12px;line-height:1.6">
                  <li>Please pay this violation before the due date to avoid additional penalties</li>
                  <li>You can dispute this violation if you believe it was issued in error</li>
                  <li>Visit the link above to view full details and submit payment or dispute</li>
                </ul>
              </div>

              <p style="color:#999;line-height:1.7;margin:0;font-size:12px">
                If you have questions about this violation, please contact our support team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:18px 32px;border-radius:0 0 10px 10px;
                       border:1px solid #e0e0e0;border-top:none;text-align:center">
              <p style="margin:0;color:#999;font-size:12px">
                © 2026 ParkSmart Systems. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export interface PenaltyPaymentData {
  customerEmail: string;
  licensePlate: string;
  ticketNumber: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  reason: string;
  receiptUrl?: string;
  invoiceNumber?: string;
}

export const penaltyPaymentTemplate = (data: PenaltyPaymentData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #006B5E 0%, #00897B 100%);padding:28px 32px;border-radius:10px 10px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:26px;letter-spacing:1px">
                🅿️ ParkSmart
              </h1>
              <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px;font-weight:bold">
                Penalty Payment Confirmation
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:white;padding:36px 32px;border:1px solid #e0e0e0">
              <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:6px;padding:16px;margin-bottom:24px;text-align:center">
                <p style="margin:0;color:#155724;font-size:14px;font-weight:bold">
                  ✓ Payment Received - Penalty Resolved
                </p>
              </div>

              <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:18px">
                Payment Details
              </h2>

              <!-- Payment Info Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Ticket Number</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.ticketNumber}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">License Plate</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.licensePlate}</p>
                  </td>
                </tr>
                ${data.invoiceNumber ? `
                <tr>
                  <td colspan="2" style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Receipt #</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.invoiceNumber}</p>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Amount Paid</p>
                    <p style="margin:6px 0 0;color:#006B5E;font-size:16px;font-weight:bold">$${data.amount.toFixed(2)}</p>
                  </td>
                  <td style="padding:12px 0 12px 24px;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Payment Method</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.paymentMethod}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:12px 0;border-bottom:1px solid #e5e5e5">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Violation Reason</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px">${data.reason}</p>
                  </td>
                </tr>
                ${data.receiptUrl ? `
                <tr>
                  <td colspan="2" style="padding:20px 0 0 0;text-align:center">
                    <a href="${data.receiptUrl}" style="display:inline-block;padding:14px 24px;background:#006B5E;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:bold">
                      Download Receipt
                    </a>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td colspan="2" style="padding:12px 0">
                    <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Date Paid</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:14px;font-weight:bold">${data.paidAt}</p>
                  </td>
                </tr>
              </table>

              <!-- Important Info -->
              <div style="background:#d4edda;border-left:4px solid #28a745;padding:16px;border-radius:4px;margin-bottom:24px">
                <p style="margin:0 0 8px 0;color:#155724;font-size:13px;font-weight:bold">
                  ✓ Status Update
                </p>
                <ul style="margin:8px 0 0;padding-left:20px;color:#155724;font-size:12px;line-height:1.6">
                  <li>Your penalty has been paid and marked as resolved</li>
                  <li>This ticket is now closed</li>
                  <li>Keep this confirmation email for your records</li>
                </ul>
              </div>

              <p style="color:#999;line-height:1.7;margin:0;font-size:12px">
                Thank you for resolving this violation. If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:18px 32px;border-radius:0 0 10px 10px;
                       border:1px solid #e0e0e0;border-top:none;text-align:center">
              <p style="margin:0;color:#999;font-size:12px">
                © 2026 ParkSmart Systems. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const officerWelcomeTemplate = (name: string, email: string, password: string, frontendUrl?: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <tr>
            <td style="background:#006B5E;padding:28px 32px;border-radius:10px 10px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:26px;letter-spacing:1px">🅿️ ParkSmart</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Officer Account Created</p>
            </td>
          </tr>
          <tr>
            <td style="background:white;padding:36px 32px;border:1px solid #e0e0e0">
              <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:20px">Welcome to ParkSmart</h2>
              <p style="color:#444;line-height:1.7;margin:0 0 12px">Hi <strong>${name}</strong>,</p>
              <p style="color:#444;line-height:1.7;margin:0 0 12px">An officer account has been created for you. Use the credentials below to sign in to the Officer Portal.</p>
              <table style="margin:12px 0 20px;background:#f7f7f7;padding:12px;border-radius:6px;width:100%">
                <tr><td style="font-weight:bold">Email:</td><td style="text-align:right">${email}</td></tr>
                <tr><td style="font-weight:bold">Password:</td><td style="text-align:right">${password}</td></tr>
              </table>
              ${frontendUrl ? `<p style="margin:0 0 16px">Sign in here: <a href="${frontendUrl}" style="color:#006B5E">${frontendUrl}</a></p>` : ''}
              <p style="color:#666;font-size:13px;margin:6px 0 0">For security, please change your password after first login.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;padding:18px 32px;border-radius:0 0 10px 10px;text-align:center">
              <p style="margin:0;color:#999;font-size:12px">© 2026 ParkSmart Systems. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;