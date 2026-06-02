// export interface ParkingZone {
//   id: string;
//   name: string;
//   isActive: boolean;
//   rate?: number;
// }

// export interface ParkingOwner {
//   id: string;

//   ownerName: string;
//   ownerEmail: string;
//   ownerPhone: string;
//   companyName?: string;

//   parkingName: string;
//   parkingAddress: string;
//   parkingImage: string;
//   averageRate: number;

//   zones: ParkingZone[];

//   qrCodeUrl: string;
//   isActive: boolean;

//   createdAt: string;
//   updatedAt: string;
// }

// class ParkingOwnerService {
//   private parkingOwners: ParkingOwner[] = [
//     {
//       id: "PO-1021",

//       ownerName: "Michael Carter",

//       ownerEmail: "michael@parksmart.com",

//       ownerPhone: "+1 437-223-9912",

//       companyName: "Downtown Parking Group",

//       parkingName: "Central Parking Tower",

//       parkingAddress: "123 Commerce St, Downtown Toronto",

//       parkingImage:
//         "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80",

//       averageRate: 4.5,

//       zones: [
//         {
//           id: "ZONE-1",
//           name: "Basement A",
//           isActive: true,
//         },

//         {
//           id: "ZONE-2",
//           name: "VIP Floor",
//           isActive: true,
//           rate: 8,
//         },

//         {
//           id: "ZONE-3",
//           name: "Open Terrace",
//           isActive: true,
//         },
//       ],

//       qrCodeUrl:
//         "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://parksmart.com/parking/PO-1021",

//       isActive: true,

//       createdAt: "2026-05-10T12:30:00Z",

//       updatedAt: "2026-05-15T10:00:00Z",
//     },

//     {
//       id: "PO-1022",

//       ownerName: "Sarah Williams",

//       ownerEmail: "sarah@cityparking.com",

//       ownerPhone: "+1 647-883-1290",

//       companyName: "City Parking Solutions",

//       parkingName: "Maple Street Parking Hub",

//       parkingAddress: "82 Maple Avenue, North York",

//       parkingImage:
//         "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80",

//       averageRate: 3.5,

//       zones: [
//         {
//           id: "ZONE-1",
//           name: "North Wing",
//           isActive: true,
//         },

//         {
//           id: "ZONE-2",
//           name: "South Wing",
//           isActive: false,
//         },
//       ],

//       qrCodeUrl:
//         "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://parksmart.com/parking/PO-1022",

//       isActive: true,

//       createdAt: "2026-04-18T09:00:00Z",

//       updatedAt: "2026-05-12T14:20:00Z",
//     },

//     {
//       id: "PO-1023",

//       ownerName: "Daniel Cooper",

//       ownerEmail: "daniel@urbanpark.io",

//       ownerPhone: "+1 416-998-4441",

//       companyName: "UrbanPark Systems",

//       parkingName: "Lakeside Premium Parking",

//       parkingAddress: "15 Harbourfront Blvd, Toronto",

//       parkingImage:
//         "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",

//       averageRate: 6,

//       zones: [
//         {
//           id: "ZONE-1",
//           name: "Premium Indoor",
//           isActive: true,
//           rate: 10,
//         },

//         {
//           id: "ZONE-2",
//           name: "Outdoor Economy",
//           isActive: true,
//           rate: 4,
//         },
//       ],

//       qrCodeUrl:
//         "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://parksmart.com/parking/PO-1023",

//       isActive: false,

//       createdAt: "2026-03-21T08:00:00Z",

//       updatedAt: "2026-05-11T11:45:00Z",
//     },
//   ];

//   async getParkingOwners(): Promise<ParkingOwner[]> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(this.parkingOwners);
//       }, 600);
//     });
//   }

//   async getParkingOwnerById(id: string): Promise<ParkingOwner | null> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const owner = this.parkingOwners.find((item) => item.id === id) || null;

//         resolve(owner);
//       }, 400);
//     });
//   }

//   async createParkingOwner(data: ParkingOwner): Promise<ParkingOwner> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         this.parkingOwners.unshift(data);

//         resolve(data);
//       }, 700);
//     });
//   }

//   async updateParkingOwner(
//     id: string,
//     updatedData: Partial<ParkingOwner>,
//   ): Promise<ParkingOwner | null> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const index = this.parkingOwners.findIndex((item) => item.id === id);

