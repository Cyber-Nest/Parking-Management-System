import React from 'react';

export default function PenaltyReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Penalty Reports</h1>
      <p className="text-gray-600 font-medium">Insights into issued penalties and collection status.</p>
      
      <div className="mt-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
