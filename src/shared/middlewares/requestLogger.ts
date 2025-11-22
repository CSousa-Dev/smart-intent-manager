/**
 * Request Logger Middleware
 * Loga todas as requisições HTTP
 */

import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../logger';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const logger = getLogger();
  
  // Captura quando a resposta termina
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    logger.info(`${method} ${originalUrl} - ${statusCode}`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
}

