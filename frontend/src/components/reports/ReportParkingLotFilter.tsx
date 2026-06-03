"use client";

import { useEffect, useState } from "react";
import { ParkingLotFilter } from "@/components/common/ParkingLotFilter";
import { listParkingLots, ParkingLotRecord } from "@/services/parking-lots.service";

interface ReportParkingLotFilterProps {
  value?: string;
  onChange: (value: string) => void;
  hideAllOption?: boolean;
}

export function ReportParkingLotFilter({ value = "", onChange, hideAllOption = false }: ReportParkingLotFilterProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLotRecord[]>([]);

  useEffect(() => {
    listParkingLots()
      .then((lots) => {
        setParkingLots(lots);
        if (hideAllOption && !value && lots.length > 0) {
          onChange(lots[0].id);
        }
      })
      .catch((error) => console.error("Failed to load parking lots", error));
  }, [hideAllOption, value, onChange]);

  return (
    <ParkingLotFilter
      lots={parkingLots}
      value={value}
      onChange={onChange}
      hideAllOption={hideAllOption}
      className="[&>select]:w-full [&>select]:min-w-0"
    />
  );
}
