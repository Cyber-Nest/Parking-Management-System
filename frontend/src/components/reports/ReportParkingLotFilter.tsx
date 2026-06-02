"use client";

import { useEffect, useState } from "react";
import { ParkingLotFilter } from "@/components/common/ParkingLotFilter";
import { listParkingLots, ParkingLotRecord } from "@/services/parking-lots.service";

interface ReportParkingLotFilterProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ReportParkingLotFilter({ value = "", onChange }: ReportParkingLotFilterProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLotRecord[]>([]);

  useEffect(() => {
    listParkingLots()
      .then(setParkingLots)
      .catch((error) => console.error("Failed to load parking lots", error));
  }, []);

  return (
    <ParkingLotFilter
      lots={parkingLots}
      value={value}
      onChange={onChange}
      className="[&>select]:w-full [&>select]:min-w-0"
    />
  );
}
