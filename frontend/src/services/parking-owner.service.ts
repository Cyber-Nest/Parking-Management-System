export interface ParkingZone {
  id: string;
  name: string;
  isActive: boolean;
  rate?: number;
  address?: string;
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
    {
      id: "ZONE-1",
      name: "Basement A",
      isActive: true,
      parking_lot_id: "LOT-DEFAULT",
    },
    {
      id: "ZONE-2",
      name: "VIP Floor",
      isActive: true,
      rate: 8,
      parking_lot_id: "LOT-DEFAULT",
    },
    {
      id: "ZONE-3",
      name: "Open Terrace",
      isActive: true,
      parking_lot_id: "LOT-DEFAULT",
    },
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
  return (
    (first && (first as any).parking_lot_id) || first?.id || parkingOwner.id
  );
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
