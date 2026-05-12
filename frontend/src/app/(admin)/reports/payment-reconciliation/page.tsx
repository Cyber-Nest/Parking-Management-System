import ReportViewer from "@/components/reports/ReportViewer";

export default function PaymentRecoReport() {
  return (
    <ReportViewer
      reportType="payment-reconciliation"
      title="Payment Reconciliation"
      description="Cross-referencing payments with transaction logs."
    />
  );
}
