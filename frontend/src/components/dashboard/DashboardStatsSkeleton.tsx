export const DashboardStatsSkeleton = () => {
  return (
    <>
      {Array(8).fill(null).map((_, i) => (
        <div
          key={i}
          className="p-4 md:p-5 bg-white rounded-2xl border border-[var(--color-border)] animate-pulse min-h-[140px] md:min-h-[160px]"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="mt-6 space-y-3">
            <div className="w-24 h-3 bg-gray-200 rounded-full" />
            <div className="w-20 h-6 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
};