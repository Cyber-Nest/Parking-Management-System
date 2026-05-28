"use client";

import Link from "next/link";
import ReportViewer from "@/components/reports/ReportViewer";
import { useState } from "react";

export default function OfficerReportsPage() {
  const [reportType, setReportType] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-slate-500">Run and view operational reports</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-bold">Available Reports</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => setReportType("penalty-summary")} className="w-full text-left text-slate-700 hover:underline">Penalty Summary</button>
            </li>
            <li>
              <button onClick={() => setReportType("payment-reconciliation")} className="w-full text-left text-slate-700 hover:underline">Payment Reconciliation</button>
            </li>
            <li>
              <button onClick={() => setReportType("vehicle-history")} className="w-full text-left text-slate-700 hover:underline">Vehicle History</button>
            </li>
            <li>
              <button onClick={() => setReportType("officer-performance")} className="w-full text-left text-slate-700 hover:underline">Officer Performance</button>
            </li>
          </ul>

          <div className="mt-6">
            <Link href="/officer" className="text-sm text-[#1062ff]">Back to Dashboard</Link>
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white">
          {reportType ? (
            <ReportViewer reportType={reportType} title={reportType.replace(/-/g, " ")} description="" />
          ) : (
            <div className="p-8 text-center text-sm text-slate-600">Select a report from the left to view details.</div>
          )}
        </section>
      </div>
    </div>
  );
}
