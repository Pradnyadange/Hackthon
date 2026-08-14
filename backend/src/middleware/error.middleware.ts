import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Server Exception Logged:', err);

  let statusCode = err.statusCode || 400;
  let message = err.message || 'An unexpected server error occurred. Please try again.';

  // Prisma Error Parsing
  if (err.code === 'P2002') {
    statusCode = 400;
    const target = err.meta?.target;
    if (Array.isArray(target) && target.includes('rollNumber')) {
      message = 'Roll number is already used in this class. Please choose a different roll number.';
    } else {
      message = 'A record with duplicate unique details already exists.';
    }
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid class or reference selection. Please refresh the page and select a valid class.';
  } else if (typeof message === 'string' && message.includes('Invocation in')) {
    // Strip Prisma internal stack trace info
    if (message.includes('unique constraint') || message.includes('Unique constraint')) {
      message = 'Roll number is already used in this class. Please choose a different roll number.';
    } else if (message.includes('Foreign key')) {
      message = 'Selected class or resource ID is invalid. Please select a valid class.';
    } else {
      message = 'Database operation failed due to invalid parameters.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
