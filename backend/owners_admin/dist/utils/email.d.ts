import { SendEmailOptions } from '../types';
/**
 * Send an email and log result to email_logs table
 */
export declare const sendEmail: (options: SendEmailOptions) => Promise<boolean>;
export declare const passwordResetTemplate: (name: string, resetLink: string) => string;
//# sourceMappingURL=email.d.ts.map