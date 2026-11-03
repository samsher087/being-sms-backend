import { Router } from 'express';
import {
  listSessions,
  createSession,
  setCurrentSession,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/academicController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// Academic Sessions
router.get('/sessions', listSessions);
router.post('/sessions', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createSession);
router.put('/sessions/:id/set-current', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), setCurrentSession);

// Classes & Sections
router.get('/classes', listClasses);
router.post('/classes', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createClass);
router.put('/classes/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateClass);
router.delete('/classes/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteClass);

export default router;
