import { Router } from 'express';
import { login, me, register, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

router.post('/register',       protect, permit('admin'), register);
router.post('/login',          authLimiter, login);
router.get('/me',              protect, me);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password',  authLimiter, resetPassword);

export default router;
