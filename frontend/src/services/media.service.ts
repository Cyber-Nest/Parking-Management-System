import axiosInstance from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import { getResponseData } from "./response.helper";

export interface UploadedMedia {
  url: string;
  photoUrl: string;
  label?: string;
  uploadedAt?: string;
}

/** Upload base64 or URL to Cloudinary via backend; returns secure HTTPS URL for DB storage. */
export const uploadMedia = async (
  file: string,
  options?: { folder?: string; label?: string },
): Promise<UploadedMedia> => {
  try {
    const response = await axiosInstance.post("/media/upload", {
      file,
      folder: options?.folder,
      label: options?.label,
    });
    const data = getResponseData<UploadedMedia>(response);
    return {
      url: data.url ?? data.photoUrl,
      photoUrl: data.photoUrl ?? data.url,
      label: data.label,
      uploadedAt: data.uploadedAt,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Media upload failed"));
  }
};

export const uploadMediaFiles = async (
  files: string[],
  folder?: string,
): Promise<string[]> => {
  const response = await axiosInstance.post("/media/upload", { files, folder });
  const data = getResponseData<{ urls: string[] }>(response);
  return data.urls ?? [];
};
