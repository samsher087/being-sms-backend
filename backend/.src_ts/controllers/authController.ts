import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { Tenant } from '../models/Tenant';
import { recordAuditLog } from '../middleware/auth';

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'super_secret_softdeals_jwt_key_2026_school_management';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tenantId: user.tenantId,
    },
    secret,
    { expiresIn: expiresIn as any }
  );
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, tenantCode, portalRole } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password.' });
      return;
    }

    const query: any = { email: email.toLowerCase() };

    // If tenantCode provided or resolved
    let targetTenant: any = null;
    if (tenantCode) {
      targetTenant = await Tenant.findOne({ code: tenantCode.toLowerCase() });
      if (targetTenant) {
        query.tenantId = targetTenant._id;
      }
    }

    // Try finding the user in the selected school
    let user = await User.findOne(query);

    // If not found with tenantId, check if it's a global SUPER_ADMIN
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase(), role: 'SUPER_ADMIN' });
    }

    if (!user) {
      // Check if user exists in the system under a DIFFERENT school tenant
      const existingUserAnySchool = await User.findOne({ email: email.toLowerCase() }).populate('tenantId', 'name code');
      if (existingUserAnySchool && existingUserAnySchool.tenantId) {
        const correctTenant = existingUserAnySchool.tenantId as any;
        const selectedTenantName = targetTenant ? targetTenant.name : tenantCode;
        res.status(400).json({
          success: false,
          errorCode: 'WRONG_SCHOOL',
          correctTenantCode: correctTenant.code,
          correctTenantName: correctTenant.name,
          message: `Incorrect School Selected: Account '${email}' is registered at '${correctTenant.name}', not '${selectedTenantName}'. Please switch the school branch to '${correctTenant.name}'.`,
        });
        return;
      }

      // User does not exist at all
      res.status(401).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: `No account found with email '${email}' in ${targetTenant ? targetTenant.name : 'the selected school'}. Please check the email address or contact the school office.`,
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        errorCode: 'INVALID_PASSWORD',
        message: `Incorrect password entered for '${email}'. Please verify your credentials or click 'Auto-fill Demo Password'.`,
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the administrator.' });
      return;
    }

    // Role-wise portal access verification
    if (portalRole && portalRole !== 'ANY') {
      if (user.role !== portalRole && user.role !== 'SUPER_ADMIN') {
        const portalNames: Record<string, string> = {
          STUDENT: 'Student Portal',
          PARENT: 'Parent Portal',
          TEACHER: 'Teacher / Faculty Portal',
          ACCOUNTANT: 'Accounts & Finance Portal',
          PRINCIPAL: 'Principal Portal',
          SCHOOL_ADMIN: 'School Administration Portal',
          SUPER_ADMIN: 'Super Admin Platform Portal',
        };
        const requestedPortal = portalNames[portalRole] || portalRole;
        const actualRoleName = portalNames[user.role] || user.role;
        res.status(403).json({
          success: false,
          message: `Role Access Restricted: You are attempting to sign into the ${requestedPortal}, but your account credentials belong to ${actualRoleName}. Please select the ${actualRoleName} to log in.`,
        });
        return;
      }
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    // Populate tenant info if exists
    let tenantInfo = null;
    if (user.tenantId) {
      tenantInfo = await Tenant.findById(user.tenantId);
    }

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await recordAuditLog({
      tenantId: user.tenantId,
      userId: user._id as any,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      resourceType: 'AUTH',
      ipAddress: req.ip,
      details: { email: user.email },
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        avatar: user.avatar,
        phone: user.phone,
        linkedStudentId: user.linkedStudentId,
        linkedChildrenIds: user.linkedChildrenIds,
        linkedTeacherId: user.linkedTeacherId,
      },
      tenant: tenantInfo,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('tenantId')
      .populate('linkedStudentId')
      .populate('linkedChildrenIds')
      .populate('linkedTeacherId');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  // Simulated secure reset
  res.json({
    success: true,
    message: `If an account with email ${email} exists, a secure reset link has been dispatched to their registered email address.`,
  });
};

export const getDemoAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenants = await Tenant.find({ isActive: true }).select('name code subdomain');
    
    // List demo role shortcuts
    const demoLogins = [
      {
        role: 'SUPER_ADMIN',
        roleLabel: 'Super Admin (SoftDeals Platform)',
        email: 'superadmin@softdeals.in',
        password: 'Password@123',
        description: 'Multi-tenant SaaS management, tenant lifecycle, platform analytics and subscriptions.',
        school: 'SoftDeals Global Cloud',
      },
      {
        role: 'SCHOOL_ADMIN',
        roleLabel: 'School Admin',
        email: 'admin@dps.edu.in',
        password: 'Password@123',
        description: 'Full school administration: students, teachers, classes, fees, admissions, and settings.',
        school: 'D.A.V Public School, Pindersot',
      },
      {
        role: 'PRINCIPAL',
        roleLabel: 'Principal',
        email: 'principal@dps.edu.in',
        password: 'Password@123',
        description: 'School academic overview, approval workflows, fee and attendance analytics.',
        school: 'D.A.V Public School, Pindersot',
      },
      {
        role: 'TEACHER',
        roleLabel: 'Teacher (Faculty)',
        email: 'teacher@dps.edu.in',
        password: 'Password@123',
        description: 'Attendance register, mark sheet entry, timetable, assignments, class notices.',
        school: 'D.A.V Public School, Pindersot',
      },
      {
        role: 'ACCOUNTANT',
        roleLabel: 'Accountant (Bursar)',
        email: 'accounts@dps.edu.in',
        password: 'Password@123',
        description: 'Fee collection, receipt generation, pending dues tracking, financial audit reports.',
        school: 'D.A.V Public School, Pindersot',
      },
      {
        role: 'STUDENT',
        roleLabel: 'Student',
        email: 'student@dps.edu.in',
        password: 'Password@123',
        description: 'Personal profile, class timetable, examination report cards, homework, fee receipts.',
        school: 'D.A.V Public School, Pindersot',
      },
      {
        role: 'PARENT',
        roleLabel: 'Parent / Guardian',
        email: 'parent@dps.edu.in',
        password: 'Password@123',
        description: 'Child performance overview, attendance monitoring, fee dues payment, school notices.',
        school: 'D.A.V Public School, Pindersot',
      },
    ];

    res.json({
      success: true,
      tenants,
      demoLogins,
    });
  } catch (error) {
    next(error);
  }
};
