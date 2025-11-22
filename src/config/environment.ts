/**
 * Environment Configuration
 * Centraliza todas as configurações da aplicação
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // API
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Features flags (para uso futuro)
  features: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },
  
  // Redis (para uso futuro)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  
  // Database (para uso futuro)
  database: {
    url: process.env.DATABASE_URL,
  },
} as const;

export type Config = typeof config;

