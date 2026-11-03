import { Router } from 'express';
import {
  listTenants,
  createTenant,
  updateTenant,
  updateSubscription,
  getTenantByCode,
} from '../controllers/tenantController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

// Public: get tenant branding by code (for public school website)
router.get('/public/:code', getTenantByCode);

// Super admin: list all tenants
router.get('/', authenticateUser, requireRoles('SUPER_ADMIN'), listTenants);

// Super admin: provision new school tenant
router.post('/', authenticateUser, requireRoles('SUPER_ADMIN'), createTenant);

// Super admin & School Admin: update school profile/theme
router.put('/:id', authenticateUser, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateTenant);

// Super admin: update subscription plan & limits
router.put('/:id/subscription', authenticateUser, requireRoles('SUPER_ADMIN'), updateSubscription);

export default router;
