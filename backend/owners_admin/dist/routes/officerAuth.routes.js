"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const officerAuth_controller_1 = require("../controllers/officerAuth.controller");
const router = (0, express_1.Router)();
router.post('/login', officerAuth_controller_1.login);
router.post('/forgot-password', officerAuth_controller_1.forgotPassword);
router.post('/reset-password', officerAuth_controller_1.resetPassword);
router.post('/refresh', officerAuth_controller_1.refreshToken);
exports.default = router;
//# sourceMappingURL=officerAuth.routes.js.map