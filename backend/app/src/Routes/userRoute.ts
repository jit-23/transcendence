//import express from "express"; 
import { Router } from 'express';
import { createUser } from '../controllers/userController.js';
import { getUser } from '../controllers/userController.js';
import { updateUser} from '../controllers/userController.js';

const router = Router();


router.post('/', createUser)
router.get('/', getUser)
router.put('/:id', updateUser) 
export default router;