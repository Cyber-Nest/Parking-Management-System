import React from 'react';

export default function AuditLogs() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <p className="text-gray-600 font-medium">System activity and administrative change history.</p>
      
      <div className="mt-8 border border-white/10 rounded-2xl overflow-hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-14 bg-white/5 border-b border-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
