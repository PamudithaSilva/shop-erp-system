import { Router } from 'express';
import { login, me, register, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';

const router = Router();

router.post('/register',       protect, permit('admin'), register);
router.post('/login',          login);
router.get('/me',              protect, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

export default router;
