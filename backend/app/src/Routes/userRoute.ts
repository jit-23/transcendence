import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
    createUser,
    login,
    login2FA,
    generate2FA,
    confirm2FA,
    disable2FA,
    getUser,
    updateUser,
    getMe,
    updateMe,
} from '../controllers/userController';

const router = Router();

// Max 5 attempts per 15 min on the 2FA verify endpoint
const twoFALimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many 2FA attempts, please login again' },
});

// Public
router.post('/signup', createUser);
router.post('/login', login);
router.post('/login2FA', twoFALimiter, login2FA);

// Profile
router.get('/me', getMe);
router.put('/me', updateMe);       // ← update own profile

// 2FA management
router.post('/2fa/generate', generate2FA);
router.post('/2fa/confirm',  confirm2FA);
router.post('/2fa/disable',  disable2FA);

// Admin-style (kept for compatibility)
router.get('/', getUser);
router.put('/:id', updateUser);

export default router;