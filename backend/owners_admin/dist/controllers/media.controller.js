"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMediaFile = void 0;
const cloudinary_service_1 = require("../services/cloudinary.service");
const commonErrors_1 = require("../services/commonErrors");
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[MediaController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const uploadMediaFile = async (req, res) => {
    try {
        const file = String(req.body?.file ?? req.body?.photo ?? req.body?.media ?? '').trim();
        const files = Array.isArray(req.body?.files) ? req.body.files : null;
        const folder = String(req.body?.folder ?? '').trim() || undefined;
        const label = String(req.body?.label ?? 'Media').trim();
        if (files?.length) {
            const urls = await (0, cloudinary_service_1.uploadMediaList)(files.map((item) => String(item)), { folder });
            res.status(201).json({
                success: true,
                message: 'Media uploaded to Cloudinary',
                data: { urls, label },
            });
            return;
        }
        if (!file) {
            res.status(400).json({ success: false, message: 'file or files is required' });
            return;
        }
        const url = await (0, cloudinary_service_1.uploadMedia)(file, { folder });
        res.status(201).json({
            success: true,
            message: 'Media uploaded to Cloudinary',
            data: {
                url,
                photoUrl: url,
                label,
                uploadedAt: new Date().toISOString(),
            },
        });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.uploadMediaFile = uploadMediaFile;
//# sourceMappingURL=media.controller.js.map