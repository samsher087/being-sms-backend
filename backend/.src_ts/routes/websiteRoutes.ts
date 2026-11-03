import { Router } from 'express';
import { getPublicWebsiteData, updateWebsiteContent } from '../controllers/websiteController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

// Public: Get tenant website content for visitor page
router.get('/public/:code', getPublicWebsiteData);

// School Admin & Super Admin: Update CMS content
router.put('/cms', authenticateUser, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateWebsiteContent);

export default router;
