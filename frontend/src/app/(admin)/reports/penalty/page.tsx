import ReportViewer from "@/components/reports/ReportViewer";

export default function PenaltyReport() {
  return (
    <ReportViewer
      reportType="penalty"
      title="Penalty Reports"
      description="Insights into issued penalties and collection status."
    />
  );
}
