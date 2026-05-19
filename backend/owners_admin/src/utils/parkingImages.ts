/** Valid Unsplash parking/garage images (used by seed + API sanitization). */
export const VALID_PARKING_IMAGES = [
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1449965405289-9ebbf974f6cc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590674899484-d5640e742f00?auto=format&fit=crop&w=1200&q=80',
];

export const DEFAULT_PARKING_IMAGE = VALID_PARKING_IMAGES[0];

/** Rejects broken seed URLs like photo-1510000000000 (404 on Unsplash). */
export function sanitizeParkingImageUrl(url: string | null | undefined, index = 0): string {
  const fallback = VALID_PARKING_IMAGES[index % VALID_PARKING_IMAGES.length];
  if (!url?.trim()) return fallback;

  const trimmed = url.trim();
  if (/photo-15\d{10,}000000000/i.test(trimmed)) return fallback;
  if (trimmed.includes('1510000000000')) return fallback;

  return trimmed;
}
