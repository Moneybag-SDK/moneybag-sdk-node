import { PaymentStatus } from '../types';

export interface RedirectParams {
  transaction_id: string;
  status: PaymentStatus;
}

export class RedirectHandler {
  /**
   * Parse redirect URL query parameters
   * @param url Full redirect URL or query string
   * @returns Parsed redirect parameters
   */
  static parseRedirectUrl(url: string): RedirectParams {
    let queryString = url;
    
    // If it's a full URL, extract query string
    if (url.includes('?')) {
      queryString = url.split('?')[1];
    }
    
    const params = new URLSearchParams(queryString);
    
    const transactionId = params.get('transaction_id');
    const status = params.get('status') as PaymentStatus;
    
    if (!transactionId || !status) {
      throw new Error('Invalid redirect URL: missing required parameters');
    }
    
    return {
      transaction_id: transactionId,
      status: status,
    };
  }
  
  /**
   * Build redirect URL with parameters
   * @param baseUrl Base URL to redirect to
   * @param params Redirect parameters
   * @returns Complete redirect URL
   */
  static buildRedirectUrl(baseUrl: string, params: RedirectParams): string {
    const url = new URL(baseUrl);
    url.searchParams.append('transaction_id', params.transaction_id);
    url.searchParams.append('status', params.status);
    return url.toString();
  }
  
  /**
   * Determine which redirect URL to use based on status
   * @param status Payment status
   * @param urls Object containing success, fail, and cancel URLs
   * @returns Appropriate redirect URL
   */
  static getRedirectUrlByStatus(
    status: PaymentStatus,
    urls: {
      success_url: string;
      fail_url: string;
      cancel_url: string;
    }
  ): string {
    switch (status) {
      case 'SUCCESS':
        return urls.success_url;
      case 'FAILED':
        return urls.fail_url;
      case 'CANCELLED':
        return urls.cancel_url;
      default:
        return urls.fail_url;
    }
  }
}