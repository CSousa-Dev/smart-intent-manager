/**
 * Logger Interface
 * Interface para abstração de logging, permitindo trocar implementações sem afetar o código
 */

export interface ILogger {
  /**
   * Logs an informational message
   * @param message The message to log
   * @param metadata Optional metadata object
   * @param fileName Optional file name for the log file (defaults to app.log)
   */
  info(message: string, metadata?: object, fileName?: string): void;

  /**
   * Logs an error message
   * @param message The message to log
   * @param metadata Optional metadata object
   * @param fileName Optional file name for the log file (defaults to app.log)
   */
  error(message: string, metadata?: object, fileName?: string): void;

  /**
   * Logs a warning message
   * @param message The message to log
   * @param metadata Optional metadata object
   * @param fileName Optional file name for the log file (defaults to app.log)
   */
  warn(message: string, metadata?: object, fileName?: string): void;

  /**
   * Logs a debug message
   * @param message The message to log
   * @param metadata Optional metadata object
   * @param fileName Optional file name for the log file (defaults to app.log)
   */
  debug(message: string, metadata?: object, fileName?: string): void;
}

