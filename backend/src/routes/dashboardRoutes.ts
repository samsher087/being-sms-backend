import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/metrics', getDashboardData);

export default router;
