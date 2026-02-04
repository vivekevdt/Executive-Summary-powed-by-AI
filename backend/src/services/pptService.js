import ConvertAPI from 'convertapi';
import fs from 'fs';
import path from 'path';



// Initialize with your secret from https://www.convertapi.com
const convertapi = new ConvertAPI('QUKJTUJIWnktyTIqEz3lH1A2zeaJCHI4');

export const convertPptToPdf = async (inputPath, outputDir) => {
  try {
    const ext = path.extname(inputPath).toLowerCase().replace('.', '') || 'pptx';
    console.log(`Debug: Sending ${inputPath} to ConvertAPI (detecting format: ${ext})...`);

    const result = await convertapi.convert('pdf', {
      File: inputPath
    }, ext);

    const savedFiles = await result.saveFiles(outputDir);
    const outputPath = savedFiles[0];
    console.log(`Success: PDF saved at ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error('ConvertAPI Error:', error);
    throw error;
  }
};

export const convertDocxToPdf = async (docxPath, outputPdfPath) => {
  try {
    const outputDir = path.dirname(outputPdfPath);
    const result = await convertapi.convert('pdf', { File: docxPath }, 'docx');
    await result.saveFiles(outputDir);

    // ConvertAPI might change the filename slightly, so we rename it to match our target
    const savedFile = result.files[0].fileInfo.FileName;
    const tempPath = path.join(outputDir, savedFile);
    if (fs.existsSync(tempPath) && tempPath !== path.resolve(outputPdfPath)) {
      fs.renameSync(tempPath, outputPdfPath);
    }

    return outputPdfPath;
  } catch (error) {
    console.error('DOCX to PDF Conversion Error:', error);
    throw error;
  }
};

