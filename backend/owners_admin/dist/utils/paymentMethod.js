"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_METHODS = void 0;
exports.normalizePaymentMethod = normalizePaymentMethod;
const commonErrors_1 = require("../services/commonErrors");
exports.PAYMENT_METHODS = [
    'credit_card',
    'debit_card',
    'apple_pay',
    'visa',
    'mastercard',
    'amex',
    'cash',
];
const ALIASES = {
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
function normalizePaymentMethod(input, fallback = 'cash') {
    const key = (input ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (!key)
        return fallback;
    if (ALIASES[key])
        return ALIASES[key];
    if (exports.PAYMENT_METHODS.includes(key))
        return key;
    throw new commonErrors_1.ValidationError(`Invalid payment_method. Use one of: ${exports.PAYMENT_METHODS.join(', ')}`);
}
//# sourceMappingURL=paymentMethod.js.map