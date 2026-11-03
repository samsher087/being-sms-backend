import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/db';
import { tenantMiddleware } from './middleware/tenant';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import tenantRoutes from './routes/tenantRoutes';
import academicRoutes from './routes/academicRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import feeRoutes from './routes/feeRoutes';
import examRoutes from './routes/examRoutes';
import timetableRoutes from './routes/timetableRoutes';
import noticeRoutes from './routes/noticeRoutes';
import admissionRoutes from './routes/admissionRoutes';
import libraryRoutes from './routes/libraryRoutes';
import transportRoutes from './routes/transportRoutes';
import websiteRoutes from './routes/websiteRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'https://softdeals-sms.vercel.app'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Tenant resolution middleware for all requests
app.use(tenantMiddleware);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/academics', academicRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/admissions', admissionRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/website', websiteRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[SoftDeals SMS] Server running on port ${PORT}`);
      console.log(`[SoftDeals SMS] Swagger Documentation at http://localhost:${PORT}/api-docs`);
    });
  });
}

export default app;
