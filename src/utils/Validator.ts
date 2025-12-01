import { CheckoutRequest } from '../models/CheckoutRequest';
import { ValidationException } from '../exceptions/MoneybagException';

export class Validator {
  static validateCheckoutRequest(request: CheckoutRequest): void {
    const errors: string[] = [];

    // Required fields
    if (!request.order_id) {
      errors.push('order_id is required');
    } else if (request.order_id.length > 30) {
      errors.push('order_id must not exceed 30 characters');
    }

    if (!request.currency) {
      errors.push('currency is required');
    } else if (!/^[A-Z]{3}$/.test(request.currency)) {
      errors.push('currency must be a 3-letter uppercase code (e.g., BDT, USD)');
    }

    if (!request.order_amount) {
      errors.push('order_amount is required');
    } else {
      const amount = parseFloat(request.order_amount);
      if (isNaN(amount) || amount < 10 || amount > 500000) {
        errors.push('order_amount must be between 10.00 and 500000.00');
      }
      if (!/^\d+(\.\d{1,2})?$/.test(request.order_amount)) {
        errors.push('order_amount must have at most 2 decimal places');
      }
    }

    // URL validations
    const urlFields = ['success_url', 'cancel_url', 'fail_url'];
    urlFields.forEach(field => {
      const url = request[field as keyof CheckoutRequest] as string;
      if (!url) {
        errors.push(`${field} is required`);
      } else if (!this.isValidUrl(url)) {
        errors.push(`${field} must be a valid URL starting with http:// or https://`);
      } else if (url.length > 255) {
        errors.push(`${field} must not exceed 255 characters`);
      }
    });

    if (request.ipn_url && !this.isValidUrl(request.ipn_url)) {
      errors.push('ipn_url must be a valid URL starting with http:// or https://');
    }

    // Customer validation
    if (!request.customer) {
      errors.push('customer is required');
    } else {
      const customerErrors = this.validateCustomer(request.customer as unknown as Record<string, unknown>);
      errors.push(...customerErrors);
    }

    // Payment info validation
    if (request.payment_info) {
      if (!request.payment_info.allowed_payment_methods || request.payment_info.allowed_payment_methods.length === 0) {
        errors.push('payment_info.allowed_payment_methods must contain at least one payment method');
      }
    }

    if (errors.length > 0) {
      throw new ValidationException(`Validation failed: ${errors.join(', ')}`);
    }
  }

  private static validateCustomer(customer: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const requiredFields = ['name', 'email', 'address', 'city', 'postcode', 'country', 'phone'];

    requiredFields.forEach(field => {
      if (!customer[field]) {
        errors.push(`customer.${field} is required`);
      }
    });

    if (customer.email && typeof customer.email === 'string' && !this.isValidEmail(customer.email)) {
      errors.push('customer.email must be a valid email address');
    }

    if (customer.phone && typeof customer.phone === 'string' && !this.isValidPhone(customer.phone)) {
      errors.push('customer.phone must be a valid phone number');
    }

    return errors;
  }

  static validateTransactionId(transactionId: string): void {
    if (!transactionId || transactionId.trim() === '') {
      throw new ValidationException('Transaction ID is required');
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
}