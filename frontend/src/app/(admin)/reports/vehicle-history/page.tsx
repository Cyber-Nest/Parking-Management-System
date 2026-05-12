import ReportViewer from "@/components/reports/ReportViewer";

export default function VehicleHistoryReport() {
  return (
    <ReportViewer
      reportType="vehicle-history"
      title="Vehicle History"
      description="Historical data and violation records for specific vehicles."
    />
  );
}
