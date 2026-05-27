"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const media_controller_1 = require("../controllers/media.controller");
const cloudinary_service_1 = require("../services/cloudinary.service");
const router = (0, express_1.Router)();
router.get('/status', (_req, res) => {
    const setupError = (0, cloudinary_service_1.getCloudinarySetupError)();
    res.json({
        success: true,
        data: {
            configured: (0, cloudinary_service_1.isCloudinaryConfigured)(),
            ready: !setupError,
            message: setupError,
        },
    });
});
router.post('/upload', media_controller_1.uploadMediaFile);
exports.default = router;
//# sourceMappingURL=media.routes.js.map