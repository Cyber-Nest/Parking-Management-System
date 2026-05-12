import {
  listPayments,
  getPaymentSummary,
  type PaymentListParams,
  type PaymentMethod,
  type PaymentStatus,
  type PaymentType,
} from "@/services/payments.service";

export interface Payment {
  id: string;
  plate: string;
  sessionId?: string;
  type: string;
  status: "Paid" | "Pending" | "Failed" | "Refunded" | string;
  method: string;
  amount: string;
  date: string;
  time: string;
  receiptStatus?: "Sent" | "Not Sent" | string;
  transactionRef?: string;
  processedBy?: string;
  refundInfo?: {
    refunded: boolean;
    refundAmount?: string;
    refundDate?: string;
    refundReason?: string;
    refundedBy?: string;
    refundedAt?: string;
  };
  raw?: any;
}

export interface PaymentStats {
  todayPayments: string;
  parkingRevenue: string;
  penaltyRevenue: string;
  pendingFailed: string;
}

const safeNum = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const usd = (value: unknown) =>
  `$${safeNum(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const paymentService = {
  async getPayments(params: PaymentListParams = {}): Promise<Payment[]> {
    const res = await listPayments(params);
    const items = (res?.items ?? res ?? []) as any[];
    return items.map((p, idx) => {
      const dt = new Date(p.paid_at ?? p.paidAt ?? p.created_at ?? p.createdAt ?? Date.now());
      const statusRaw = String(p.status ?? "success");
      const status =
        statusRaw === "success"
          ? "Paid"
          : statusRaw === "pending"
            ? "Pending"
            : statusRaw === "failed"
              ? "Failed"
              : statusRaw === "refunded"
                ? "Refunded"
                : statusRaw;
      const type =
        String(p.payment_type ?? p.paymentType ?? "parking").toLowerCase() === "penalty"
          ? "Penalty"
          : String(p.payment_type ?? p.paymentType ?? "parking").toLowerCase() ===
            "extension"
            ? "Extension"
            : "Parking";

      const method = String(p.payment_method ?? p.paymentMethod ?? "card")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (m: string) => m.toUpperCase());

      return {
        id: String(p.id ?? `PMT-${1000 + idx}`),
        plate: String(p.license_plate ?? p.licensePlate ?? "-"),
        sessionId: String(p.session_id ?? p.sessionId ?? "-"),
        type,
        status,
        method,
        amount: usd(p.amount ?? 0),
        date: dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        receiptStatus: p.receipt_email_sent ? "Sent" : "Not Sent",
        transactionRef: String(p.transaction_ref ?? p.transactionRef ?? ""),
        raw: p,
      };
    });
  },

  async getPaymentStats(): Promise<PaymentStats> {
    const summary = await getPaymentSummary();
    return {
      todayPayments: usd(summary?.todayRevenue ?? summary?.todayAmount ?? 0),
      parkingRevenue: usd(summary?.parkingRevenue ?? summary?.parkingAmount ?? 0),
      penaltyRevenue: usd(summary?.penaltyRevenue ?? summary?.penaltyAmount ?? 0),
      pendingFailed: usd(
        safeNum(summary?.pendingAmount ?? 0) + safeNum(summary?.failedAmount ?? 0),
      ),
    };
  },

  methodValues: [
    "credit_card",
    "debit_card",
    "apple_pay",
    "visa",
    "mastercard",
    "amex",
  ] as PaymentMethod[],
  statusValues: ["pending", "success", "failed", "refunded"] as PaymentStatus[],
  typeValues: ["parking", "penalty", "extension"] as PaymentType[],
};

