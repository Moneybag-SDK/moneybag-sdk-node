import { Validator } from '../../src/utils/Validator';
import { CheckoutRequest } from '../../src/models/CheckoutRequest';

describe('Validator', () => {
  describe('validateCheckoutRequest', () => {
    const validRequest: CheckoutRequest = {
      order_id: 'order123',
      currency: 'BDT',
      order_amount: '100.00',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      fail_url: 'https://example.com/fail',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Dhaka',
        postcode: '1000',
        country: 'Bangladesh',
        phone: '+8801700000000',
      },
    };

    it('should pass validation for valid request', () => {
      expect(() => Validator.validateCheckoutRequest(validRequest)).not.toThrow();
    });

    it('should fail validation for missing order_id', () => {
      const request = { ...validRequest, order_id: '' };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'order_id is required'
      );
    });

    it('should fail validation for order_id exceeding 30 characters', () => {
      const request = { ...validRequest, order_id: 'a'.repeat(31) };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'order_id must not exceed 30 characters'
      );
    });

    it('should fail validation for invalid currency format', () => {
      const request = { ...validRequest, currency: 'usd' };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'currency must be a 3-letter uppercase code'
      );
    });

    it('should fail validation for order amount below minimum', () => {
      const request = { ...validRequest, order_amount: '5.00' };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'order_amount must be between 10.00 and 500000.00'
      );
    });

    it('should fail validation for order amount above maximum', () => {
      const request = { ...validRequest, order_amount: '600000.00' };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'order_amount must be between 10.00 and 500000.00'
      );
    });

    it('should fail validation for order amount with more than 2 decimal places', () => {
      const request = { ...validRequest, order_amount: '100.123' };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'order_amount must have at most 2 decimal places'
      );
    });

    it('should fail validation for invalid URL format', () => {
      const request = { ...validRequest, success_url: 'not-a-url' };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'success_url must be a valid URL'
      );
    });

    it('should fail validation for URL exceeding 255 characters', () => {
      const request = { ...validRequest, success_url: 'https://example.com/' + 'a'.repeat(250) };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'success_url must not exceed 255 characters'
      );
    });

    it('should fail validation for invalid customer email', () => {
      const request = {
        ...validRequest,
        customer: { ...validRequest.customer, email: 'invalid-email' },
      };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'customer.email must be a valid email address'
      );
    });

    it('should fail validation for invalid customer phone', () => {
      const request = {
        ...validRequest,
        customer: { ...validRequest.customer, phone: '123' },
      };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'customer.phone must be a valid phone number'
      );
    });

    it('should validate optional ipn_url when provided', () => {
      const request = { ...validRequest, ipn_url: 'not-a-url' };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'ipn_url must be a valid URL'
      );
    });

    it('should validate payment_info when provided', () => {
      const request = {
        ...validRequest,
        payment_info: {
          allowed_payment_methods: [],
        },
      };
      expect(() => Validator.validateCheckoutRequest(request)).toThrow(
        'payment_info.allowed_payment_methods must contain at least one payment method'
      );
    });
  });

  describe('validateTransactionId', () => {
    it('should pass validation for valid transaction ID', () => {
      expect(() => Validator.validateTransactionId('txn123')).not.toThrow();
    });

    it('should fail validation for empty transaction ID', () => {
      expect(() => Validator.validateTransactionId('')).toThrow(
        'Transaction ID is required'
      );
    });

    it('should fail validation for whitespace transaction ID', () => {
      expect(() => Validator.validateTransactionId('   ')).toThrow(
        'Transaction ID is required'
      );
    });
  });
});