interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  variant?: 'table' | 'card';
}

export const TableSkeleton = ({ rows = 5, cols = 8, variant = 'table' }: TableSkeletonProps) => {
  if (variant === 'card') {
    return (
      <div className="space-y-3">
        {Array(rows)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="p-4 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
              <div className="h-6 rounded-full bg-gray-100 animate-pulse w-1/2 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-4 rounded-full bg-gray-100 animate-pulse w-full" />
                <div className="h-4 rounded-full bg-gray-100 animate-pulse w-full" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <>
      {Array(rows)
        .fill(null)
        .map((_, i) => (
          <tr key={i}>
            <td colSpan={cols} className="px-6 py-5">
              <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
            </td>
          </tr>
        ))}
    </>
  );
};
