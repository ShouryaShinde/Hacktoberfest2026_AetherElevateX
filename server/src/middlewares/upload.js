import multer from 'multer';
import config from '../config/index.js';
import { UnsupportedFileTypeError } from '../utils/errors.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(new UnsupportedFileTypeError('Please upload a PDF file or paste document text.'), false);
  }
};

export const uploadSinglePdf = multer({
  storage,
  limits: {
    fileSize: config.maxUploadMb * 1024 * 1024,
  },
  fileFilter,
}).single('file');

export default uploadSinglePdf;
