"use strict";
// src/utils/email.ts
// Nodemailer email sender — logs every send to email_logs table
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetTemplate = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.smtp.host,
    port: env_1.env.smtp.port,
    secure: env_1.env.smtp.secure,
    auth: {
        user: env_1.env.smtp.user,
        pass: env_1.env.smtp.pass,
    },
});
/**
 * Send an email and log result to email_logs table
 */
const sendEmail = async (options) => {
    const { to, subject, html, emailType, relatedId } = options;
    let status = 'sent';
    let errorMessage = null;
    try {
        await transporter.sendMail({ from: env_1.env.smtp.from, to, subject, html });
    }
    catch (err) {
        status = 'failed';
        errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Email] Failed to send:', errorMessage);
    }
    // Log to DB regardless of success
    try {
        await (0, database_1.execute)(`INSERT INTO email_logs (recipient_email, email_type, subject, related_id, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`, [to, emailType, subject, relatedId ?? null, status, errorMessage]);
    }
    catch (dbErr) {
        console.error('[Email] Failed to log email to DB:', dbErr);
    }
    return status === 'sent';
};
exports.sendEmail = sendEmail;
// ─── Email Templates ──────────────────────────────────────────
const passwordResetTemplate = (name, resetLink) => `
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
exports.passwordResetTemplate = passwordResetTemplate;
//# sourceMappingURL=email.js.map