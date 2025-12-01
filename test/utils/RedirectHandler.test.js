"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RedirectHandler_1 = require("../../src/utils/RedirectHandler");
describe('RedirectHandler', () => {
    describe('parseRedirectUrl', () => {
        it('should parse full redirect URL with query parameters', () => {
            const url = 'https://example.com/payment/success?transaction_id=txn123&status=SUCCESS';
            const result = RedirectHandler_1.RedirectHandler.parseRedirectUrl(url);
            expect(result).toEqual({
                transaction_id: 'txn123',
                status: 'SUCCESS',
            });
        });
        it('should parse query string only', () => {
            const queryString = 'transaction_id=txn456&status=FAILED';
            const result = RedirectHandler_1.RedirectHandler.parseRedirectUrl(queryString);
            expect(result).toEqual({
                transaction_id: 'txn456',
                status: 'FAILED',
            });
        });
        it('should handle CANCELLED status', () => {
            const url = 'https://example.com/payment/cancel?transaction_id=txn789&status=CANCELLED';
            const result = RedirectHandler_1.RedirectHandler.parseRedirectUrl(url);
            expect(result).toEqual({
                transaction_id: 'txn789',
                status: 'CANCELLED',
            });
        });
        it('should throw error for missing transaction_id', () => {
            const url = 'https://example.com/payment/success?status=SUCCESS';
            expect(() => RedirectHandler_1.RedirectHandler.parseRedirectUrl(url)).toThrow('Invalid redirect URL: missing required parameters');
        });
        it('should throw error for missing status', () => {
            const url = 'https://example.com/payment/success?transaction_id=txn123';
            expect(() => RedirectHandler_1.RedirectHandler.parseRedirectUrl(url)).toThrow('Invalid redirect URL: missing required parameters');
        });
        it('should handle complex transaction IDs', () => {
            const url = 'https://example.com/payment/success?transaction_id=txn691765dba92741829f72de6eacec8a76&status=SUCCESS';
            const result = RedirectHandler_1.RedirectHandler.parseRedirectUrl(url);
            expect(result).toEqual({
                transaction_id: 'txn691765dba92741829f72de6eacec8a76',
                status: 'SUCCESS',
            });
        });
    });
    describe('buildRedirectUrl', () => {
        it('should build redirect URL with SUCCESS status', () => {
            const baseUrl = 'https://example.com/payment/success';
            const params = {
                transaction_id: 'txn123',
                status: 'SUCCESS',
            };
            const result = RedirectHandler_1.RedirectHandler.buildRedirectUrl(baseUrl, params);
            expect(result).toBe('https://example.com/payment/success?transaction_id=txn123&status=SUCCESS');
        });
        it('should build redirect URL with FAILED status', () => {
            const baseUrl = 'https://example.com/payment/fail';
            const params = {
                transaction_id: 'txn456',
                status: 'FAILED',
            };
            const result = RedirectHandler_1.RedirectHandler.buildRedirectUrl(baseUrl, params);
            expect(result).toBe('https://example.com/payment/fail?transaction_id=txn456&status=FAILED');
        });
        it('should build redirect URL with CANCELLED status', () => {
            const baseUrl = 'https://example.com/payment/cancel';
            const params = {
                transaction_id: 'txn789',
                status: 'CANCELLED',
            };
            const result = RedirectHandler_1.RedirectHandler.buildRedirectUrl(baseUrl, params);
            expect(result).toBe('https://example.com/payment/cancel?transaction_id=txn789&status=CANCELLED');
        });
        it('should handle URLs with existing query parameters', () => {
            const baseUrl = 'https://example.com/payment/success?source=web';
            const params = {
                transaction_id: 'txn123',
                status: 'SUCCESS',
            };
            const result = RedirectHandler_1.RedirectHandler.buildRedirectUrl(baseUrl, params);
            expect(result).toBe('https://example.com/payment/success?source=web&transaction_id=txn123&status=SUCCESS');
        });
    });
    describe('getRedirectUrlByStatus', () => {
        const urls = {
            success_url: 'https://example.com/success',
            fail_url: 'https://example.com/fail',
            cancel_url: 'https://example.com/cancel',
        };
        it('should return success URL for SUCCESS status', () => {
            const result = RedirectHandler_1.RedirectHandler.getRedirectUrlByStatus('SUCCESS', urls);
            expect(result).toBe('https://example.com/success');
        });
        it('should return fail URL for FAILED status', () => {
            const result = RedirectHandler_1.RedirectHandler.getRedirectUrlByStatus('FAILED', urls);
            expect(result).toBe('https://example.com/fail');
        });
        it('should return cancel URL for CANCELLED status', () => {
            const result = RedirectHandler_1.RedirectHandler.getRedirectUrlByStatus('CANCELLED', urls);
            expect(result).toBe('https://example.com/cancel');
        });
        it('should return fail URL for PENDING status', () => {
            const result = RedirectHandler_1.RedirectHandler.getRedirectUrlByStatus('PENDING', urls);
            expect(result).toBe('https://example.com/fail');
        });
        it('should return fail URL for unknown status', () => {
            const result = RedirectHandler_1.RedirectHandler.getRedirectUrlByStatus('UNKNOWN', urls);
            expect(result).toBe('https://example.com/fail');
        });
    });
});
//# sourceMappingURL=RedirectHandler.test.js.map