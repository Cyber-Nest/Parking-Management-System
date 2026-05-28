/** Officer issue-ticket violation options (includes Unpaid Parking). */

export const OFFICER_VIOLATION_TYPES = [
  "Unpaid Parking",
  "No Parking",
  "Expired Meter",
  "Overtime Parking",
  "Blocking Driveway",
  "Wrong Zone",
  "No Permit",
  "Fire Lane",
  "Handicap Zone",
  "Double Parking",
  "Street Cleaning",
  "Loading Zone",
] as const;

export const OFFICER_VIOLATION_SUB_TYPES = [
  "Unpaid Parking",
  "Expired Time",
  "Expired Meter",
  "No Payment",
  "Overstay",
  "First Notice",
  "Second Notice",
  "Meter Not Displayed",
  "Beyond Time Limit",
] as const;

export type OfficerViolationType = (typeof OFFICER_VIOLATION_TYPES)[number];

const DEFAULT_FINES: Partial<Record<OfficerViolationType, number>> = {
  "Unpaid Parking": 75,
  "No Parking": 100,
  "Expired Meter": 60,
  "Overtime Parking": 50,
  "Blocking Driveway": 150,
  "Wrong Zone": 80,
  "No Permit": 90,
  "Fire Lane": 200,
  "Handicap Zone": 450,
  "Double Parking": 85,
  "Street Cleaning": 70,
  "Loading Zone": 65,
};

export function defaultFineForViolation(type: string): number {
  return DEFAULT_FINES[type as OfficerViolationType] ?? 75;
}
