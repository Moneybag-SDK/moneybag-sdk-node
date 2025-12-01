"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MoneybagSdk_1 = require("../src/MoneybagSdk");
const MoneybagException_1 = require("../src/exceptions/MoneybagException");
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('MoneybagSdk', () => {
    let sdk;
    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.create.mockReturnValue({
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
        });
        sdk = new MoneybagSdk_1.MoneybagSdk({
            apiKey: 'test-api-key',
            baseUrl: 'https://staging-api.moneybag.com.bd/api/v2',
        });
    });
    describe('constructor', () => {
        it('should throw error if API key is not provided', () => {
            expect(() => {
                new MoneybagSdk_1.MoneybagSdk({ apiKey: '', baseUrl: 'https://test.com' });
            }).toThrow('API key is required');
        });
        it('should throw error if base URL is not provided', () => {
            expect(() => {
                new MoneybagSdk_1.MoneybagSdk({ apiKey: 'test-key', baseUrl: '' });
            }).toThrow('Base URL is required');
        });
    });
    describe('checkout', () => {
        const validCheckoutRequest = {
            order_id: 'order123',
            currency: 'BDT',
            order_amount: '100.00',
            order_description: 'Test order',
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
        it('should successfully create checkout session', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        checkout_url: 'https://payment.moneybag.com.bd/checkout/session123',
                        session_id: 'session123',
                        expires_at: '2025-12-31T23:59:59Z',
                    },
                    message: 'Checkout session created',
                },
                status: 200,
                headers: {},
            };
            const axiosInstance = mockedAxios.create();
            axiosInstance.post.mockResolvedValue(mockResponse);
            const result = await sdk.checkout(validCheckoutRequest);
            expect(result).toEqual(mockResponse.data);
            expect(axiosInstance.post).toHaveBeenCalledWith('/payments/checkout', validCheckoutRequest, undefined);
        });
        it('should throw validation error for invalid order_id', async () => {
            const invalidRequest = {
                ...validCheckoutRequest,
                order_id: '',
            };
            await expect(sdk.checkout(invalidRequest)).rejects.toThrow(MoneybagException_1.ValidationException);
        });
        it('should throw validation error for invalid currency', async () => {
            const invalidRequest = {
                ...validCheckoutRequest,
                currency: 'BD',
            };
            await expect(sdk.checkout(invalidRequest)).rejects.toThrow('currency must be a 3-letter uppercase code');
        });
        it('should throw validation error for invalid order amount', async () => {
            const invalidRequest = {
                ...validCheckoutRequest,
                order_amount: '5.00',
            };
            await expect(sdk.checkout(invalidRequest)).rejects.toThrow('order_amount must be between 10.00 and 500000.00');
        });
        it('should throw validation error for invalid URLs', async () => {
            const invalidRequest = {
                ...validCheckoutRequest,
                success_url: 'not-a-url',
            };
            await expect(sdk.checkout(invalidRequest)).rejects.toThrow('success_url must be a valid URL');
        });
    });
    describe('verify', () => {
        it('should successfully verify payment', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        transaction_id: 'txn123',
                        order_id: 'order123',
                        verified: true,
                        status: 'SUCCESS',
                        amount: '100.00',
                        currency: 'BDT',
                        payment_method: 'card',
                        payment_reference_id: 'ref123',
                        customer: {
                            name: 'John Doe',
                            email: 'john@example.com',
                            address: '123 Main St',
                            city: 'Dhaka',
                            postcode: '1000',
                            country: 'Bangladesh',
                            phone: '+8801700000000',
                        },
                    },
                    message: 'Payment verification successful',
                },
                status: 200,
                headers: {},
            };
            const axiosInstance = mockedAxios.create();
            axiosInstance.get.mockResolvedValue(mockResponse);
            const result = await sdk.verify('txn123');
            expect(result).toEqual(mockResponse.data);
            expect(axiosInstance.get).toHaveBeenCalledWith('/payments/verify/txn123', undefined);
        });
        it('should throw validation error for empty transaction ID', async () => {
            await expect(sdk.verify('')).rejects.toThrow('Transaction ID is required');
        });
        it('should throw validation error for whitespace transaction ID', async () => {
            await expect(sdk.verify('   ')).rejects.toThrow('Transaction ID is required');
        });
    });
});
//# sourceMappingURL=MoneybagSdk.test.js.map