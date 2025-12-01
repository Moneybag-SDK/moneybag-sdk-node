import axios from 'axios';
import { HttpClient } from '../../src/http/HttpClient';
import { Configuration } from '../../src/config/Configuration';
import { ApiException, NetworkException } from '../../src/exceptions/MoneybagException';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let config: Configuration;

  beforeEach(() => {
    config = new Configuration({
      apiKey: 'test-api-key',
      baseUrl: 'https://sandbox.api.moneybag.com.bd/api/v2',
      timeout: 5000,
      retryAttempts: 2,
    });
    
    mockedAxios.create.mockReturnThis();
    mockedAxios.interceptors = {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    } as any;
    
    httpClient = new HttpClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
        headers: { 'content-type': 'application/json' },
      };
      
      mockedAxios.get = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await httpClient.get('/test');
      
      expect(result).toEqual({
        status: 200,
        data: { success: true },
        headers: { 'content-type': 'application/json' },
      });
    });

    it('should handle API errors', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
        isAxiosError: true,
      });
      
      mockedAxios.isAxiosError = jest.fn(() => true) as any;
      
      await expect(httpClient.get('/test')).rejects.toThrow(ApiException);
    });

    it('should handle network errors', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue({
        request: {},
        code: 'ECONNREFUSED',
        isAxiosError: true,
      });
      
      mockedAxios.isAxiosError = jest.fn(() => true) as any;
      
      await expect(httpClient.get('/test')).rejects.toThrow(NetworkException);
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockResponse = {
        status: 201,
        data: { id: '123', success: true },
        headers: { 'content-type': 'application/json' },
      };
      
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);
      
      const payload = { name: 'Test' };
      const result = await httpClient.post('/test', payload);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/test', payload, undefined);
      expect(result.status).toBe(201);
      expect(result.data).toEqual({ id: '123', success: true });
    });

    it('should handle 500 errors', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
        isAxiosError: true,
      });
      
      mockedAxios.isAxiosError = jest.fn(() => true) as any;
      
      await expect(httpClient.post('/test', {})).rejects.toThrow(ApiException);
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const mockResponse = {
        status: 200,
        data: { updated: true },
        headers: { 'content-type': 'application/json' },
      };
      
      mockedAxios.put = jest.fn().mockResolvedValue(mockResponse);
      
      const payload = { name: 'Updated' };
      const result = await httpClient.put('/test/123', payload);
      
      expect(mockedAxios.put).toHaveBeenCalledWith('/test/123', payload, undefined);
      expect(result.data).toEqual({ updated: true });
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const mockResponse = {
        status: 204,
        data: null,
        headers: {},
      };
      
      mockedAxios.delete = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await httpClient.delete('/test/123');
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/test/123', undefined);
      expect(result.status).toBe(204);
    });
  });
});