export interface RefundInfo {
  refunded: boolean;
  refundedAt?: string;
  refundedBy?: string;
  refundReason?: string;
}

export interface Payment {
  id: string;
  date: string;
  time: string;
  plate: string;
  sessionId: string;
  type: string;
  amount: string;
  method: string;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  processedBy: "Customer" | "Admin" | "Staff" | "System";
  transactionReference: string;
  refundInfo?: RefundInfo;
}

export interface PaymentStats {
  todayPayments: string;
  parkingRevenue: string;
  penaltyRevenue: string;
  pendingFailed: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const paymentService = {
  getPaymentStats: async (): Promise<PaymentStats> => {
    await delay(400);
    return {
      todayPayments: "$1,245.00",
      parkingRevenue: "$985.00",
      penaltyRevenue: "$260.00",
      pendingFailed: "$75.00",
    };
  },

  getPayments: async (): Promise<Payment[]> => {
    await delay(700);
    return [
      {
        id: "PAY-100501",
        date: "May 21, 2025",
        time: "09:45 AM",
        plate: "ABC-1234",
        sessionId: "PKG-10045",
        type: "Parking",
        amount: "$2.00",
        method: "Card",
        status: "Paid",
        processedBy: "Customer",
        transactionReference: "txn_STRIPE_827371",
        refundInfo: { refunded: false },
      },
      {
        id: "PAY-100500",
        date: "May 21, 2025",
        time: "09:20 AM",
        plate: "DEF-5678",
        sessionId: "PKG-10046",
        type: "Parking",
        amount: "$10.00",
        method: "Cash",
        status: "Paid",
        processedBy: "Admin",
        transactionReference: "txn_CASH_66211",
        refundInfo: { refunded: false },
      },
      {
        id: "PAY-100499",
        date: "May 21, 2025",
        time: "08:55 AM",
        plate: "GHI-9101",
        sessionId: "PEN-20015",
        type: "Penalty",
        amount: "$15.00",
        method: "Stripe",
        status: "Refunded",
        processedBy: "Customer",
        transactionReference: "txn_STRIPE_99281",
        refundInfo: {
          refunded: true,
          refundedAt: "May 21, 2025 - 09:30 AM",
          refundedBy: "Admin",
          refundReason: "Duplicate payment detected",
        },
      },
      {
        id: "PAY-100498",
        date: "May 21, 2025",
        time: "08:35 AM",
        plate: "JKL-2345",
        sessionId: "PKG-10044",
        type: "Extension",
        amount: "$3.00",
        method: "Card",
        status: "Paid",
        processedBy: "Customer",
        transactionReference: "txn_CARD_99322",
        refundInfo: { refunded: false },
      },
      {
        id: "PAY-100497",
        date: "May 21, 2025",
        time: "08:15 AM",
        plate: "MNO-6789",
        sessionId: "PEN-20014",
        type: "Penalty",
        amount: "$20.00",
        method: "Cash",
        status: "Pending",
        processedBy: "Staff",
        transactionReference: "txn_PENDING_18272",
        refundInfo: { refunded: false },
      },
      {
        id: "PAY-100496",
        date: "May 21, 2025",
        time: "07:50 AM",
        plate: "PQR-3456",
        sessionId: "PKG-10043",
        type: "Parking",
        amount: "$2.00",
        method: "Stripe",
        status: "Failed",
        processedBy: "System",
        transactionReference: "txn_FAIL_72727",
        refundInfo: { refunded: false },
      },
    ];
  },
};