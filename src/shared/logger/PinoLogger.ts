/**
 * Pino Logger Implementation
 * Implementação do ILogger usando Pino com suporte a múltiplos arquivos de log
 */

import pino, { Logger } from 'pino';
import { ILogger } from './ILogger';
import { join } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';

export class PinoLogger implements ILogger {
  private loggers: Map<string, Logger>;
  private logsDir: string;
  private defaultFileName: string;
  private logLevel: string;

  constructor(logsDir: string, defaultFileName: string, logLevel: string) {
    this.loggers = new Map();
    this.logsDir = logsDir;
    this.defaultFileName = defaultFileName;
    this.logLevel = logLevel;

    // Ensure logs directory exists
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Gets or creates a logger instance for a specific file
   */
  private getLoggerForFile(fileName: string): Logger {
    if (this.loggers.has(fileName)) {
      return this.loggers.get(fileName)!;
    }

    const filePath = join(this.logsDir, fileName);
    const stream = createWriteStream(filePath, { flags: 'a' });

    const logger = pino(
      {
        level: this.logLevel,
        formatters: {
          level: (label) => {
            return { level: label };
          },
        },
      },
      stream
    );

    this.loggers.set(fileName, logger);
    return logger;
  }

  /**
   * Logs an informational message
   */
  info(message: string, metadata?: object, fileName?: string): void {
    const logFileName = fileName || this.defaultFileName;
    const logger = this.getLoggerForFile(logFileName);
    logger.info(metadata || {}, message);
  }

  /**
   * Logs an error message
   */
  error(message: string, metadata?: object, fileName?: string): void {
    const logFileName = fileName || this.defaultFileName;
    const logger = this.getLoggerForFile(logFileName);
    logger.error(metadata || {}, message);
  }

  /**
   * Logs a warning message
   */
  warn(message: string, metadata?: object, fileName?: string): void {
    const logFileName = fileName || this.defaultFileName;
    const logger = this.getLoggerForFile(logFileName);
    logger.warn(metadata || {}, message);
  }

  /**
   * Logs a debug message
   */
  debug(message: string, metadata?: object, fileName?: string): void {
    const logFileName = fileName || this.defaultFileName;
    const logger = this.getLoggerForFile(logFileName);
    logger.debug(metadata || {}, message);
  }
}

