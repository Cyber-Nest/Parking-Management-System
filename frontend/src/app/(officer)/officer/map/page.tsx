export default function OfficerMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Map</h1>
        <p className="text-sm text-slate-500">Assigned enforcement zone overview.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="h-[560px] bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center">
          <div className="flex h-full items-center justify-center bg-white/25">
            <div className="rounded-lg border border-blue-300 bg-white/95 p-6 shadow-lg">
              <p className="text-sm font-bold text-[#1062ff]">Main St. Enforcement Area</p>
              <p className="text-xs text-slate-500">Zone A · Downtown · 8:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
