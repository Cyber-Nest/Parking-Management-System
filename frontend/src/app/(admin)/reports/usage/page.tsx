import ReportViewer from "@/components/reports/ReportViewer";

export default function UsageReport() {
  return (
    <ReportViewer
      reportType="usage"
      title="Parking Usage"
      description="Analytics on parking space utilization and turnover."
    />
  );
}
