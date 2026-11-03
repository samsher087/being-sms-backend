import { Router } from 'express';
import {
  listNotices,
  createNotice,
  deleteNotice,
  listAssignments,
  createAssignment,
} from '../controllers/noticeController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// Notices
router.get('/', listNotices);
router.post('/', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), createNotice);
router.delete('/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), deleteNotice);

// Assignments
router.get('/assignments/list', listAssignments);
router.post('/assignments/create', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), createAssignment);

export default router;
