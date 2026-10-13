import multer from 'multer';
import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  const reqId = req.id || 'unknown';

  // Handle known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId: reqId,
      },
    });
  }

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    let statusCode = 400;
    let code = 'VALIDATION_ERROR';
    let message = err.message;

    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      code = 'FILE_TOO_LARGE';
      message = 'The uploaded file exceeds the allowed size limit.';
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        requestId: reqId,
      },
    });
  }

  // Handle JSON body parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Malformed JSON payload in request body.',
        requestId: reqId,
      },
    });
  }

  // Fallback for unexpected errors
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'An internal server error occurred.' : err.message,
      requestId: reqId,
    },
  });
};

export default errorHandler;
