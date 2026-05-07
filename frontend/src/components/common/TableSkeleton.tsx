interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton = ({ rows = 5, cols = 8 }: TableSkeletonProps) => {
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
