import { Router } from 'express';
import {
  getClassTimetable,
  saveClassTimetable,
  getTeacherTimetable,
} from '../controllers/timetableController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/class/:classId', getClassTimetable);
router.post('/class/:classId', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), saveClassTimetable);
router.get('/teacher/:teacherId', getTeacherTimetable);

export default router;
