export interface ConfigurationOptions {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

export class Configuration {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;

  constructor(options: ConfigurationOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    if (!options.baseUrl) {
      throw new Error('Base URL is required');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.retryAttempts = options.retryAttempts || 3;
  }

  getHeaders(): Record<string, string> {
    return {
      'X-Merchant-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getTimeout(): number {
    return this.timeout;
  }

  getRetryAttempts(): number {
    return this.retryAttempts;
  }
}