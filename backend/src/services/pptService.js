import ConvertAPI from 'convertapi';
import fs from 'fs';
import path from 'path';



// Initialize with your secret from https://www.convertapi.com
const convertapi = new ConvertAPI('QUKJTUJIWnktyTIqEz3lH1A2zeaJCHI4');

export const convertPptToPdf = async (pptPath, outputDir) => {
  try {
    console.log(`Debug: Sending ${pptPath} to ConvertAPI...`);

    // 1. Perform conversion
    // ConvertAPI handles the large 150-page file and returns a result object
    const result = await convertapi.convert('pdf', {
      File: pptPath
    }, 'pptx');


    
    // 2. Save the PDF to your local output directory
    // This creates a file like: outputDir/presentation.pdf
    const savedFiles = await result.saveFiles(outputDir);
    
    const outputPath = savedFiles[0];
    console.log(`Success: PDF saved at ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('ConvertAPI Error:', error);
    throw error;
  }
};
