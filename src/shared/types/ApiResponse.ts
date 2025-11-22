/**
 * API Response Types
 * Padroniza as respostas da API
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

/**
 * Helper para criar respostas de sucesso
 */
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Helper para criar respostas de erro
 */
export function errorResponse(
  message: string,
  code?: string,
  details?: unknown
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      ...(code !== undefined && { code }),
      ...(details !== undefined && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

