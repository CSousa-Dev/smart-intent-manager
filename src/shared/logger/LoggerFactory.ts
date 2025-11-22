/**
 * Logger Factory
 * Factory para criar e gerenciar instância única do logger
 */

import { ILogger } from './ILogger';
import { PinoLogger } from './PinoLogger';
import { join } from 'path';
import { config } from '../../config/environment';

let loggerInstance: ILogger | null = null;

/**
 * Gets or creates the singleton logger instance
 */
export function getLogger(): ILogger {
  if (!loggerInstance) {
    const logsDir = join(process.cwd(), 'logs');
    const defaultFileName = 'app.log';
    const logLevel = config.logLevel;

    loggerInstance = new PinoLogger(logsDir, defaultFileName, logLevel);
  }

  return loggerInstance;
}

