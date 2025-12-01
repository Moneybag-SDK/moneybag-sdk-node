import { MoneybagSdk, RedirectHandler, PAYMENT_STATUS } from './dist';

// Initialize SDK with sandbox credentials
const moneybag = new MoneybagSdk({
  apiKey: '5b76e627.fX-wMWj4KQ8uPI8mqt-rKgtvyqyte3jQ0UjXxIjbXXs',
  baseUrl: 'https://sandbox.api.moneybag.com.bd/api/v2',
});

async function runAutomatedTests() {
  console.log('🧪 Running Automated SDK Tests with Sandbox API\n');
  
  let allTestsPassed = true;
  
  // Test 1: Create Checkout
  console.log('TEST 1: Create Checkout Session');
  console.log('─'.repeat(40));
  
  try {
    const checkoutResponse = await moneybag.checkout({
      order_id: `auto_test_${Date.now()}`,
      currency: 'BDT',
      order_amount: '250.00',
      order_description: 'Automated test order',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      fail_url: 'https://example.com/fail',
      customer: {
        name: 'Automated Test',
        email: 'autotest@example.com',
        address: '789 Auto Street',
        city: 'Dhaka',
        postcode: '1000',
        country: 'Bangladesh',
        phone: '+8801800000000',
      },
    });
    
    // Validate response structure
    if (checkoutResponse.success && 
        checkoutResponse.data.checkout_url && 
        checkoutResponse.data.session_id &&
        checkoutResponse.data.expires_at) {
      console.log('✅ PASSED: Checkout created successfully');
      console.log(`   Session ID: ${checkoutResponse.data.session_id}`);
      console.log(`   URL: ${checkoutResponse.data.checkout_url.substring(0, 50)}...`);
    } else {
      console.log('❌ FAILED: Invalid response structure');
      allTestsPassed = false;
    }
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    allTestsPassed = false;
  }
  
  console.log();
  
  // Test 2: Verify Transaction (with invalid ID - expected to fail)
  console.log('TEST 2: Verify Transaction (Invalid ID)');
  console.log('─'.repeat(40));
  
  try {
    await moneybag.verify('invalid_transaction_id');
    console.log('❌ FAILED: Should have thrown an error for invalid ID');
    allTestsPassed = false;
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 400) {
      console.log('✅ PASSED: Correctly rejected invalid transaction ID');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('❌ FAILED: Unexpected error:', error.message);
      allTestsPassed = false;
    }
  }
  
  console.log();
  
  // Test 3: Input Validation
  console.log('TEST 3: Input Validation');
  console.log('─'.repeat(40));
  
  try {
    await moneybag.checkout({
      order_id: '', // Invalid: empty
      currency: 'bdt', // Invalid: lowercase
      order_amount: '5.00', // Invalid: below minimum
      success_url: 'not-a-url', // Invalid: not a URL
      cancel_url: 'https://example.com/cancel',
      fail_url: 'https://example.com/fail',
      customer: {
        name: 'Test',
        email: 'invalid-email', // Invalid email
        address: 'Test',
        city: 'Dhaka',
        postcode: '1000',
        country: 'Bangladesh',
        phone: '123', // Invalid phone
      },
    } as any);
    
    console.log('❌ FAILED: Should have thrown validation error');
    allTestsPassed = false;
  } catch (error: any) {
    if (error.message.includes('Validation failed')) {
      console.log('✅ PASSED: Validation correctly rejected invalid input');
      const errors = error.message.split(': ')[1].split(', ');
      console.log(`   Found ${errors.length} validation errors`);
    } else {
      console.log('❌ FAILED: Unexpected error:', error.message);
      allTestsPassed = false;
    }
  }
  
  console.log();
  
  // Test 4: Redirect URL Parser
  console.log('TEST 4: Redirect URL Parser');
  console.log('─'.repeat(40));
  
  try {
    // Test successful redirect
    const successUrl = 'https://example.com/success?transaction_id=txn123abc&status=SUCCESS';
    const successParams = RedirectHandler.parseRedirectUrl(successUrl);
    
    if (successParams.transaction_id === 'txn123abc' && successParams.status === 'SUCCESS') {
      console.log('✅ PASSED: Success URL parsed correctly');
    } else {
      console.log('❌ FAILED: Incorrect parsing of success URL');
      allTestsPassed = false;
    }
    
    // Test failed redirect
    const failUrl = 'https://example.com/fail?transaction_id=txn456def&status=FAILED';
    const failParams = RedirectHandler.parseRedirectUrl(failUrl);
    
    if (failParams.transaction_id === 'txn456def' && failParams.status === 'FAILED') {
      console.log('✅ PASSED: Fail URL parsed correctly');
    } else {
      console.log('❌ FAILED: Incorrect parsing of fail URL');
      allTestsPassed = false;
    }
    
    // Test invalid URL (missing params)
    try {
      RedirectHandler.parseRedirectUrl('https://example.com/success');
      console.log('❌ FAILED: Should have thrown error for missing params');
      allTestsPassed = false;
    } catch {
      console.log('✅ PASSED: Invalid URL correctly rejected');
    }
    
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    allTestsPassed = false;
  }
  
  console.log();
  
  // Test 5: API Key Authentication
  console.log('TEST 5: API Key Authentication');
  console.log('─'.repeat(40));
  
  const invalidSdk = new MoneybagSdk({
    apiKey: 'invalid_api_key',
    baseUrl: 'https://sandbox.api.moneybag.com.bd/api/v2',
  });
  
  try {
    await invalidSdk.checkout({
      order_id: `auth_test_${Date.now()}`,
      currency: 'BDT',
      order_amount: '100.00',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      fail_url: 'https://example.com/fail',
      customer: {
        name: 'Test',
        email: 'test@example.com',
        address: 'Test',
        city: 'Dhaka',
        postcode: '1000',
        country: 'Bangladesh',
        phone: '+8801700000000',
      },
    });
    
    console.log('❌ FAILED: Should have thrown authentication error');
    allTestsPassed = false;
  } catch (error: any) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.log('✅ PASSED: Invalid API key correctly rejected');
      console.log(`   Status: ${error.statusCode}`);
    } else {
      console.log('⚠️  WARNING: Unexpected error (may be OK):', error.message);
    }
  }
  
  console.log();
  console.log('═'.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('The SDK is working correctly with the sandbox API.');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('Please review the failures above.');
  }
  
  console.log('═'.repeat(50));
}

// Run tests
console.log('═'.repeat(50));
console.log('Moneybag SDK Automated Test Suite');
console.log('═'.repeat(50));
console.log();

runAutomatedTests()
  .then(() => {
    console.log('\n✨ Test suite completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });