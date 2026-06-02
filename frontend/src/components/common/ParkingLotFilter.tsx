"use client";

import { MapPin } from "lucide-react";
import { ParkingLotRecord } from "@/services/parking-lots.service";

interface ParkingLotFilterProps {
  lots: ParkingLotRecord[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ParkingLotFilter({ lots, value, onChange, className = "" }: ParkingLotFilterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MapPin size={16} className="text-[var(--color-primary)]" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input w-auto min-w-[180px] text-xs font-bold bg-[var(--color-surface-soft)]"
      >
        <option value="">All parking lots</option>
        {lots.map((lot) => (
          <option key={lot.id} value={lot.id}>
            {lot.lot_name}
          </option>
        ))}
      </select>
    </div>
  );
}
