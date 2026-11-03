import { Router } from 'express';
import {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  bulkImportStudents,
} from '../controllers/studentController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT'), listStudents);
router.get('/:id', getStudentById);
router.post('/', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), createStudent);
router.put('/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), updateStudent);
router.post('/bulk-import', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), bulkImportStudents);

export default router;
