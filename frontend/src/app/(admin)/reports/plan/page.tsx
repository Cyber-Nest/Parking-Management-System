import ReportViewer from "@/components/reports/ReportViewer";

export default function PlanReport() {
  return (
    <ReportViewer
      reportType="plan"
      title="Plan Performance"
      description="Analyzing the effectiveness of various parking plans."
    />
  );
}
