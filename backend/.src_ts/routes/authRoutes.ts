import { Router } from 'express';
import { login, getMe, logout, forgotPassword, getDemoAccounts } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/demo-accounts', getDemoAccounts);
router.get('/me', authenticateUser, getMe);

export default router;
