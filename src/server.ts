/**
 * Server Entry Point
 * Inicializa o servidor HTTP
 */

import { app } from './app';
import { config } from './config/environment';
import { getLogger } from './shared/logger';

const PORT = config.port;
const logger = getLogger();

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: config.nodeEnv,
    port: PORT,
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down server...');
  
  process.exit(0);

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown());
process.on('SIGINT', () => gracefulShutdown());

