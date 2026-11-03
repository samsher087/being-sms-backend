"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db_1 = require("./config/db");
const tenant_1 = require("./middleware/tenant");
const errorHandler_1 = require("./middleware/errorHandler");
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const academicRoutes_1 = __importDefault(require("./routes/academicRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const feeRoutes_1 = __importDefault(require("./routes/feeRoutes"));
const examRoutes_1 = __importDefault(require("./routes/examRoutes"));
const timetableRoutes_1 = __importDefault(require("./routes/timetableRoutes"));
const noticeRoutes_1 = __importDefault(require("./routes/noticeRoutes"));
const admissionRoutes_1 = __importDefault(require("./routes/admissionRoutes"));
const libraryRoutes_1 = __importDefault(require("./routes/libraryRoutes"));
const transportRoutes_1 = __importDefault(require("./routes/transportRoutes"));
const websiteRoutes_1 = __importDefault(require("./routes/websiteRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security and utility middleware
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'https://softdeals-sms.vercel.app'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// Tenant resolution middleware for all requests
app.use(tenant_1.tenantMiddleware);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        product: 'SoftDeals School Management System',
        company: 'SoftDeals — Digital Solutions',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        tenantContext: req.tenant ? { name: req.tenant.name, code: req.tenant.code } : 'Global/Platform Context',
    });
});
// Swagger / OpenAPI documentation
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'SoftDeals School Management System API',
        version: '1.0.0',
        description: 'RESTful API for SoftDeals SMS Multi-Tenant SaaS platform designed for Indian schools.',
        contact: {
            name: 'SoftDeals — Digital Solutions Support',
            email: 'support@softdeals.in',
        },
    },
    servers: [{ url: 'http://localhost:5000/api/v1', description: 'Local Development Server' }],
    paths: {
        '/health': { get: { summary: 'System Health Check' } },
        '/auth/login': { post: { summary: 'User Login & JWT Generation' } },
        '/auth/demo-accounts': { get: { summary: 'Retrieve Demo Login Credentials for All 7 Roles' } },
        '/dashboard/metrics': { get: { summary: 'Role-Specific Dashboard KPIs & Analytics' } },
        '/students': { get: { summary: 'List Students with Search & Pagination' }, post: { summary: 'Admit New Student' } },
        '/teachers': { get: { summary: 'Staff Directory' }, post: { summary: 'Register Faculty' } },
        '/attendance/class': { get: { summary: 'Get Class Attendance Register' }, post: { summary: 'Submit Attendance' } },
        '/fees/payments': { get: { summary: 'Fee Payments Log & Receipts' } },
        '/fees/record-payment': { post: { summary: 'Record Fee Payment with Unique Receipt' } },
        '/exams/schedules': { get: { summary: 'Examination Schedules' } },
        '/timetable/class/{classId}': { get: { summary: 'Class Timetable' } },
        '/notices': { get: { summary: 'School Announcements & Homework' } },
        '/admissions/enquiries': { get: { summary: 'Online Admission Enquiries Pipeline' } },
        '/website/public/{code}': { get: { summary: 'Public School Website CMS & Content' } },
        '/tenants': { get: { summary: 'List SaaS School Tenants (Super Admin)' } },
    },
};
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Mount API routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/tenants', tenantRoutes_1.default);
app.use('/api/v1/academics', academicRoutes_1.default);
app.use('/api/v1/students', studentRoutes_1.default);
app.use('/api/v1/teachers', teacherRoutes_1.default);
app.use('/api/v1/attendance', attendanceRoutes_1.default);
app.use('/api/v1/fees', feeRoutes_1.default);
app.use('/api/v1/exams', examRoutes_1.default);
app.use('/api/v1/timetable', timetableRoutes_1.default);
app.use('/api/v1/notices', noticeRoutes_1.default);
app.use('/api/v1/admissions', admissionRoutes_1.default);
app.use('/api/v1/library', libraryRoutes_1.default);
app.use('/api/v1/transport', transportRoutes_1.default);
app.use('/api/v1/website', websiteRoutes_1.default);
app.use('/api/v1/dashboard', dashboardRoutes_1.default);
// Centralized error handler
app.use(errorHandler_1.errorHandler);
// Start server
if (process.env.NODE_ENV !== 'test') {
    (0, db_1.connectDB)().then(() => {
        app.listen(PORT, () => {
            console.log(`[SoftDeals SMS] Server running on port ${PORT}`);
            console.log(`[SoftDeals SMS] Swagger Documentation at http://localhost:${PORT}/api-docs`);
        });
    });
}
exports.default = app;
