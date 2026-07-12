import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';

const router = Router();

router.post('/register', protect, permit('admin'), register);
router.post('/login', login);
router.get('/me', protect, me);

export default router;
