import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface ParkingZoneRecord {
  id: string;
  parking_name: string;
  address: string;
  image_url: string;
  hourly_rate: number;
  available_spots: number;
  total_spots: number;
  spot_id: string;
  status?: "active" | "inactive";
}

export interface ParkingZoneFormInput {
  name: string;
  address?: string;
  imageUrl?: string;
  hourlyRate?: number;
  availableSpots?: number;
  totalSpots?: number;
  isActive?: boolean;
}

export const listParkingZones = async (): Promise<ParkingZoneRecord[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.PARKING_ZONES.LIST, {
    params: { limit: 200 },
  });
  const data = getResponseData(response);
  return (data?.items ?? data ?? []) as ParkingZoneRecord[];
};

export const createParkingZone = async (input: ParkingZoneFormInput): Promise<ParkingZoneRecord> => {
  const response = await axiosInstance.post(API_ENDPOINTS.PARKING_ZONES.LIST, {
    parking_name: input.name,
    address: input.address,
    image_url: input.imageUrl,
    hourly_rate: input.hourlyRate,
    available_spots: input.availableSpots,
    total_spots: input.totalSpots,
    isActive: input.isActive,
  });
  return getResponseData(response) as ParkingZoneRecord;
};

export const updateParkingZone = async (
  id: string,
  input: Partial<ParkingZoneFormInput>,
): Promise<ParkingZoneRecord> => {
  const response = await axiosInstance.patch(API_ENDPOINTS.PARKING_ZONES.BY_ID(id), {
    parking_name: input.name,
    address: input.address,
    image_url: input.imageUrl,
    hourly_rate: input.hourlyRate,
    available_spots: input.availableSpots,
    total_spots: input.totalSpots,
    isActive: input.isActive,
  });
  return getResponseData(response) as ParkingZoneRecord;
};

export const deleteParkingZone = async (id: string): Promise<void> => {
  await axiosInstance.delete(API_ENDPOINTS.PARKING_ZONES.BY_ID(id));
};

export const mapZoneToUi = (zone: ParkingZoneRecord) => ({
  id: zone.id,
  name: zone.parking_name,
  isActive: (zone.status ?? "active") === "active",
  rate: Number(zone.hourly_rate),
});
