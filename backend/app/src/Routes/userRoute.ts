
import { Router } from 'express';
import { createUser } from '../controllers/userController.js';
import { getUser } from '../controllers/userController.js';
import { updateUser} from '../controllers/userController.js';
import { login} from '../controllers/userController.js';
import { getMe } from "../controllers/userController.js";
import { login2FA } from '../controllers/userController.js';
//import { chat_with_friends } from "../controllers/userController.js";


//TOTP
import { generate2FA, verify2FA, login2FA } from '../controllers/userController.js';

router.get('/2fa/generate', generate2FA);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/login', login2FA);

const router = Router();


//router.post('/', createUser)
router.get('/', getUser)
router.put('/:id', updateUser)
router.get('/me', getMe)
router.post('/login', login)
router.post('/signup', createUser)
router.post('/2fa/login', login2FA);
//
//router.post('/chat_with_friends', chat_with_friends)
//
export default router;