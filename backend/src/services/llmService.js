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
`;

const USER_PROMPT = `
Compare the Previous Week and Current Week PDFs.

OUTPUT FORMAT: STRICT JSON ONLY (NO MARKDOWN, NO TEXT)

Return JSON with the following schema:

{
  "header": {
    "mill_name": "",
    "week": "",
    "comparison_week": "",
    "season_day": ""
  },
  "part1": {
    "executive_summary": [
      { "title": "CRUSHING PERFORMANCE", "text": "" },
      { "title": "RECOVERY", "text": "" },
      { "title": "LOSSES", "text": "" },
      { "title": "POWER", "text": "" },
      { "title": "DISTILLERY", "text": "" },
      { "title": "SUGAR QUALITY", "text": "" },
      { "title": "CAPEX / PROJECTS", "text": "" },
      { "title": "EHS & SAFETY", "text": "" }
    ],
    "overall_performance": "",
    "benchmark_position": "",
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
      "headers": ["KPI","Current Week","Last Week","Till Date","WoW Change"],
      "rows": []
    },
    "tableB": {
      "headers": ["Area","Current Week Narrative","Change vs Last Week"],
      "rows": []
    }
  }
}

STRICT RULES:
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


