import React from 'react';

export default function PlanReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Plan Performance</h1>
      <p className="text-gray-600 font-medium">Analyzing the effectiveness of various parking plans.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
