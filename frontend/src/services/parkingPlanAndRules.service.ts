export interface ParkingPlan {
  id: string;
  name: string;
  type: string;
  duration: number;
  price: number;
  tax: number;
  status: "Active" | "Inactive";
  updatedDate: string;
  updatedTime: string;
}

export interface PenaltyRule {
  id: string;
  violation: string;
  code: string;
  amount: number;
  grace: number;
  description: string;
  status: "Active" | "Inactive";
  updatedDate: string;
  updatedTime: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const parkingPlanAndRulesService = {
  getPlans: async (): Promise<ParkingPlan[]> => {
    await delay(500);
    
    return [
      {
        id: "PLAN-100",
        name: "Hourly Standard",
        type: "Hourly",
        duration: 60,
        price: 2,
        tax: 5,
        status: "Active",
        updatedDate: "May 21, 2025",
        updatedTime: "10:30 AM",
      },
      {
        id: "PLAN-101",
        name: "Daily Pass",
        type: "Daily",
        duration: 1440,
        price: 20,
        tax: 5,
        status: "Active",
        updatedDate: "May 20, 2025",
        updatedTime: "09:00 AM",
      },
      {
        id: "PLAN-102",
        name: "Monthly VIP",
        type: "Monthly",
        duration: 43200,
        price: 180,
        tax: 8,
        status: "Inactive",
        updatedDate: "May 18, 2025",
        updatedTime: "04:20 PM",
      },
    ];
  },

  getRules: async (): Promise<PenaltyRule[]> => {
    await delay(500);
    
    return [
      {
        id: "PEN-400",
        violation: "Expired Parking",
        code: "EXP-01",
        amount: 50,
        grace: 10,
        description: "Parking expired",
        status: "Active",
        updatedDate: "May 21, 2025",
        updatedTime: "10:30 AM",
      },
      {
        id: "PEN-401",
        violation: "Wrong Parking",
        code: "WRG-11",
        amount: 80,
        grace: 5,
        description: "Vehicle parked in wrong area",
        status: "Active",
        updatedDate: "May 20, 2025",
        updatedTime: "11:00 AM",
      },
    ];
  },
};