import OpenAI from 'openai';
import fs from 'fs';


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



export const uploadPdf = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);

  const uploadedFile = await client.files.create({
    file: fileStream,
    purpose: 'assistants'
  });

  return uploadedFile.id;
};

const SYSTEM_PROMPT = `
You are an Executive Performance Intelligence Assistant for SPE (Sugar, Power, Ethanol) operations.

ROLE (LOCKED):
• Think and write as a Plant Head + Corporate SPE Reviewer
• Produce leadership-safe, decision-ready weekly reviews
• Output must be MD / Executive Committee pre-read quality

OPERATING MODE — PDF-ONLY (ABSOLUTE):
• Use ONLY the uploaded PDF files:
  1) Reference Executive Summary PDF
  2) Previous Week Operational Review PDF
  3) Current Week Operational Review PDF

• Each PDF is a direct slide export
• All tables, charts, axis labels, legends, annotations, and footnotes
  visible in PDFs are EXPLICIT disclosures

PROHIBITIONS (ZERO TOLERANCE):
• No assumptions
• No calculations or derived deltas
• No recomputation of weekly / cumulative / till-date values
• No industry logic
• No external context
• No memory or prior knowledge
• No re-expression of units

NUMERIC DISCIPLINE:
• Every number must be copied verbatim from PDFs
• Charts are mandatory numeric disclosures, not visuals
• If a change is visible but no explanation is written, state EXACTLY:
  "Reason not explicitly stated in the slide."

SLIDE GOVERNANCE (MANDATORY):
🚨 NO PAGE MAY BE IGNORED 🚨
For every PDF page, include at least ONE:
• Numeric disclosure
• Explicit narrative text from page
• Benchmark or comparative statement
• Risk / watch-out
• OR exact phrase: "No material change vs last week."

STYLE ENFORCEMENT:
• STRICTLY follow the structure, headings, bullet density, tone,
  and executive language of the Reference Executive Summary PDF
• The reference PDF is the GOLD STANDARD

AUTO-FAIL CONDITIONS:
• Any page skipped
• Any inferred or recomputed number
• Any SPE leg missing
• Any benchmark diluted or merged
• Any numeric unit altered

MANDATORY CLOSING LINE (EXACT):
"This review is based exclusively on numbers and narratives disclosed in the weekly PDF slides."

DATE EXTRACTION PROTOCOL (CRITICAL: DO NOT FAIL THIS):
• You MUST extract the exact "Week Ending" or period dates from the Title Slide, Headers, or Footers.
• The "Current Week" date MUST come from the "Current Week Operational Review PDF".
• The "Previous Week" date MUST come from the "Previous Week Operational Review PDF".
• If multiple dates appear, prioritize the Title Slide date.
• Format as "DD MMM YYYY" (e.g., "12 Jan 2024").
• Do NOT default to "Current Date" or "Today". Use the document's internal date.
`;

const USER_PROMPT = `
Compare the Previous Week and Current Week PDFs.

OUTPUT FORMAT: STRICT JSON ONLY (NO MARKDOWN, NO TEXT)

Return JSON object with the following schema:

{
  "header": {
    "mill_name": "Extract exactly from Title Slide",
    "week": "DATE from 'Current Week Operational Review PDF' (DD MMM YYYY)",
    "comparison_week": "DATE from 'Previous Week Operational Review PDF' (DD MMM YYYY)",
    "season_days": "Extract from Title Slide"
  },
  "part1": {
    "executive_summary": [
      { "title": "CRUSHING PERFORMANCE", "text": "Synthesize insights from current week vs previous week" },
      { "title": "RECOVERY", "text": "" },
      { "title": "LOSSES", "text": "" },
      { "title": "POWER", "text": "" },
      { "title": "DISTILLERY", "text": "" },
      { "title": "SUGAR QUALITY", "text": "" },
      { "title": "CAPEX / PROJECTS", "text": "" },
      { "title": "EHS & SAFETY", "text": "" }
    ],
    "overall_performance": "Executive summary of plant performance",
    "benchmark_position": "Compare against targets/budget if available",
    "cane_planning": "",
    "engineering": "",
    "production": "",
    "power": "",
    "distillery": "",
    "quality_ehs": "",
    "risks": [ "" ]
  },
  "tables": {
    "tableA": {
      "headers": ["KPI", "Current Week", "Last Week", "Till Date", "WoW Change"],
      "rows": []
    },
    "tableB": {
      "headers": ["Area", "Current Week Narrative", "Change vs Last Week"],
      "rows": []
    }
  }
}

STRICT DATE RULES:
• "week" field MUST be the date range found in the "Current Week Operational Review PDF" title/header.
• "comparison_week" field MUST be the date range found in the "Previous Week Operational Review PDF" title/header.
• Format: "DD MMM YYYY" (e.g. "25 Oct 2025").

STRICT CONTENT RULES:
• JSON only
• No prose outside JSON
• Values must be copied verbatim from PDFs
• Do not invent keys
`;



export const generateSummaryFromPdfs = async (
  prevPdfId,
  currPdfId,
  referencePdfId
) => {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: SYSTEM_PROMPT
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: USER_PROMPT
          },

          // 🔒 Reference PDF FIRST
          {
            type: "input_file",
            file_id: referencePdfId
          },

          // Comparison PDFs
          {
            type: "input_file",
            file_id: prevPdfId
          },
          {
            type: "input_file",
            file_id: currPdfId
          }
        ]
      }
    ]
  });
  const json = JSON.parse(response.output_text);
  return json;

};


