import fs from 'fs';

const metadataPath = 'src/storage/metadata.json';

export const saveMetadata = (meta) => {
  const existing = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath))
    : [];

  existing.push(meta);

  fs.writeFileSync(metadataPath, JSON.stringify(existing, null, 2));
};

export const getAllMetadata = () => {
  return fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath))
    : [];
};

