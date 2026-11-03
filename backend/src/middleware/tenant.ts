import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Tenant, ITenant } from '../models/Tenant';

declare global {
  namespace Express {
    interface Request {
      tenant?: ITenant | null;
      tenantId?: mongoose.Types.ObjectId;
    }
  }
}

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Check header x-tenant-id or x-tenant-code
    const headerTenantId = req.headers['x-tenant-id'] as string;
    const headerTenantCode = req.headers['x-tenant-code'] as string;

    let tenant: ITenant | null = null;

    if (headerTenantId && mongoose.isValidObjectId(headerTenantId)) {
      tenant = await Tenant.findById(headerTenantId);
    } else if (headerTenantCode) {
      tenant = await Tenant.findOne({ code: headerTenantCode.toLowerCase() });
    }

    // 2. If not found in headers, check hostname/subdomain (e.g. dps.softdeals.in)
    if (!tenant) {
      const host = req.hostname || req.headers.host || '';
      const parts = host.split('.');
      if (parts.length > 2) {
        const potentialSubdomain = parts[0].toLowerCase();
        if (potentialSubdomain !== 'www' && potentialSubdomain !== 'api') {
          tenant = await Tenant.findOne({ subdomain: potentialSubdomain });
        }
      }
    }

    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenant._id as mongoose.Types.ObjectId;
    }

    next();
  } catch (error) {
    next(error);
  }
};
