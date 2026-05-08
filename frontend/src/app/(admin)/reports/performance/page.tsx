import React from 'react';

export default function PerformanceReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Officer Performance</h1>
      <p className="text-gray-600 font-medium">Tracking officer activity and efficiency metrics.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
