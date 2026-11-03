import { Router } from 'express';
import {
  listExamSchedules,
  createExamSchedule,
  submitStudentMarks,
  getStudentReportCard,
  getClassResults,
} from '../controllers/examController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/schedules', listExamSchedules);
router.post('/schedules', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), createExamSchedule);

router.post('/marks', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), submitStudentMarks);
router.get('/report-card/:examId/:studentId', getStudentReportCard);
router.get('/results/:examId/:classId', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), getClassResults);

export default router;
