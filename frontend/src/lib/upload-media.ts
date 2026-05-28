import { uploadMedia, uploadMediaFiles } from "@/services/media.service";

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/** Upload a file to Cloudinary via backend; returns HTTPS URL for database storage. */
export async function uploadFileToCloudinary(
  file: File,
  folder: string,
  label?: string,
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const result = await uploadMedia(dataUrl, { folder, label });
  return result.photoUrl;
}

/** Upload multiple base64/data URLs or existing Cloudinary URLs (re-upload skipped on server). */
export async function uploadFilesToCloudinary(
  sources: string[],
  folder: string,
): Promise<string[]> {
  return uploadMediaFiles(sources, folder);
}

export const isCloudinaryUrl = (url: string) => /res\.cloudinary\.com/i.test(url.trim());
