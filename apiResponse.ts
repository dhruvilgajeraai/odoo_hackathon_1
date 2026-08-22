import { Response } from 'express';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: ApiErrorDetail[]
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && errors.length > 0 ? { errors } : {}),
    });
  }
}

export class AppError extends Error {
  statusCode: number;
  errors?: ApiErrorDetail[];

  constructor(message: string, statusCode = 500, errors?: ApiErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';
  }
}

export function asyncHandler(
  fn: (req: any, res: Response, next: any) => Promise<any>
) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
