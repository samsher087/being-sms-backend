import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser, UserRole } from '../models/User';
import { AuditLog } from '../models/AuditLog';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: mongoose.Types.ObjectId;
      userRole?: UserRole;
    }
  }
}

interface JwtPayload {
  id: string;
  role: UserRole;
  tenantId?: string;
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'super_secret_softdeals_jwt_key_2026_school_management';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User account not found or has been deactivated.' });
      return;
    }

    req.user = user;
    req.userId = user._id as mongoose.Types.ObjectId;
    req.userRole = user.role;

    // Tenant binding
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId) {
        // Enforce that user can only operate in their own school tenant
        req.tenantId = user.tenantId as mongoose.Types.ObjectId;
      }
    } else {
      // Super Admin can override or operate on whichever tenant is supplied in headers
      if (!req.tenantId && user.tenantId) {
        req.tenantId = user.tenantId as mongoose.Types.ObjectId;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userRole) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.userRole === 'SUPER_ADMIN') {
      return next(); // Super admin has global system-level access
    }

    if (!roles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.userRole}' does not have sufficient permissions.`,
      });
      return;
    }

    next();
  };
};

export const recordAuditLog = async (params: {
  tenantId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  userRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
}): Promise<void> => {
  try {
    await AuditLog.create(params);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
