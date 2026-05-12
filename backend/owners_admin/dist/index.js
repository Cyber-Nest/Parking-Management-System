"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const adminAuth_routes_1 = __importDefault(require("./routes/adminAuth.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const parkingPlan_routes_1 = __importDefault(require("./routes/parkingPlan.routes"));
const officer_routes_1 = __importDefault(require("./routes/officer.routes"));
const session_routes_1 = __importDefault(require("./routes/session.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const penaltyRule_routes_1 = __importDefault(require("./routes/penaltyRule.routes"));
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173', env_1.env.frontendUrl].filter(Boolean),
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'ParkSmart Owners Admin API is running',
        env: env_1.env.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/admin/auth', adminAuth_routes_1.default);
app.use('/api/admin/tickets', ticket_routes_1.default);
app.use('/api/admin/payments', payment_routes_1.default);
app.use('/api/admin/parking-plans', parkingPlan_routes_1.default);
app.use('/api/admin/officers', officer_routes_1.default);
app.use('/api/admin/sessions', session_routes_1.default);
app.use('/api/admin/settings', settings_routes_1.default);
app.use('/api/admin/reports', reports_routes_1.default);
app.use('/api/admin/penalty-rules', penaltyRule_routes_1.default);
app.use(errorHandler_middleware_1.notFoundHandler);
app.use(errorHandler_middleware_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        app.listen(env_1.env.port, () => {
            console.log(`ParkSmart Owners Admin API running at http://localhost:${env_1.env.port}`);
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown startup error';
        console.error(`[Startup] Failed to start server: ${message}`);
        process.exit(1);
    }
};
void startServer();
//# sourceMappingURL=index.js.map