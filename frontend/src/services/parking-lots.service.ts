import axios from '@/lib/axios';
import { API_ENDPOINTS } from './api';
import { getResponseData } from './response.helper';

export interface ParkingLotRecord {
  id: string;
  owner_id?: string | null;
  lot_name: string;
  address?: string | null;
  image_url?: string | null;
  qr_code_url?: string | null;
}

export const listParkingLots = async (): Promise<ParkingLotRecord[]> => {
  const resp = await axios.get(API_ENDPOINTS.PARKING_LOTS.LIST, { params: { limit: 200 } });
  const data = getResponseData(resp);
  return (data?.items ?? []) as ParkingLotRecord[];
};

export const getParkingLot = async (id: string): Promise<ParkingLotRecord> => {
  const resp = await axios.get(API_ENDPOINTS.PARKING_LOTS.BY_ID(id));
  return getResponseData(resp) as ParkingLotRecord;
};

export const createParkingLot = async (payload: Partial<ParkingLotRecord>) => {
  const resp = await axios.post(API_ENDPOINTS.PARKING_LOTS.LIST, payload);
  return getResponseData(resp);
};

export const updateParkingLot = async (id: string, payload: Partial<ParkingLotRecord>) => {
  const resp = await axios.patch(API_ENDPOINTS.PARKING_LOTS.BY_ID(id), payload);
  return getResponseData(resp);
};

export const deleteParkingLot = async (id: string) => {
  const resp = await axios.delete(API_ENDPOINTS.PARKING_LOTS.BY_ID(id));
  return getResponseData(resp);
};
