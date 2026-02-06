
import express from 'express';
import { login, registerUser, getAllUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
// Only admin can register users, so protect this route
router.post('/register', authenticateToken, registerUser);
router.get('/users', authenticateToken, getAllUsers);

export default router;
