import ReportViewer from "@/components/reports/ReportViewer";

export default function OccupancyReport() {
  return (
    <ReportViewer
      reportType="occupancy"
      title="Peak Hours & Occupancy"
      description="Heatmaps and trends for parking space availability."
    />
  );
}
