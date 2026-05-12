import ReportViewer from "@/components/reports/ReportViewer";

export default function LocationReport() {
  return (
    <ReportViewer
      reportType="location"
      title="Location Performance"
      description="Comparing efficiency and revenue across different zones."
    />
  );
}
