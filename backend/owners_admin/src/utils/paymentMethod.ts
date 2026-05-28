import { PaymentMethod } from '../types';
import { ValidationError } from '../services/commonErrors';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'credit_card',
  'debit_card',
  'apple_pay',
  'visa',
  'mastercard',
  'amex',
  'cash',
];

const ALIASES: Record<string, PaymentMethod> = {
  cash: 'cash',
  card: 'credit_card',
  credit: 'credit_card',
  credit_card: 'credit_card',
  creditcard: 'credit_card',
  debit: 'debit_card',
  debit_card: 'debit_card',
  debitcard: 'debit_card',
  apple_pay: 'apple_pay',
  applepay: 'apple_pay',
  visa: 'visa',
  mastercard: 'mastercard',
  mc: 'mastercard',
  amex: 'amex',
  stripe: 'credit_card',
};

export function normalizePaymentMethod(
  input?: string | null,
  fallback: PaymentMethod = 'cash',
): PaymentMethod {
  const key = (input ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!key) return fallback;
  if (ALIASES[key]) return ALIASES[key];
  if (PAYMENT_METHODS.includes(key as PaymentMethod)) return key as PaymentMethod;
  throw new ValidationError(
    `Invalid payment_method. Use one of: ${PAYMENT_METHODS.join(', ')}`,
  );
}
