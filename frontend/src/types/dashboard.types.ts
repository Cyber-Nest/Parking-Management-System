import { LucideIcon } from "lucide-react";
export interface DashboardStat {
  id: number;
  type: DashboardStatType;
  value: string | number;
}
export type DashboardStatType =
  | "activeParking"
  | "todayRevenue"
  | "expiredSession"
  | "totalVehicles"
  | "unpaidPenalty"
  | "paidPenalty"
  | "pendingEnforcement"
  | "totalRevenue";
export interface DashboardTableRow {
  id: number;
  plate: string;
  col2: string;
  col3: string;
  status: string;
  col5: string;
}

export interface DashboardStatConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}
