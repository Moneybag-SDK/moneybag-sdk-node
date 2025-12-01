export const API_VERSION = 'v2';
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const MAX_ORDER_ID_LENGTH = 30;
export const MIN_ORDER_AMOUNT = 10.00;
export const MAX_ORDER_AMOUNT = 500000.00;
export const MAX_URL_LENGTH = 255;

export const SANDBOX_BASE_URL = 'https://sandbox.api.moneybag.com.bd/api/v2';
export const PRODUCTION_BASE_URL = 'https://api.moneybag.com.bd/api/v2';

export const PAYMENT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  MOBILE_BANKING: 'mobile_banking',
  INTERNET_BANKING: 'internet_banking',
  WALLET: 'wallet',
} as const;

export const CURRENCY_CODES = {
  BDT: 'BDT',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;