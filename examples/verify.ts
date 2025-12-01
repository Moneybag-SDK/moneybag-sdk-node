import { MoneybagSdk } from '@moneybag/sdk';

// Initialize the SDK
const moneybag = new MoneybagSdk({
  apiKey: process.env.MONEYBAG_API_KEY || 'your-api-key',
  baseUrl: process.env.MONEYBAG_BASE_URL || 'https://sandbox.api.moneybag.com.bd/api/v2',
});

async function verifyPayment(transactionId: string) {
  try {
    // Verify the payment
    const response = await moneybag.verify(transactionId);

    console.log('Payment verification response:');
    console.log('Transaction ID:', response.data.transaction_id);
    console.log('Order ID:', response.data.order_id);
    console.log('Verified:', response.data.verified);
    console.log('Status:', response.data.status);
    console.log('Amount:', response.data.amount, response.data.currency);
    console.log('Payment Method:', response.data.payment_method);
    
    if (response.data.verified && response.data.status === 'SUCCESS') {
      console.log('\\n✅ Payment verified successfully!');
      // Update your order status in database
      // Send confirmation email to customer
      // etc.
    } else {
      console.log('\\n❌ Payment verification failed');
      // Handle failed payment
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
  }
}

// Example usage
const transactionId = process.argv[2] || 'txn1234567890';
console.log(`Verifying payment for transaction: ${transactionId}\\n`);
verifyPayment(transactionId);