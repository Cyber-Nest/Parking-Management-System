export interface PendingPhoto {
  id: string;
  dataUrl: string;
  label: string;
}

export const createPendingPhoto = (dataUrl: string, label: string): PendingPhoto => ({
  id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  dataUrl,
  label,
});

export const isDataImageUrl = (value: string) => /^data:image\//i.test(value.trim());

export const isRemoteMediaUrl = (value: string) =>
  /^https?:\/\//i.test(value.trim()) || /res\.cloudinary\.com/i.test(value.trim());
