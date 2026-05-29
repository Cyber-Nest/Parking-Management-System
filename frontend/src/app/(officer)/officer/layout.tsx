import { Suspense } from "react";
import { OfficerShell } from "@/components/officer/OfficerShell";

function OfficerShellFallback() {
  return <div className="min-h-screen bg-[#f5f7fb]">Loading...</div>;
}

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<OfficerShellFallback />}>
      <OfficerShell>{children}</OfficerShell>
    </Suspense>
  );
}
