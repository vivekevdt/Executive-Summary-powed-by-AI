import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import reportRoutes from './routes/reportRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

/**
 * CORS configuration
 * Allow frontend (Vite runs on 5173)
 */
app.use(
  cors({
    origin: [
      'http://localhost:5174',
      'http://localhost:5173',
      'https://executive-summary-powed-by-ai-zuari.onrender.com',
      'http://localhost:5000',
      'http://192.168.64.174:5000'
    ],
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
// NEW SECURE ROUTE - Storage is inside 'src'
app.use('/reports/download', express.static(path.join(__dirname, 'storage/generatedSummary')));
app.use('/reports/summary-data', express.static(path.join(__dirname, 'storage/generatedSummary')));

// COMPATIBILITY: Allow old links in metadata.json to still work
app.use('/src/storage/generatedSummary', express.static(path.join(__dirname, 'storage/generatedSummary')));


app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

// Serve static files from the React frontend app
const buildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(buildPath));

// Anything that doesn't match the above, send back index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


export default app;
