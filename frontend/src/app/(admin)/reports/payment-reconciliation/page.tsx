import React from 'react';

export default function PaymentRecoReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Reconciliation</h1>
      <p className="text-gray-600 font-medium">Cross-referencing payments with transaction logs.</p>
      
      <div className="mt-8 border border-white/10 rounded-2xl overflow-hidden">
        <div className="h-12 bg-white/5 border-b border-white/10" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-transparent border-b border-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
