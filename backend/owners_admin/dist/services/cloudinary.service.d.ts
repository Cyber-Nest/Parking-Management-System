export declare function isValidCloudName(cloudName: string | undefined): boolean;
export declare function getCloudinaryConfig(): {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
};
export declare function isCloudinaryConfigured(): boolean;
export declare function getCloudinarySetupError(): string | null;
export declare function isCloudinaryUrl(url: string): boolean;
export declare function uploadMedia(source: string, options?: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'auto';
}): Promise<string>;
export declare function uploadMediaList(sources: string[], options?: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'auto';
}): Promise<string[]>;
/** Upload to Cloudinary when needed; pass through existing Cloudinary URLs. */
export declare function ensureCloudinaryUrl(source: string, options?: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'auto';
}): Promise<string>;
//# sourceMappingURL=cloudinary.service.d.ts.map