import { Router } from 'express';
import { getMe, postLogin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/login', postLogin);
router.get('/me', authenticate, getMe);
export default router;
