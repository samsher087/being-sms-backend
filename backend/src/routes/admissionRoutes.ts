import { Router } from 'express';
import {
  submitPublicEnquiry,
  listEnquiries,
  updateEnquiryStatus,
  convertEnquiryToStudent,
} from '../controllers/admissionController';
import { authenticateUser, requireRoles } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// Public admission enquiry form submission
router.post('/public-enquiry', tenantMiddleware, submitPublicEnquiry);

// Protected admissions management
router.use(authenticateUser);
router.use(requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'));

router.get('/enquiries', listEnquiries);
router.put('/enquiries/:id/status', updateEnquiryStatus);
router.post('/enquiries/:id/convert', convertEnquiryToStudent);

export default router;
