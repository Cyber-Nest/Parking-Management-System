import ReportViewer from "@/components/reports/ReportViewer";

export default function AuditLogs() {
  return (
    <ReportViewer
      reportType="audit"
      title="Audit Logs"
      description="System activity and administrative change history."
    />
  );
}
