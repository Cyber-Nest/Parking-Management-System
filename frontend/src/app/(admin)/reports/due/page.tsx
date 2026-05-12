import ReportViewer from "@/components/reports/ReportViewer";

export default function DueReport() {
  return (
    <ReportViewer
      reportType="due"
      title="Outstanding / Due"
      description="Tracking unpaid penalties and pending payments."
    />
  );
}
