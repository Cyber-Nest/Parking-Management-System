import ReportViewer from "@/components/reports/ReportViewer";

export default function RefundsReport() {
  return (
    <ReportViewer
      reportType="refunds"
      title="Refunds & Adjustments"
      description="Summary of all processed refunds and manual credit adjustments."
    />
  );
}
