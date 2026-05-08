import React from 'react';

export default function DueReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Outstanding / Due</h1>
      <p className="text-gray-600 font-medium">Tracking unpaid penalties and pending payments.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
