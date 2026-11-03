import { Router } from 'express';
import {
  getClassAttendance,
  submitAttendance,
  getStudentAttendanceHistory,
} from '../controllers/attendanceController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/class', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), getClassAttendance);
router.post('/class', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), submitAttendance);
router.get('/student/:studentId', getStudentAttendanceHistory);

export default router;
