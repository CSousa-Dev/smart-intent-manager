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
  port: parseInt(process.env.PORT || '3010', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // API
  apiPrefix: process.env.API_PREFIX || '/api',
  
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
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
    path: process.env.DATABASE_PATH,
  },
  
  // External Services
  tenantService: {
    url: process.env.TENANT_SERVICE_URL || 'http://localhost:3020/api/tenants',
  },
} as const;

export type Config = typeof config;

