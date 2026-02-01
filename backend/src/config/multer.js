import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'src/storage/uploads/',
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.originalname.endsWith('.pptx')) {
      return cb(new Error('Only PPTX files allowed'));
    }
    cb(null, true);
  }
});

export default upload;
