export interface StatCard {
  id: number;
  label: string;
  value: string | number;
  icon: string; 
  color: string;
  bg: string;
}

export interface TableRow {
  id: number;
  plate: string;
  col2: string;
  col3: string;
  status: string;
  statusColor: string;
  col5: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Icon mapping for dynamic import
export const iconMap: Record<string, any> = {
  CarFront: () => import('lucide-react').then(mod => mod.CarFront),
  WalletCards: () => import('lucide-react').then(mod => mod.WalletCards),
  TimerReset: () => import('lucide-react').then(mod => mod.TimerReset),
  TrafficCone: () => import('lucide-react').then(mod => mod.TrafficCone),
  TriangleAlert: () => import('lucide-react').then(mod => mod.TriangleAlert),
  BadgeCheck: () => import('lucide-react').then(mod => mod.BadgeCheck),
  ShieldAlert: () => import('lucide-react').then(mod => mod.ShieldAlert),
  Landmark: () => import('lucide-react').then(mod => mod.Landmark),
};

export const dashboardService = {
  getDashboardStats: async (): Promise<StatCard[]> => {
    await delay(600);
    return [
      {
        id: 1,
        label: "Total Active Parking",
        value: "80",
        icon: "CarFront",
        color: "#0F766E",
        bg: "#CCFBF1",
      },
      {
        id: 2,
        label: "Today's Revenue",
        value: "$80,442",
        icon: "WalletCards",
        color: "#059669",
        bg: "#D1FAE5",
      },
      {
        id: 3,
        label: "Expired Session",
        value: "12",
        icon: "TimerReset",
        color: "#64748B",
        bg: "#E2E8F0",
      },
      {
        id: 4,
        label: "Total Vehicles Today",
        value: "256",
        icon: "TrafficCone",
        color: "#0891B2",
        bg: "#CFFAFE",
      },
      {
        id: 5,
        label: "Unpaid Penalty",
        value: "$1,200",
        icon: "TriangleAlert",
        color: "#EA580C",
        bg: "#FFEDD5",
      },
      {
        id: 6,
        label: "Paid Penalty",
        value: "$3,450",
        icon: "BadgeCheck",
        color: "#10B981",
        bg: "#DCFCE7",
      },
      {
        id: 7,
        label: "Pending Enforcement",
        value: "45",
        icon: "ShieldAlert",
        color: "#DC2626",
        bg: "#FEE2E2",
      },
      {
        id: 8,
        label: "Total Revenue",
        value: "$9,899",
        icon: "Landmark",
        color: "#0D9488",
        bg: "#CCFBF1",
      },
    ];
  },

  getParkingSessions: async (): Promise<TableRow[]> => {
    await delay(500);
    return [
      {
        id: 1,
        plate: "ABC-1234",
        col2: "May 21, 2025 08:15 AM",
        col3: "May 21, 2025 10:15 AM",
        status: "Active",
        statusColor: "bg-emerald-50 text-emerald-600",
        col5: "$2.00",
      },
      {
        id: 2,
        plate: "GHI-9101",
        col2: "May 21, 2025 06:30 AM",
        col3: "May 21, 2025 08:30 AM",
        status: "Expired",
        statusColor: "bg-red-50 text-red-600",
        col5: "$2.00",
      },
      {
        id: 3,
        plate: "MNO-6789",
        col2: "May 21, 2025 09:10 AM",
        col3: "May 21, 2025 11:10 AM",
        status: "Active",
        statusColor: "bg-emerald-50 text-emerald-600",
        col5: "$2.00",
      },
      {
        id: 4,
        plate: "PQR-3456",
        col2: "May 21, 2025 10:00 AM",
        col3: "May 21, 2025 12:00 PM",
        status: "Active",
        statusColor: "bg-emerald-50 text-emerald-600",
        col5: "$2.00",
      },
      {
        id: 5,
        plate: "STU-5678",
        col2: "May 21, 2025 07:00 AM",
        col3: "May 21, 2025 09:00 AM",
        status: "Expired",
        statusColor: "bg-red-50 text-red-600",
        col5: "$2.00",
      },
      {
        id: 6,
        plate: "XYZ-4567",
        col2: "May 21, 2025 11:30 AM",
        col3: "May 21, 2025 01:30 PM",
        status: "Active",
        statusColor: "bg-emerald-50 text-emerald-600",
        col5: "$2.00",
      },
    ];
  },

  getPenaltySessions: async (): Promise<TableRow[]> => {
    await delay(500);
    return [
      {
        id: 1,
        plate: "GHI-9101",
        col2: "Overstay Parking",
        col3: "$20.00",
        status: "Unpaid",
        statusColor: "bg-red-50 text-red-600",
        col5: "May 21, 2025 08:35 AM",
      },
      {
        id: 2,
        plate: "STU-5678",
        col2: "Expired Ticket",
        col3: "$10.00",
        status: "Paid",
        statusColor: "bg-emerald-50 text-emerald-600",
        col5: "May 20, 2025 06:15 PM",
      },
      {
        id: 3,
        plate: "ABC-1234",
        col2: "Wrong Parking",
        col3: "$15.00",
        status: "Unpaid",
        statusColor: "bg-red-50 text-red-600",
        col5: "May 21, 2025 09:00 AM",
      },
      {
        id: 4,
        plate: "MNO-6789",
        col2: "No Parking Zone",
        col3: "$25.00",
        status: "Unpaid",
        statusColor: "bg-red-50 text-red-600",
        col5: "May 21, 2025 10:00 AM",
      },
    ];
  },
};