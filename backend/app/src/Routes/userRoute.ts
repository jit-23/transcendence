
import { Router } from 'express';
import { createUser } from '../controllers/userController.js';
import { getUser } from '../controllers/userController.js';
import { updateUser} from '../controllers/userController.js';
import { login} from '../controllers/userController.js';
import { getMe } from "../controllers/userController.js";
//import { chat_with_friends } from "../controllers/userController.js";


const router = Router();


//router.post('/', createUser)
router.get('/', getUser)
router.put('/:id', updateUser)
router.get('/me', getMe)
router.post('/login', login)
router.post('/signup', createUser)
//
//router.post('/chat_with_friends', chat_with_friends)
//
export default router;