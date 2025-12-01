import { MoneybagSdk, CheckoutRequest } from './dist';

// Initialize SDK with sandbox credentials
const moneybag = new MoneybagSdk({
  apiKey: '5b76e627.fX-wMWj4KQ8uPI8mqt-rKgtvyqyte3jQ0UjXxIjbXXs',
  baseUrl: 'https://sandbox.api.moneybag.com.bd/api/v2',
  timeout: 30000,
  retryAttempts: 3
});

async function testCheckout() {
  console.log('🚀 Testing Moneybag SDK with Sandbox API...\n');
  
  try {
    // Prepare checkout request
    const checkoutRequest: CheckoutRequest = {
      order_id: `test_order_${Date.now()}`,
      currency: 'BDT',
      order_amount: '100.00',
      order_description: 'Test order from SDK',
      success_url: 'https://example.com/payment/success',
      cancel_url: 'https://example.com/payment/cancel',
      fail_url: 'https://example.com/payment/fail',
      ipn_url: 'https://example.com/payment/ipn',
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        address: '123 Test Street',
        city: 'Dhaka',
        postcode: '1000',
        country: 'Bangladesh',
        phone: '+8801700000000',
      },
      order_items: [
        {
          sku: 'TEST001',
          product_name: 'Test Product',
          product_category: 'Test',
          quantity: 1,
          unit_price: '100.00',
          vat: '0.00',
          convenience_fee: '0.00',
          discount_amount: '0.00',
          net_amount: '100.00',
        },
      ],
      shipping: {
        name: 'Test Customer',
        address: '123 Test Street',
        city: 'Dhaka',
        postcode: '1000',
        country: 'Bangladesh',
      },
      metadata: {
        source: 'sdk-test',
        test: true,
        timestamp: new Date().toISOString(),
      },
      payment_info: {
        is_recurring: false,
        installments: 0,
        currency_conversion: false,
        allowed_payment_methods: ['card', 'mobile_banking'],
        requires_emi: false,
      },
    };

    console.log('📤 Sending checkout request...');
    console.log('Order ID:', checkoutRequest.order_id);
    console.log('Amount:', checkoutRequest.order_amount, checkoutRequest.currency);
    console.log('Customer:', checkoutRequest.customer.name, '(' + checkoutRequest.customer.email + ')');
    console.log();

    // Create checkout session
    const response = await moneybag.checkout(checkoutRequest);

    console.log('✅ Checkout session created successfully!');
    console.log('=====================================');
    console.log('Session ID:', response.data.session_id);
    console.log('Checkout URL:', response.data.checkout_url);
    console.log('Expires at:', response.data.expires_at);
    console.log('=====================================');
    console.log('\n📱 To complete the payment, visit:');
    console.log(response.data.checkout_url);
    
    // Test verify endpoint with a dummy transaction ID
    console.log('\n📋 Testing verify endpoint...');
    await testVerify();
    
  } catch (error: any) {
    console.error('❌ Error during checkout:', error.message);
    if (error.response) {
      console.error('Response data:', error.response);
    }
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

async function testVerify() {
  try {
    // This will likely fail as we don't have a real transaction ID
    // But it will test the API connection
    const transactionId = 'test_transaction_123';
    console.log(`Attempting to verify transaction: ${transactionId}`);
    
    const verifyResponse = await moneybag.verify(transactionId);
    console.log('Verify response:', verifyResponse);
  } catch (error: any) {
    // Expected to fail with invalid transaction
    if (error.statusCode === 404 || error.statusCode === 400) {
      console.log('✅ Verify endpoint is working (returned expected error for invalid transaction)');
    } else {
      console.error('❌ Unexpected error during verify:', error.message);
    }
  }
}

// Run the test
console.log('================================');
console.log('Moneybag SDK Sandbox Test');
console.log('================================\n');

testCheckout().then(() => {
  console.log('\n✨ Test completed!');
}).catch((error) => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});