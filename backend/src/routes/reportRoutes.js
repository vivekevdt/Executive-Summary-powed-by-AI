import express from 'express';
import upload from '../config/multer.js';

import { generateExecutiveSummary, getAllReports, getJobStatus, getReportSummary, downloadFile, updateReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(authenticateToken);

router.get('/', getAllReports);
router.get('/status/:jobId', getJobStatus);
router.get('/summary/:fileId', getReportSummary);
router.get('/download/:filename', downloadFile);
router.put('/update/:fileId', updateReport);

router.post(

    '/executive-summary',
    upload.fields([
        { name: 'currentWeek', maxCount: 1 },
        { name: 'previousWeek', maxCount: 1 }
    ]),
    generateExecutiveSummary
);

export default router;
