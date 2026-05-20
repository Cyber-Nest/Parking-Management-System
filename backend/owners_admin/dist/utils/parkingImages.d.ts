/** Valid Unsplash parking/garage images (used by seed + API sanitization). */
export declare const VALID_PARKING_IMAGES: string[];
export declare const DEFAULT_PARKING_IMAGE: string;
/** Rejects broken seed URLs like photo-1510000000000 (404 on Unsplash). */
export declare function sanitizeParkingImageUrl(url: string | null | undefined, index?: number): string;
//# sourceMappingURL=parkingImages.d.ts.map