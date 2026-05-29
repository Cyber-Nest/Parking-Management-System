import { Suspense } from "react";

function CustomerPageFallback() {
  return <div className="min-h-screen bg-[var(--color-bg)]">Loading...</div>;
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<CustomerPageFallback />}>
      {children}
    </Suspense>
  );
}
