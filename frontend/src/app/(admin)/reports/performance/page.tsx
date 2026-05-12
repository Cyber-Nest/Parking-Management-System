import ReportViewer from "@/components/reports/ReportViewer";

export default function PerformanceReport() {
  return (
    <ReportViewer
      reportType="performance"
      title="Officer Performance"
      description="Tracking officer activity and efficiency metrics."
    />
  );
}
