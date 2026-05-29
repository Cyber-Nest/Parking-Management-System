"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PARKING_IMAGE = exports.VALID_PARKING_IMAGES = void 0;
exports.sanitizeParkingImageUrl = sanitizeParkingImageUrl;
/** Valid Unsplash parking/garage images (used by seed + API sanitization). */
exports.VALID_PARKING_IMAGES = [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449965405289-9ebbf974f6cc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590674899484-d5640e742f00?auto=format&fit=crop&w=1200&q=80',
];
exports.DEFAULT_PARKING_IMAGE = exports.VALID_PARKING_IMAGES[0];
/** Rejects broken seed URLs like photo-1510000000000 (404 on Unsplash). */
function sanitizeParkingImageUrl(url, index = 0) {
    const fallback = exports.VALID_PARKING_IMAGES[index % exports.VALID_PARKING_IMAGES.length];
    if (!url?.trim())
        return fallback;
    const trimmed = url.trim();
    if (/photo-15\d{10,}000000000/i.test(trimmed))
        return fallback;
    if (trimmed.includes('1510000000000'))
        return fallback;
    return trimmed;
}
//# sourceMappingURL=parkingImages.js.map