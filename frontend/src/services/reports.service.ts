import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface ReportQueryParams {
    from?: string;
    to?: string;
    limit?: number;
    license_plate?: string;
}

export const getReport = async (type: string, params: ReportQueryParams = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.GET(type), {
        params,
    });
    return getResponseData(response);
};
