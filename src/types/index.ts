import { PAYMENT_STATUS, PAYMENT_METHODS, CURRENCY_CODES } from '../constants';

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
export type CurrencyCode = typeof CURRENCY_CODES[keyof typeof CURRENCY_CODES];

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
}

