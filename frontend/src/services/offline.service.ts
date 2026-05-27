import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from './api';

export const syncOfflineTickets = async (items: any[]) => {
  const resp = await axiosInstance.post(API_ENDPOINTS.OFFICER.SYNC, items);
  return resp.data;
};
