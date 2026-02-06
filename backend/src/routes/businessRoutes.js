import express from 'express';
import { createBusiness, getAllBusinesses } from '../controllers/businessController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // We need to create/update this

const router = express.Router();

// Only admin should be able to create businesses, but for now we'll just check for token
router.post('/', authenticateToken, createBusiness);
router.get('/', authenticateToken, getAllBusinesses);

export default router;
