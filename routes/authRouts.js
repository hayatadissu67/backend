import express   from 'express';


//import { protect } from '../middleware/authMiddleware';
import {  login, register } from '../controllers/authControllers.js';


const router = express.Router();

router.post('/register',  register);
router.post('/login',  login);
//router.get('/me', protect, getCurrentUser);

export default router;
