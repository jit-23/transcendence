import { Router } from 'express';
import {
    createUser,
    login,
    login2FA,
    getUser,
    updateUser,
    getMe
} from '../controllers/userController.js';

const router = Router();

router.get('/', getUser);
router.put('/:id', updateUser);
router.get('/me', getMe);

router.post('/signup', createUser);
router.post('/login', login);
router.post('/login2FA', login2FA);

export default router;