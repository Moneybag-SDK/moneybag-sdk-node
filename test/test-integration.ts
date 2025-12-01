#!/usr/bin/env node
import { MoneybagSdk, RedirectHandler, PAYMENT_STATUS, CURRENCY_CODES } from './dist';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Initialize SDK with sandbox credentials
const moneybag = new MoneybagSdk({
  apiKey: '5b76e627.fX-wMWj4KQ8uPI8mqt-rKgtvyqyte3jQ0UjXxIjbXXs',
  baseUrl: 'https://sandbox.api.moneybag.com.bd/api/v2',
  timeout: 30000,
  retryAttempts: 3
});

async function runInteractiveTest() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     Moneybag SDK Interactive Sandbox Test           ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  console.log('Select an option:');
  console.log('1. Create a checkout session');
  console.log('2. Verify a transaction');
  console.log('3. Parse redirect URL');
  console.log('4. Run full payment flow simulation');
  console.log('5. Exit\n');

  const choice = await question('Enter your choice (1-5): ');

  switch (choice) {
    case '1':
      await createCheckout();
      break;
    case '2':
      await verifyTransaction();
      break;
    case '3':
      await parseRedirect();
      break;
    case '4':
      await fullFlowSimulation();
      break;
    case '5':
      console.log('\nGoodbye! 👋');
      rl.close();
      return;
    default:
      console.log('\n❌ Invalid choice. Please try again.\n');
  }

  // Ask if user wants to continue
  const continueTest = await question('\nDo you want to run another test? (y/n): ');
  if (continueTest.toLowerCase() === 'y') {
    console.log('\n');
    await runInteractiveTest();
  } else {
    console.log('\nThank you for testing! 👋');
    rl.close();
  }
}

async function createCheckout() {
  console.log('\n📝 Creating Checkout Session...\n');

  const amount = await question('Enter amount (BDT): ');
  const customerName = await question('Customer name: ');
  const customerEmail = await question('Customer email: ');
  const customerPhone = await question('Customer phone (e.g., +8801700000000): ');

  try {
    const response = await moneybag.checkout({
      order_id: `order_${Date.now()}`,
      currency: CURRENCY_CODES.BDT,
      order_amount: amount || '100.00',
      order_description: 'Interactive test order',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      fail_url: 'https://example.com/fail',
      customer: {
        name: customerName || 'Test Customer',
        email: customerEmail || 'test@example.com',
        address: '123 Test Street',
        city: 'Dhaka',
        postcode: '1000',
        country: 'Bangladesh',
        phone: customerPhone || '+8801700000000',
      },
      payment_info: {
        allowed_payment_methods: ['card', 'mobile_banking'],
        is_recurring: false,
        requires_emi: false,
      },
    });

    console.log('\n✅ SUCCESS! Checkout session created:');
    console.log('════════════════════════════════════════');
    console.log(`Session ID: ${response.data.session_id}`);
    console.log(`Expires at: ${response.data.expires_at}`);
    console.log('────────────────────────────────────────');
    console.log('🔗 Checkout URL:');
    console.log(response.data.checkout_url);
    console.log('════════════════════════════════════════');
    
    console.log('\n💡 Copy the URL above and open it in your browser to complete the payment.');
    console.log('   After payment, you can verify the transaction using option 2.');

  } catch (error: any) {
    console.error('\n❌ Error creating checkout:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response, null, 2));
    }
  }
}

async function verifyTransaction() {
  console.log('\n🔍 Verify Transaction\n');
  
  const transactionId = await question('Enter transaction ID: ');
  
  if (!transactionId) {
    console.log('❌ Transaction ID is required');
    return;
  }

  try {
    console.log('\n🔄 Verifying transaction...');
    const response = await moneybag.verify(transactionId);

    console.log('\n✅ Transaction Details:');
    console.log('════════════════════════════════════════');
    console.log(`Transaction ID: ${response.data.transaction_id}`);
    console.log(`Order ID: ${response.data.order_id}`);
    console.log(`Status: ${response.data.status}`);
    console.log(`Verified: ${response.data.verified ? '✅ Yes' : '❌ No'}`);
    console.log(`Amount: ${response.data.currency} ${response.data.amount}`);
    console.log(`Payment Method: ${response.data.payment_method}`);
    console.log('────────────────────────────────────────');
    console.log('Customer Info:');
    console.log(`  Name: ${response.data.customer.name}`);
    console.log(`  Email: ${response.data.customer.email}`);
    console.log(`  Phone: ${response.data.customer.phone}`);
    console.log('════════════════════════════════════════');

    if (response.data.verified && response.data.status === PAYMENT_STATUS.SUCCESS) {
      console.log('\n🎉 Payment was successful and verified!');
    } else if (response.data.status === PAYMENT_STATUS.FAILED) {
      console.log('\n⚠️ Payment failed');
    } else if (response.data.status === PAYMENT_STATUS.PENDING) {
      console.log('\n⏳ Payment is still pending');
    }

  } catch (error: any) {
    console.error('\n❌ Error verifying transaction:', error.message);
    if (error.statusCode === 404) {
      console.log('   Transaction not found. Please check the ID.');
    }
  }
}

