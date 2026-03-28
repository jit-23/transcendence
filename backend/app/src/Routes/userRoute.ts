import { Router } from 'express';
import {
    createUser, login, login2FA,
    getUser, updateUser, getMe, toggle2FA // ← add toggle2FA
} from '../controllers/userController.js';

const router = Router();

router.get('/', getUser);
router.put('/:id', updateUser);
router.get('/me', getMe);

router.post('/signup', createUser);
router.post('/login', login);
router.post('/login2FA', login2FA);
router.post('/toggle2FA', toggle2FA); // ← new

export default router;