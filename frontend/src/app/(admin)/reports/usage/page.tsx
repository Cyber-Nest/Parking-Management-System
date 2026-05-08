import React from 'react';

export default function UsageReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Parking Usage</h1>
      <p className="text-gray-600 font-medium">Analytics on parking space utilization and turnover.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
      
      <div className="mt-8 h-96 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
    </div>
  );
}
