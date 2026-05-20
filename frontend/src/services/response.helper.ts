import type { AxiosResponse } from "axios";

export const getResponseData = <T = any>(response: AxiosResponse<any>): T => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "data" in payload) {
        return payload.data as T;
    }
    return payload as T;
};
