import { Router } from 'express';
import { listTeachers, createTeacher, updateTeacher } from '../controllers/teacherController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', listTeachers);
router.post('/', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), createTeacher);
router.put('/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), updateTeacher);

export default router;