async function parseRedirect() {
  console.log('\n🔗 Parse Redirect URL\n');
  console.log('Enter a redirect URL from Moneybag (e.g., after payment completion)');
  
  const url = await question('URL: ');
  
  if (!url) {
    console.log('❌ URL is required');
    return;
  }

  try {
    const params = RedirectHandler.parseRedirectUrl(url);
    
    console.log('\n✅ Parsed Parameters:');
    console.log('════════════════════════════════════════');
    console.log(`Transaction ID: ${params.transaction_id}`);
    console.log(`Status: ${params.status}`);
    console.log('════════════════════════════════════════');
    
    // Suggest next action
    if (params.status === PAYMENT_STATUS.SUCCESS) {
      console.log('\n💡 Payment appears successful! You should verify it using the transaction ID.');
      const verify = await question('Would you like to verify now? (y/n): ');
      if (verify.toLowerCase() === 'y') {
        try {
          const response = await moneybag.verify(params.transaction_id);
          console.log('\n✅ Verification complete. Status:', response.data.status);
        } catch (error: any) {
          console.error('❌ Verification failed:', error.message);
        }
      }
    } else if (params.status === PAYMENT_STATUS.FAILED) {
      console.log('\n❌ Payment failed. Customer should retry.');
    } else if (params.status === PAYMENT_STATUS.CANCELLED) {
      console.log('\n⚠️ Payment was cancelled by the user.');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error parsing URL:', error.message);
    console.log('   Make sure the URL contains transaction_id and status parameters.');
  }
}

async function fullFlowSimulation() {
  console.log('\n🔄 Full Payment Flow Simulation\n');
  console.log('This will create a checkout and guide you through the complete flow.\n');

  // Step 1: Create checkout
  console.log('STEP 1: Creating checkout session...');
  
  const orderId = `demo_${Date.now()}`;
  const amount = '150.00';
  
  try {
    const checkoutResponse = await moneybag.checkout({
      order_id: orderId,
      currency: CURRENCY_CODES.BDT,
      order_amount: amount,
      order_description: 'Demo order for full flow test',
      success_url: `https://example.com/success?order=${orderId}`,
      cancel_url: `https://example.com/cancel?order=${orderId}`,
      fail_url: `https://example.com/fail?order=${orderId}`,
      customer: {
        name: 'Demo Customer',
        email: 'demo@example.com',
        address: '456 Demo Street',
        city: 'Dhaka',
        postcode: '1200',
        country: 'Bangladesh',
        phone: '+8801900000000',
      },
      order_items: [
        {
          product_name: 'Demo Product',
          quantity: 1,
          unit_price: amount,
        },
      ],
      payment_info: {
        allowed_payment_methods: ['card', 'mobile_banking'],
        is_recurring: false,
        requires_emi: false,
      },
    });

    console.log('✅ Checkout created successfully!\n');
    console.log('════════════════════════════════════════════════════════');
    console.log(`Order ID: ${orderId}`);
    console.log(`Amount: BDT ${amount}`);
    console.log(`Session ID: ${checkoutResponse.data.session_id}`);
    console.log('────────────────────────────────────────────────────────');
    console.log('🔗 Payment URL:');
    console.log(checkoutResponse.data.checkout_url);
    console.log('════════════════════════════════════════════════════════\n');
    
    console.log('STEP 2: Complete the payment');
    console.log('1. Copy the URL above and open it in your browser');
    console.log('2. Complete the payment process');
    console.log('3. Note the redirect URL after payment\n');
    
    const completed = await question('Have you completed the payment? (y/n): ');
    
    if (completed.toLowerCase() === 'y') {
      console.log('\nSTEP 3: Handle redirect');
      const redirectUrl = await question('Paste the redirect URL here: ');
      
      if (redirectUrl) {
        try {
          const redirectParams = RedirectHandler.parseRedirectUrl(redirectUrl);
          console.log('\n✅ Redirect parsed:');
          console.log(`  Transaction ID: ${redirectParams.transaction_id}`);
          console.log(`  Status: ${redirectParams.status}`);
          
          console.log('\nSTEP 4: Verify the payment');
          const verifyResponse = await moneybag.verify(redirectParams.transaction_id);
          
          console.log('\n════════════════════════════════════════════════════════');
          console.log('FINAL RESULT:');
          console.log(`  Order ID: ${verifyResponse.data.order_id}`);
          console.log(`  Transaction ID: ${verifyResponse.data.transaction_id}`);
          console.log(`  Status: ${verifyResponse.data.status}`);
          console.log(`  Verified: ${verifyResponse.data.verified ? '✅' : '❌'}`);
          console.log(`  Amount Paid: ${verifyResponse.data.currency} ${verifyResponse.data.amount}`);
          console.log('════════════════════════════════════════════════════════');
          
          if (verifyResponse.data.verified && verifyResponse.data.status === PAYMENT_STATUS.SUCCESS) {
            console.log('\n🎉 PAYMENT SUCCESSFUL AND VERIFIED!');
          }
        } catch (error: any) {
          console.error('\n❌ Error:', error.message);
        }
      }
    } else {
      console.log('\n⏸️ Flow simulation paused. You can verify the transaction later using option 2.');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error in flow simulation:', error.message);
  }
}

// Start the interactive test
runInteractiveTest().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});