//         if (index === -1) {
//           resolve(null);

//           return;
//         }

//         this.parkingOwners[index] = {
//           ...this.parkingOwners[index],
//           ...updatedData,
//           updatedAt: new Date().toISOString(),
//         };

//         resolve(this.parkingOwners[index]);
//       }, 700);
//     });
//   }

//   async toggleParkingOwnerStatus(id: string): Promise<boolean> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const owner = this.parkingOwners.find((item) => item.id === id);

//         if (!owner) {
//           resolve(false);

//           return;
//         }

//         owner.isActive = !owner.isActive;

//         resolve(true);
//       }, 500);
//     });
//   }

//   async downloadQRCode(qrCodeUrl: string): Promise<string> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(qrCodeUrl);
//       }, 300);
//     });
//   }
// }

// export const parkingOwnerService = new ParkingOwnerService();

export interface ParkingZone {
  id: string;
  name: string;
  isActive: boolean;
  rate?: number;
  parking_lot_id?: string | null;
}

export interface ParkingOwner {
  id: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  companyName?: string;
  parkingName: string;
  parkingAddress: string;
  parkingImage: string;
  zones: ParkingZone[];
  qrCodeUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const currentParkingOwner: ParkingOwner = {
  id: "PO-1021",
  ownerName: "Michael Carter",
  ownerEmail: "michael@parksmart.com",
  ownerPhone: "+1 437-223-9912",
  companyName: "Downtown Parking Group",
  parkingName: "Central Parking Tower",
  parkingAddress: "123 Commerce St, Downtown Toronto",
  parkingImage:
    "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80",
  zones: [
    { id: "ZONE-1", name: "Basement A", isActive: true, parking_lot_id: "LOT-DEFAULT" },
    { id: "ZONE-2", name: "VIP Floor", isActive: true, rate: 8, parking_lot_id: "LOT-DEFAULT" },
    { id: "ZONE-3", name: "Open Terrace", isActive: true, parking_lot_id: "LOT-DEFAULT" },
  ],
  qrCodeUrl: "",
  isActive: true,
  createdAt: "2026-05-10T12:30:00Z",
  updatedAt: "2026-05-15T10:00:00Z",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getFrontendOrigin = (): string => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
};

const getDefaultParkingLotId = (parkingOwner: ParkingOwner): string => {
  // Prefer explicit parking_lot_id on zone if present; otherwise fall back to zone id
  const first = parkingOwner.zones?.[0];
  // @ts-ignore - mock data may not have parking_lot_id
  return (first && (first as any).parking_lot_id) || first?.id || parkingOwner.id;
};

const getParkingOwnerQrTargetUrl = (parkingOwner: ParkingOwner): string => {
  const origin = getFrontendOrigin();
  const targetLotId = getDefaultParkingLotId(parkingOwner);
  return `${origin}/?lotId=${encodeURIComponent(targetLotId)}`;
};

const createParkingOwnerQrCodeUrl = (parkingOwner: ParkingOwner): string => {
  const targetUrl = getParkingOwnerQrTargetUrl(parkingOwner);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`;
};

class ParkingOwnerService {
  // Get current logged-in parking owner
  async getCurrentParkingOwner(): Promise<ParkingOwner | null> {
    await delay(500);
    return {
      ...currentParkingOwner,
      qrCodeUrl: createParkingOwnerQrCodeUrl(currentParkingOwner),
    };
  }

  // Update zones only
  async updateZones(zones: ParkingZone[]): Promise<ParkingOwner | null> {
    await delay(600);
    currentParkingOwner.zones = zones;
    currentParkingOwner.updatedAt = new Date().toISOString();
    return { ...currentParkingOwner };
  }

  // Update parking lot status (active/inactive)
  async updateParkingStatus(isActive: boolean): Promise<ParkingOwner | null> {
    await delay(500);
    currentParkingOwner.isActive = isActive;
    currentParkingOwner.updatedAt = new Date().toISOString();
    return { ...currentParkingOwner };
  }

  // Download QR code
  async downloadQRCode(qrCodeUrl: string): Promise<string> {
    await delay(300);
    return qrCodeUrl;
  }
}

export const parkingOwnerService = new ParkingOwnerService();
