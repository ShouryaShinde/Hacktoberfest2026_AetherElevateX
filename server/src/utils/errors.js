export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request parameters.') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor(message = 'Please upload a PDF file or paste document text.') {
    super(message, 415, 'UNSUPPORTED_FILE_TYPE');
  }
}

export class FileTooLargeError extends AppError {
  constructor(message = 'The uploaded file or document exceeds the size limit.') {
    super(message, 413, 'FILE_TOO_LARGE');
  }
}

export class EmptyDocumentError extends AppError {
  constructor(message = 'The document does not contain any readable text.') {
    super(message, 422, 'EMPTY_DOCUMENT');
  }
}

export class TextExtractionError extends AppError {
  constructor(message = 'Failed to extract text from the document.') {
    super(message, 422, 'TEXT_EXTRACTION_FAILED');
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests, please try again later.') {
    super(message, 429, 'RATE_LIMITED');
  }
}
