import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

export type ReportExportFormat = "pdf" | "excel";

const toQueryParams = (params: Record<string, string | number | undefined>): Record<string, string> => {
    const out: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        out[key] = String(value);
    });
    return out;
};

export async function downloadReportExport(
    reportType: string,
    format: ReportExportFormat,
    params: Record<string, string | number | undefined> = {},
): Promise<{ blob: Blob; message?: string }> {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.EXPORT(reportType), {
        params: toQueryParams({ ...params, format }),
        responseType: "blob",
        validateStatus: () => true,
    });

    const blob = response.data as Blob;

    const readErrorMessage = async (): Promise<string> => {
        const text = await blob.text();
        try {
            const body = JSON.parse(text) as { message?: string };
            return body.message || text || `Export failed (${response.status})`;
        } catch {
            return text || `Export failed (${response.status})`;
        }
    };

    if (response.status >= 400) {
        throw new Error(await readErrorMessage());
    }

    const contentType = String(response.headers["content-type"] || "");
    if (contentType.includes("application/json")) {
        throw new Error(await readErrorMessage());
    }

    return { blob };
}
