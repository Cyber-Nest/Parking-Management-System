"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { customerService, type CustomerInvoice } from "@/services/customer.service";

const money = (value?: number, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(Number(value ?? 0));

export default function ReceiptPreviewPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;
  const [invoice, setInvoice] = useState<CustomerInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const data = await customerService.getInvoice(invoiceId);
        setInvoice(data);
      } catch (error) {
        console.error(error);
        toast.error("Receipt could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) void loadInvoice();
  }, [invoiceId]);

  const download = async () => {
    try {
      setDownloading(true);
      await customerService.downloadInvoice(invoiceId);
      toast.success("Receipt downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download receipt.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#C6F432]">
          <ArrowLeft size={16} />
          Back Home
        </Link>

        <section className="rounded-[28px] border border-white/10 bg-[#151515] p-6 shadow-2xl">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432]">
                <ReceiptText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Receipt Preview</h1>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Parks-Smart payment record</p>
              </div>
            </div>
            {invoice ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase text-emerald-300">
                {invoice.payment_status}
              </span>
            ) : null}
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-[#9CA3AF]">Loading receipt...</p>
          ) : invoice ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReceiptField label="Receipt #" value={invoice.invoice_number} />
                <ReceiptField label="Date" value={new Date(invoice.invoice_date).toLocaleString()} />
                <ReceiptField label="Email" value={invoice.customer_email} />
                <ReceiptField label="Vehicle" value={invoice.vehicle_plate_number ?? "N/A"} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Description</p>
                <p className="mt-2 text-sm font-semibold text-white">{invoice.item_description ?? invoice.item_type}</p>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                <AmountRow label="Subtotal" value={money(invoice.subtotal, invoice.currency)} />
                <AmountRow label="Tax" value={money(invoice.tax_amount, invoice.currency)} />
                <AmountRow label="Service Fee" value={money(invoice.service_fee, invoice.currency)} />
                <div className="border-t border-white/10 pt-3">
                  <AmountRow label="Total Paid" value={money(invoice.total_amount, invoice.currency)} strong />
                </div>
              </div>

              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C6F432] py-4 text-sm font-black text-black transition hover:bg-[#d4ff45] disabled:opacity-60"
              >
                <Download size={18} />
                {downloading ? "Downloading..." : "Download Receipt PDF"}
              </button>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-[#9CA3AF]">Receipt not found.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function AmountRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg font-black text-[#C6F432]" : "text-[#D1D5DB]"}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
