import express from 'express';
import upload from '../config/multer.js';

import { generateExecutiveSummary, getAllReports } from '../controllers/reportController.js';
const router = express.Router();

router.get('/', getAllReports);

router.post(

    '/executive-summary',
    upload.fields([
        { name: 'currentWeek', maxCount: 1 },
        { name: 'previousWeek', maxCount: 1 }
    ]),
    generateExecutiveSummary
);

export default router;
