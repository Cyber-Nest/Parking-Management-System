import React from 'react';

export default function VehicleHistoryReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle History</h1>
      <p className="text-gray-600 font-medium">Historical data and violation records for specific vehicles.</p>
      
      <div className="mt-8 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center px-6 mb-6">
        <div className="w-64 h-8 bg-white/10 rounded-lg animate-pulse" />
      </div>
      
      <div className="h-96 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
    </div>
  );
}
