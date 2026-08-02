import { Request, Response, NextFunction } from 'express';
import { RouteError } from '../types/wardrobe.js';
import { ProviderError } from '../services/catvton-provider.service.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<RouteError>,
  _next: NextFunction
): void {
  if (err instanceof ProviderError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Invalid wardrobe request.';
  res.status(400).json({
    error: {
      code: 'invalid_input',
      message,
    },
  });
}
