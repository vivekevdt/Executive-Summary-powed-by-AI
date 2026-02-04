# SPE Executive Summary Generator - Technical Documentation

## 🏗️ System Architecture
The application is built on a modern full-stack architecture designed for document processing and AI-driven data extraction.

### Stack Overview
*   **Frontend**: React (Vite) + Tailwind CSS v4 + Shadcn UI.
*   **Backend**: Node.js + Express.
*   **AI Engine**: OpenAI GPT-4o-mini (via Assistants API).
*   **Processing**: ConvertAPI (PPTX to PDF) + `docx` library (JSON to Word).

---

## 🛠️ Backend Services & Logic

### 1. Document Processing Pipeline (`reportController.js`)
The core workflow follows a 6-step sequence:
1.  **Ingestion**: Files received via `multer`.
2.  **Conversion**: `pptService` triggers ConvertAPI to turn PPTX into PDF (required for OpenAI Assistant context).
3.  **AI Extraction**: `llmService` uses custom `SYSTEM_PROMPT` to enforce strict numeric discipline and JSON formatting.
4.  **Transformation**: The AI's JSON output is passed to `generateDocx.js`.
5.  **Output**: A stylized `.docx` file is saved to the `generatedSummary` directory.
6.  **Metadata**: The job details (Mill, Week, Path) are appended to `metadata.json`.

### 2. Live Progress Tracking (`progressStore.js`)
We implemented a polling architecture to provide real-time feedback:
*   **Server**: Uses an in-memory `Map` to store job status by a unique `jobId` passed from the frontend.
*   **API**: `GET /api/reports/status/:jobId` exposes the current percentage and status message.
*   **Client**: Performs `setInterval` polling every 1.5 seconds while the `loading` state is active.

### 3. DOCX Engineering (`generateDocx.js`)
The report generator uses the `docx` library to construct a multi-section document with a manual styling system:
*   **Primary Font**: Arial.
*   **Header Colors**: `#1F4E78` (Dark Blue) and `#006666` (Dark Teal for Table headers).
*   **Hierarchy**: Uses `HeadingLevel` constants for consistent document outline.

---

## 🛡️ Security Implementation

*   **Scoped Static Serving**: The server restricts `express.static` to the `generatedSummary` folder only. The `uploads` (raw PPTs) and `metadata.json` are NOT accessible via browser.
*   **Absolute Pathing**: Used `fileURLToPath` and `path.join` to resolve static directories, preventing environment-specific pathing errors.
*   **UUID Protection**: Every generation creates a unique v4 UUID. Filenames cannot be brute-forced or guessed by users.
*   **CORS Hardening**: Access is restricted to trusted domains (Localhost + Production Render URLs).

---

## ⚙️ Environment Configuration

### Frontend (.env)
*   `VITE_API_URL`: URL of the backend server (Vite requires `VITE_` prefix).

### Backend (.env)
*   `OPENAI_API_KEY`: API access for GPT-4.
*   `CONVERTAPI_SECRET`: Key for PPTX conversion.
*   `EMAIL_USER` / `EMAIL_PASS`: SMTP credentials for automated mailing.
*   `EXECUTIVE_MAIL_TO`: Recipient address for final reports.

---

## 🚀 Future Roadmap
*   **Auth Integration**: Implementing JWT-based authentication for the History vault.
*   **PDF to OCR**: Enhancing the pipeline to handle scanned images inside PPTs.
*   **Batch Processing**: Allowing multiple mill reports to be generated in parallel.

---
© 2026 SPE Executive Performance Intelligence Assistant
