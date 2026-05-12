import ReportViewer from "@/components/reports/ReportViewer";

export default function RevenueReport() {
  return (
    <ReportViewer
      reportType="revenue"
      title="Revenue Reports"
      description="Detailed breakdown of all revenue streams."
    />
  );
}
