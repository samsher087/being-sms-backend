import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { WebsiteContent } from '../models/WebsiteContent';
import { AcademicSession } from '../models/AcademicSession';
import { recordAuditLog } from '../middleware/auth';

export const listTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    
    // Attach statistics for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (t) => {
        const studentCount = await User.countDocuments({ tenantId: t._id, role: 'STUDENT' });
        const staffCount = await User.countDocuments({ tenantId: t._id, role: { $in: ['TEACHER', 'ACCOUNTANT', 'PRINCIPAL', 'SCHOOL_ADMIN'] } });
        return {
          ...t.toObject(),
          stats: {
            students: studentCount,
            staff: staffCount,
          },
        };
      })
    );

    res.json({ success: true, tenants: tenantsWithStats });
  } catch (error) {
    next(error);
  }
};

export const getTenantByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.params;
    const tenant = await Tenant.findOne({ code: code.toLowerCase(), isActive: true });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }
    res.json({ success: true, tenant });
  } catch (error) {
    next(error);
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, subdomain, contact, subscription, themeConfig, adminUser } = req.body;

    const existing = await Tenant.findOne({ $or: [{ code: code.toLowerCase() }, { subdomain: subdomain.toLowerCase() }] });
    if (existing) {
      res.status(400).json({ success: false, message: 'A school with this code or subdomain already exists.' });
      return;
    }

    const tenant = await Tenant.create({
      name,
      code: code.toLowerCase(),
      subdomain: subdomain.toLowerCase(),
      contact,
      subscription: subscription || { plan: 'GROWTH', status: 'ACTIVE', studentLimit: 2000, staffLimit: 200 },
      themeConfig: themeConfig || { primaryColor: '#0B192C', secondaryColor: '#1E3E62', accentColor: '#008170' },
      isActive: true,
    });

    // Create default initial academic session (2026-2027)
    const session = await AcademicSession.create({
      tenantId: tenant._id,
      name: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
      status: 'ACTIVE',
    });

    tenant.settings.currentSessionId = session._id as any;
    await tenant.save();

    // Create default website content
    await WebsiteContent.create({
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
      await User.create({
        name: adminUser.name || `${tenant.name} Administrator`,
        email: adminUser.email.toLowerCase(),
        password: adminUser.password || 'Password@123',
        role: 'SCHOOL_ADMIN',
        tenantId: tenant._id,
      });
    }

    await recordAuditLog({
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'TENANT_CREATED',
      resourceType: 'TENANT',
      resourceId: tenant._id.toString(),
      details: { tenantName: tenant.name, code: tenant.code },
    });

    res.status(201).json({ success: true, message: 'School tenant provisioned successfully.', tenant });
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Only super admin or the school's admin can edit
    if (req.userRole !== 'SUPER_ADMIN' && req.tenantId?.toString() !== id) {
      res.status(403).json({ success: false, message: 'Unauthorized to modify this tenant.' });
      return;
    }

    const tenant = await Tenant.findByIdAndUpdate(id, req.body, { new: true });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }

    await recordAuditLog({
      tenantId: tenant._id as any,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'TENANT_UPDATED',
      resourceType: 'TENANT',
      resourceId: tenant._id.toString(),
      details: req.body,
    });

    res.json({ success: true, message: 'School tenant updated successfully.', tenant });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { plan, status, studentLimit, staffLimit, expiresAt } = req.body;

    const tenant = await Tenant.findById(id);
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
  } catch (error) {
    next(error);
  }
};
