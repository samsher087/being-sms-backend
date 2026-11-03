import { Router } from 'express';
import {
  listRoutes,
  createRoute,
  assignStudentToRoute,
} from '../controllers/transportController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/routes', listRoutes);
router.post('/routes', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createRoute);
router.post('/routes/:id/assign-student', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), assignStudentToRoute);

export default router;
