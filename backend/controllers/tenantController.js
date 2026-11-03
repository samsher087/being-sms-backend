"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscription = exports.updateTenant = exports.createTenant = exports.getTenantByCode = exports.listTenants = void 0;
const Tenant_1 = require("../models/Tenant");
const User_1 = require("../models/User");
const WebsiteContent_1 = require("../models/WebsiteContent");
const AcademicSession_1 = require("../models/AcademicSession");
const auth_1 = require("../middleware/auth");
const listTenants = async (req, res, next) => {
    try {
        const tenants = await Tenant_1.Tenant.find().sort({ createdAt: -1 });
        // Attach statistics for each tenant
        const tenantsWithStats = await Promise.all(tenants.map(async (t) => {
            const studentCount = await User_1.User.countDocuments({ tenantId: t._id, role: 'STUDENT' });
            const staffCount = await User_1.User.countDocuments({ tenantId: t._id, role: { $in: ['TEACHER', 'ACCOUNTANT', 'PRINCIPAL', 'SCHOOL_ADMIN'] } });
            return {
                ...t.toObject(),
                stats: {
                    students: studentCount,
                    staff: staffCount,
                },
            };
        }));
        res.json({ success: true, tenants: tenantsWithStats });
    }
    catch (error) {
        next(error);
    }
};
exports.listTenants = listTenants;
const getTenantByCode = async (req, res, next) => {
    try {
        const { code } = req.params;
        const tenant = await Tenant_1.Tenant.findOne({ code: code.toLowerCase(), isActive: true });
        if (!tenant) {
            res.status(404).json({ success: false, message: 'School tenant not found.' });
            return;
        }
        res.json({ success: true, tenant });
    }
    catch (error) {
        next(error);
    }
};
exports.getTenantByCode = getTenantByCode;
const createTenant = async (req, res, next) => {
    try {
        const { name, code, subdomain, contact, subscription, themeConfig, adminUser } = req.body;
        const existing = await Tenant_1.Tenant.findOne({ $or: [{ code: code.toLowerCase() }, { subdomain: subdomain.toLowerCase() }] });
        if (existing) {
            res.status(400).json({ success: false, message: 'A school with this code or subdomain already exists.' });
            return;
        }
        const tenant = await Tenant_1.Tenant.create({
            name,
            code: code.toLowerCase(),
            subdomain: subdomain.toLowerCase(),
            contact,
            subscription: subscription || { plan: 'GROWTH', status: 'ACTIVE', studentLimit: 2000, staffLimit: 200 },
            themeConfig: themeConfig || { primaryColor: '#0B192C', secondaryColor: '#1E3E62', accentColor: '#008170' },
            isActive: true,
        });
        // Create default initial academic session (2026-2027)
        const session = await AcademicSession_1.AcademicSession.create({
            tenantId: tenant._id,
            name: '2026-2027',
            startDate: new Date('2026-04-01'),
            endDate: new Date('2027-03-31'),
            isCurrent: true,
            status: 'ACTIVE',
        });
        tenant.settings.currentSessionId = session._id;
        await tenant.save();
        // Create default website content
        await WebsiteContent_1.WebsiteContent.create({
            tenantId: tenant._id,
            hero: {
                badge: 'Admissions Open 2026-27',
                title: `Welcome to ${tenant.name}`,
                subtitle: 'Empowering minds, building character, and inspiring excellence for a brighter tomorrow.',
                ctaPrimaryText: 'Apply for Admission',
                ctaPrimaryLink: '/admissions',
                ctaSecondaryText: 'Explore Academics',
                ctaSecondaryLink: '/academics',
                heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
            },
        });
        // If initial admin credentials provided, create school admin
        if (adminUser) {
            await User_1.User.create({
                name: adminUser.name || `${tenant.name} Administrator`,
                email: adminUser.email.toLowerCase(),
                password: adminUser.password || 'Password@123',
                role: 'SCHOOL_ADMIN',
                tenantId: tenant._id,
            });
        }
        await (0, auth_1.recordAuditLog)({
            userId: req.userId,
            userName: req.user?.name,
            userRole: req.userRole,
            action: 'TENANT_CREATED',
            resourceType: 'TENANT',
            resourceId: tenant._id.toString(),
            details: { tenantName: tenant.name, code: tenant.code },
        });
        res.status(201).json({ success: true, message: 'School tenant provisioned successfully.', tenant });
    }
    catch (error) {
        next(error);
    }
};
exports.createTenant = createTenant;
const updateTenant = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Only super admin or the school's admin can edit
        if (req.userRole !== 'SUPER_ADMIN' && req.tenantId?.toString() !== id) {
            res.status(403).json({ success: false, message: 'Unauthorized to modify this tenant.' });
            return;
        }
        const tenant = await Tenant_1.Tenant.findByIdAndUpdate(id, req.body, { new: true });
        if (!tenant) {
            res.status(404).json({ success: false, message: 'School tenant not found.' });
            return;
        }
        await (0, auth_1.recordAuditLog)({
            tenantId: tenant._id,
            userId: req.userId,
            userName: req.user?.name,
            userRole: req.userRole,
            action: 'TENANT_UPDATED',
            resourceType: 'TENANT',
            resourceId: tenant._id.toString(),
            details: req.body,
        });
        res.json({ success: true, message: 'School tenant updated successfully.', tenant });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTenant = updateTenant;
const updateSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { plan, status, studentLimit, staffLimit, expiresAt } = req.body;
        const tenant = await Tenant_1.Tenant.findById(id);
        if (!tenant) {
            res.status(404).json({ success: false, message: 'Tenant not found.' });
            return;
        }
        tenant.subscription = {
            plan: plan || tenant.subscription.plan,
            status: status || tenant.subscription.status,
            studentLimit: studentLimit ?? tenant.subscription.studentLimit,
            staffLimit: staffLimit ?? tenant.subscription.staffLimit,
            expiresAt: expiresAt ? new Date(expiresAt) : tenant.subscription.expiresAt,
        };
        await tenant.save();
        res.json({ success: true, message: 'Subscription updated successfully.', tenant });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubscription = updateSubscription;
