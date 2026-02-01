import fs from 'fs';
import PDFDocument from 'pdfkit';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const extractText = async (pdfPath) => {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  return data.text;
};

export const generatePdf = (content, outputPath) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(content);
    doc.end();

    stream.on('finish', resolve);
  });
};
