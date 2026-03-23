//import express from "express"; 
import { Router } from 'express';
import { createUser } from '../controllers/userController.js';
import { getUser } from '../controllers/userController.js';
import { updateUser} from '../controllers/userController.js';
import { login} from '../controllers/userController.js';
//import { dashboard} from '../controllers/userController.js';
import { getMe } from "../controllers/userController.js";


const router = Router();


//router.post('/', createUser)
router.get('/', getUser)
router.put('/:id', updateUser)
router.get('/me', getMe)
router.post('/login', login)
router.post('/signup', createUser)

export default router;