# Moneybag Node.js SDK

Official Node.js SDK for Moneybag Payment Gateway

[![npm version](https://img.shields.io/npm/v/@moneybag/sdk.svg)](https://www.npmjs.com/package/@moneybag/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Installation

```bash
npm install @moneybag/sdk
```

## Quick Start

```javascript
const { MoneybagSdk } = require('@moneybag/sdk');
// or
import { MoneybagSdk } from '@moneybag/sdk';

// Initialize the SDK
const moneybag = new MoneybagSdk({
  apiKey: 'your-merchant-api-key',
  baseUrl: 'https://sandbox.api.moneybag.com.bd/api/v2'  // Use sandbox for testing
});
```

## Configuration

The SDK requires the following configuration:

- `apiKey` (required): Your merchant API key
- `baseUrl` (required): The API base URL
  - Sandbox: `https://sandbox.api.moneybag.com.bd/api/v2`
  - Production: `https://api.moneybag.com.bd/api/v2`
- `timeout` (optional): Request timeout in milliseconds (default: 30000)
- `retryAttempts` (optional): Number of retry attempts for failed requests (default: 3)

## Features

- Full TypeScript support with type definitions
- Automatic request retry with exponential backoff
- Comprehensive error handling
- Built-in request/response validation
- Redirect URL parsing utilities
- Promise-based API

## Usage

### Checkout

Create a payment checkout session:

```javascript
const checkoutRequest = {
  order_id: 'order123',
  currency: 'BDT',
  order_amount: '100.00',
  order_description: 'Purchase from my store',
  success_url: 'https://yourdomain.com/payment/success',
  cancel_url: 'https://yourdomain.com/payment/cancel',
  fail_url: 'https://yourdomain.com/payment/fail',
  ipn_url: 'https://yourdomain.com/payment/ipn',  // Optional IPN URL
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main Street',
    city: 'Dhaka',
    postcode: '1000',
    country: 'Bangladesh',
    phone: '+8801700000000'
  },
  // Optional fields
  order_items: [
    {
      product_name: 'Product 1',
      quantity: 1,
      unit_price: '100.00'
    }
  ],
  shipping: {
    name: 'John Doe',
    address: '123 Main Street',
    city: 'Dhaka',
    postcode: '1000',
    country: 'Bangladesh'
  },
  payment_info: {
    allowed_payment_methods: ['card', 'mobile_banking'],
    is_recurring: false,
    requires_emi: false
  }
};

try {
  const response = await moneybag.checkout(checkoutRequest);
  console.log('Checkout URL:', response.data.checkout_url);
  // Redirect customer to response.data.checkout_url
} catch (error) {
  console.error('Checkout failed:', error);
}
```

### Verify Payment

Verify a payment transaction:

```javascript
try {
  const response = await moneybag.verify('transaction_id_here');
  
  if (response.data.verified && response.data.status === 'SUCCESS') {
    console.log('Payment verified successfully');
    // Update order status in your database
  }
} catch (error) {
  console.error('Verification failed:', error);
}
```

### Handle Redirect URLs

Parse and handle redirect URLs from Moneybag:

```javascript
import { RedirectHandler } from '@moneybag/sdk';

// In your success/fail/cancel callback handler
app.get('/payment/success', async (req, res) => {
  try {
    // Parse redirect parameters
    const params = RedirectHandler.parseRedirectUrl(req.url);
    // params = { transaction_id: 'txn123...', status: 'SUCCESS' }
    
    // Verify the payment
    const verification = await moneybag.verify(params.transaction_id);
    
    if (verification.data.verified && params.status === 'SUCCESS') {
      // Payment successful
    }
  } catch (error) {
    console.error('Error handling redirect:', error);
  }
});
```

## Error Handling

The SDK throws typed exceptions for different error scenarios:

```javascript
import { 
  ValidationException, 
  ApiException, 
  NetworkException 
} from '@moneybag/sdk';

try {
  await moneybag.checkout(request);
} catch (error) {
  if (error instanceof ValidationException) {
    // Handle validation errors
    console.error('Invalid request:', error.message);
  } else if (error instanceof ApiException) {
    // Handle API errors
    console.error('API error:', error.statusCode, error.message);
  } else if (error instanceof NetworkException) {
    // Handle network errors
    console.error('Network error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { 
  MoneybagSdk, 
  CheckoutRequest, 
  CheckoutResponse,
  VerifyResponse 
} from '@moneybag/sdk';

const sdk = new MoneybagSdk({
  apiKey: 'your-api-key',
  baseUrl: 'https://sandbox.api.moneybag.com.bd/api/v2'
});

// All types are fully typed
const request: CheckoutRequest = {
  // ... your checkout data
};

const response: CheckoutResponse = await sdk.checkout(request);
```

## API Reference

### MoneybagSdk

#### Constructor

```typescript
new MoneybagSdk(options: ConfigurationOptions)
```

#### Methods

##### checkout(request: CheckoutRequest): Promise<CheckoutResponse>

Creates a payment checkout session.

**Parameters:**
- `request`: CheckoutRequest object containing order and customer details

**Returns:**
- `CheckoutResponse` with `checkout_url`, `session_id`, and `expires_at`

##### verify(transactionId: string): Promise<VerifyResponse>

Verifies a payment transaction.

**Parameters:**
- `transactionId`: The unique transaction ID from Moneybag

**Returns:**
- `VerifyResponse` with payment details and verification status

### Utility Classes

#### RedirectHandler

Utility for handling redirect URLs from Moneybag.

**Methods:**
- `parseRedirectUrl(url: string)`: Parse redirect URL parameters
- `buildRedirectUrl(baseUrl: string, params: RedirectParams)`: Build redirect URL
- `getRedirectUrlByStatus(status: PaymentStatus, urls: object)`: Get appropriate redirect URL

## Constants

The SDK exports useful constants:

```javascript
import { PAYMENT_STATUS, PAYMENT_METHODS, CURRENCY_CODES } from '@moneybag/sdk';

// Payment statuses
PAYMENT_STATUS.SUCCESS    // 'SUCCESS'
PAYMENT_STATUS.FAILED     // 'FAILED'
PAYMENT_STATUS.PENDING    // 'PENDING'
PAYMENT_STATUS.CANCELLED  // 'CANCELLED'

// Payment methods
PAYMENT_METHODS.CARD           // 'card'
PAYMENT_METHODS.MOBILE_BANKING // 'mobile_banking'

// Currency codes
CURRENCY_CODES.BDT // 'BDT'
CURRENCY_CODES.USD // 'USD'
```

## Examples

See the `examples` directory for more detailed examples:

- `checkout.ts` - Basic checkout example
- `verify.ts` - Payment verification example
- `express-integration.ts` - Express.js integration example

## Testing

Run the test suite:

```bash
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Development

```bash
npm install   # Install dependencies
npm run build # Build the SDK
npm run lint  # Run linting
npm test      # Run tests
```

## Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0

## Support

For support, please contact Moneybag support or create an issue on GitHub.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This SDK is licensed under the MIT License. See [LICENSE](LICENSE) for details.
