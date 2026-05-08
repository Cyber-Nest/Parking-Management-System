export const ChartSkeleton = () => {
  return (
    <div className="w-full h-full animate-pulse flex flex-col justify-end gap-3">
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="h-16 bg-gray-100 rounded-xl" />
      <div className="h-10 bg-gray-100 rounded-xl" />
    </div>
  );
};