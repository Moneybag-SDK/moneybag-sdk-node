import { Configuration, ConfigurationOptions } from './config/Configuration';
import { HttpClient } from './http/HttpClient';
import { CheckoutRequest } from './models/CheckoutRequest';
import { CheckoutResponse } from './models/CheckoutResponse';
import { VerifyResponse } from './models/VerifyResponse';
import { Validator } from './utils/Validator';
import { MoneybagException } from './exceptions/MoneybagException';

export class MoneybagSdk {
  private readonly config: Configuration;
  private readonly httpClient: HttpClient;

  constructor(options: ConfigurationOptions) {
    this.config = new Configuration(options);
    this.httpClient = new HttpClient(this.config);
  }

  /**
   * Initiate a payment checkout session
   * @param request Checkout request containing order and customer details
   * @returns CheckoutResponse with checkout URL and session details
   * @throws ValidationException if request validation fails
   * @throws ApiException if API request fails
   * @throws NetworkException if network error occurs
   */
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    // Validate request
    Validator.validateCheckoutRequest(request);

    // Make API call
    const response = await this.httpClient.post<CheckoutResponse>(
      '/payments/checkout',
      request
    );

    // Validate response
    if (!response.data.success) {
      throw new MoneybagException(
        response.data.message || 'Checkout request failed'
      );
    }

    return response.data;
  }

  /**
   * Verify a payment transaction
   * @param transactionId The unique transaction ID received from Moneybag
   * @returns VerifyResponse with payment verification details
   * @throws ValidationException if transaction ID is invalid
   * @throws ApiException if API request fails
   * @throws NetworkException if network error occurs
   */
  async verify(transactionId: string): Promise<VerifyResponse> {
    // Validate transaction ID
    Validator.validateTransactionId(transactionId);

    // Make API call
    const response = await this.httpClient.get<VerifyResponse>(
      `/payments/verify/${transactionId}`
    );

    // Validate response
    if (!response.data.success) {
      throw new MoneybagException(
        response.data.message || 'Verification request failed'
      );
    }

    return response.data;
  }

  /**
   * Get the current configuration
   * @returns Configuration object
   */
  getConfiguration(): Configuration {
    return this.config;
  }
}