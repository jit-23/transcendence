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
    updateAvatar,
    searchUsers,
    sendFriendRequest,
    getReceivedFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    unfriend,
} from '../controllers/userController';
import { googleAuthRedirect, googleAuthCallback } from '../controllers/googleAuthController';

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

// Google OAuth
router.get('/auth/google',          googleAuthRedirect);
router.get('/auth/google/callback', googleAuthCallback);

// Profile
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/avatar', updateAvatar);

// 2FA management
router.post('/2fa/generate', generate2FA);
router.post('/2fa/confirm',  confirm2FA);
router.post('/2fa/disable',  disable2FA);

// Search
router.get('/search', searchUsers);

// Friend requests
router.post('/friend-request/send', sendFriendRequest);
router.get('/friend-request/received', getReceivedFriendRequests);
router.post('/friend-request/:id/accept', acceptFriendRequest);
router.post('/friend-request/:id/reject', rejectFriendRequest);
router.get('/friends', getFriends);
router.post('/friends/:id/unfriend', unfriend);

// Admin-style (kept for compatibility)
router.get('/', getUser);
router.put('/:id', updateUser);

export default router;