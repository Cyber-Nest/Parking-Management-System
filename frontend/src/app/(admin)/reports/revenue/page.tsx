import React from 'react';

export default function RevenueReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Revenue Reports</h1>
      <p className="text-gray-600 font-medium">Detailed breakdown of all revenue streams.</p>
      
      {/* Dashboard Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
      
      <div className="mt-8 h-96 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
    </div>
  );
}
