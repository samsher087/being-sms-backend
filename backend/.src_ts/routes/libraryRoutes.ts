import { Router } from 'express';
import {
  listBooks,
  createBook,
  issueBook,
  returnBook,
  listBookIssues,
} from '../controllers/libraryController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/books', listBooks);
router.post('/books', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createBook);
router.post('/issue', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), issueBook);
router.post('/return/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), returnBook);
router.get('/issues', listBookIssues);

export default router;
