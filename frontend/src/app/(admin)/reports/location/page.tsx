import React from 'react';

export default function LocationReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Location Performance</h1>
      <p className="text-gray-600 font-medium">Comparing efficiency and revenue across different zones.</p>
      
      <div className="mt-8 h-80 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
