import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Configuration } from '../config/Configuration';
import { ApiException, NetworkException } from '../exceptions/MoneybagException';

export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly config: Configuration;

  constructor(configuration: Configuration) {
    this.config = configuration;
    this.axiosInstance = axios.create({
      baseURL: configuration.getBaseUrl(),
      timeout: configuration.getTimeout(),
      headers: configuration.getHeaders(),
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Log request if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (this.shouldRetry(error) && error.config.__retryCount < this.config.getRetryAttempts()) {
          error.config.__retryCount = (error.config.__retryCount || 0) + 1;
          await this.delay(this.getRetryDelay(error.config.__retryCount));
          return this.axiosInstance(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      // Network error
      return true;
    }
    
    // Retry on 5xx errors or specific 4xx errors
    const status = error.response.status;
    return status >= 500 || status === 429 || status === 408;
  }

  private getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(path, config);
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(path, data, config);
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(path, data, config);
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(path, config);
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private mapResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        return new ApiException(
          error.response.data?.message || `API error: ${error.response.status}`,
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // Request was made but no response
        return new NetworkException(
          'Network error: No response from server',
          error.code
        );
      }
    }
    
    // Something else happened
    return new NetworkException('An unexpected error occurred');
  }
}