"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Receipt } from "lucide-react";
import toast from "react-hot-toast";
import { getPaymentReceipt } from "@/services/payments.service";

export type ReceiptPayload = Record<string, unknown>;

interface PaymentReceiptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
}

export const PaymentReceiptDrawer = ({
  isOpen,
  onClose,
  paymentId,
}: PaymentReceiptDrawerProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReceiptPayload | null>(null);

  useEffect(() => {
    if (!isOpen || !paymentId) {
      setData(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const res = await getPaymentReceipt(paymentId);

        setData(res as ReceiptPayload);
      } catch (e) {
        console.error(e);
        toast.error("Could not load receipt");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isOpen, paymentId]);

  // FORMAT VALUE
  const formatValue = (value: unknown) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "null"
    ) {
      return null;
    }

    // DATE FORMAT
    if (typeof value === "string" && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // ARRAY
    if (Array.isArray(value)) {
      if (!value.length) return null;

      return value
        .map((item: any, index) => {
          if (typeof item === "object") {
            return `${index + 1}. ${item.description || "Item"} - $${
              item.amount || 0
            }`;
          }

          return String(item);
        })
        .join("\n");
    }

    // OBJECT
    if (typeof value === "object") {
      return Object.keys(value as object).length
        ? JSON.stringify(value, null, 2)
        : null;
    }

    return String(value);
  };

  const filteredEntries = data
    ? Object.entries(data).filter(([, value]) => formatValue(value) !== null)
    : [];

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=720,height=900");

    if (!w || !data) return;

    const rows = filteredEntries
      .map(
        ([k, v]) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ccc;font-weight:bold;">
              ${k}
            </td>
            <td style="padding:8px;border:1px solid #ccc;">
              ${formatValue(v)}
            </td>
          </tr>`,
      )
      .join("");

    w.document.write(`
      <html>
        <head>
          <title>Receipt</title>
        </head>

        <body style="font-family:system-ui;padding:24px;">
          <h1>Payment Receipt</h1>

          <table style="border-collapse:collapse;width:100%;">
            ${rows}
          </table>
        </body>
      </html>
    `);

    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  if (!paymentId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed left-1/2 top-1/2 z-[70] w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="text-[var(--color-primary)]" size={22} />

                <h2 className="text-lg font-black text-[var(--color-text-primary)]">
                  Receipt
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-[var(--color-surface-soft)]"
              >
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
            ) : filteredEntries.length ? (
              <div className="max-h-[60vh] overflow-y-auto space-y-2 text-sm">
                {filteredEntries.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 border-b border-[var(--color-border)] py-2"
                  >
                    <span className="font-semibold text-[var(--color-text-secondary)] capitalize">
                      {k.replaceAll("_", " ")}
                    </span>

                    <span className="max-w-[60%] text-right text-[var(--color-text-primary)] break-words whitespace-pre-wrap">
                      {formatValue(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-rose-600">No receipt data.</p>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={!filteredEntries.length}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-xs font-black uppercase tracking-wide text-white disabled:opacity-40"
              >
                <Printer size={16} />
                Print
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
