import axiosInstance from "@/lib/axios";
import {
  listParkingPlans,
  createParkingPlan,
  updateParkingPlan,
  deleteParkingPlan,
  type ParkingPlan,
} from "@/services/parkingPlans.service";
import { getResponseData } from "./response.helper";

export type RuleStatusUi = "Active" | "Inactive" | string;

export interface PenaltyRule {
  id: string;
  violation: string;
  code: string;
  amount: number;
  grace_minutes?: number;
  grace?: number;
  description?: string;
  status: RuleStatusUi;
  updatedDate?: string;
  updatedTime?: string;
  created_at?: string;
  updated_at?: string;
}

const RULES_BASE = "/admin/penalty-rules";

export const parkingPlanAndRulesService = {
  // Plans
  async getPlans(): Promise<ParkingPlan[]> {
    const res = await listParkingPlans();
    const rows = (res?.items ?? res ?? []) as Record<string, unknown>[];
    return rows.map((p) => ({
      ...(p as object),
      id: String(p.id),
      name: String(p.name ?? ""),
      type: String(p.plan_type ?? p.type ?? "Hourly"),
      duration: Number(p.duration) || 0,
      price: Number(p.price) || 0,
      tax: Number(p.tax_percent ?? p.tax ?? 0),
      status: (p.status as string) || "Active",
      parking_lot_id: p.parking_lot_id ? String(p.parking_lot_id) : undefined,
      parking_lot_name: p.parking_lot_name ? String(p.parking_lot_name) : undefined,
      parking_zone_id: p.parking_zone_id ? String(p.parking_zone_id) : undefined,
      parking_zone_name: p.parking_zone_name ? String(p.parking_zone_name) : undefined,
    })) as ParkingPlan[];
  },
  async createPlan(payload: {
    name: string;
    price: number;
    duration: number;
    plan_type?: string;
    tax_percent?: number;
    status?: string;
    parking_lot_id?: string | null;
    parking_zone_id?: string | null;
  }) {
    return await createParkingPlan(payload);
  },
  async updatePlan(
    id: string,
    payload: {
      name?: string;
      price?: number;
      duration?: number;
      plan_type?: string;
      tax_percent?: number;
      status?: string;
      parking_lot_id?: string | null;
      parking_zone_id?: string | null;
    },
  ) {
    return await updateParkingPlan(id, payload);
  },
  async deletePlan(id: string) {
    return await deleteParkingPlan(id);
  },

  // Rules
  async getRules(): Promise<PenaltyRule[]> {
    const res = await axiosInstance.get(RULES_BASE);
    const data = getResponseData(res);
    return (data?.items ?? data ?? []) as PenaltyRule[];
  },
  async createRule(payload: Omit<PenaltyRule, "id" | "created_at" | "updated_at">) {
    const res = await axiosInstance.post(RULES_BASE, payload);
    return getResponseData(res);
  },
  async updateRule(id: string, payload: Partial<PenaltyRule>) {
    const res = await axiosInstance.patch(`${RULES_BASE}/${id}`, payload);
    return getResponseData(res);
  },
  async deleteRule(id: string) {
    const res = await axiosInstance.delete(`${RULES_BASE}/${id}`);
    return getResponseData(res);
  },
};

export type { ParkingPlan };

