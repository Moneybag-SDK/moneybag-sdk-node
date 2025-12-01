import express from 'express';
import { MoneybagSdk, CheckoutRequest, ValidationException, RedirectHandler } from '@moneybag/sdk';

const app = express();
app.use(express.json());

// Initialize Moneybag SDK
const moneybag = new MoneybagSdk({
  apiKey: process.env.MONEYBAG_API_KEY || 'your-api-key',
  baseUrl: process.env.MONEYBAG_BASE_URL || 'https://sandbox.api.moneybag.com.bd/api/v2',
});

// Endpoint to create checkout
app.post('/api/checkout', async (req, res) => {
  try {
    const { cartItems, customer } = req.body;

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    // Create checkout request
    const checkoutRequest: CheckoutRequest = {
      order_id: `order_${Date.now()}`,
      currency: 'BDT',
      order_amount: totalAmount.toFixed(2),
      order_description: 'Purchase from our store',
      success_url: `${process.env.BASE_URL}/payment/success`,
      cancel_url: `${process.env.BASE_URL}/payment/cancel`,
      fail_url: `${process.env.BASE_URL}/payment/fail`,
      ipn_url: `${process.env.BASE_URL}/api/payment/ipn`,
      customer: customer,
      order_items: cartItems.map((item: any) => ({
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      payment_info: {
        allowed_payment_methods: ['card', 'mobile_banking'],
      },
    };

    // Create checkout session
    const response = await moneybag.checkout(checkoutRequest);

    // Store order details in database
    // await saveOrder(checkoutRequest.order_id, response.data.session_id);

    res.json({
      success: true,
      checkoutUrl: response.data.checkout_url,
      sessionId: response.data.session_id,
    });
  } catch (error) {
    if (error instanceof ValidationException) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      console.error('Checkout error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create checkout session',
      });
    }
  }
});

// Success callback
app.get('/payment/success', async (req, res) => {
  try {
    // Parse redirect parameters
    const params = RedirectHandler.parseRedirectUrl(req.url);
    
    // Verify the payment
    const response = await moneybag.verify(params.transaction_id);

    if (response.data.verified && response.data.status === 'SUCCESS') {
      // Update order status in database
      // await updateOrderStatus(response.data.order_id, 'PAID');

      res.send(`
        <h1>Payment Successful!</h1>
        <p>Order ID: ${response.data.order_id}</p>
        <p>Amount: ${response.data.amount} ${response.data.currency}</p>
        <p>Transaction ID: ${response.data.transaction_id}</p>
      `);
    } else {
      res.send('<h1>Payment verification failed</h1>');
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('Error verifying payment');
  }
});

// Fail callback
app.get('/payment/fail', (req, res) => {
  res.send('<h1>Payment Failed</h1><p>Your payment could not be processed.</p>');
});

// Cancel callback
app.get('/payment/cancel', (req, res) => {
  res.send('<h1>Payment Cancelled</h1><p>You cancelled the payment.</p>');
});

// IPN endpoint
app.post('/api/payment/ipn', async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    // Verify the payment
    const response = await moneybag.verify(transaction_id);

    if (response.data.verified) {
      // Process the IPN
      console.log('IPN received for transaction:', transaction_id);
      console.log('Payment status:', response.data.status);

      // Update your database based on payment status
      // await processIPN(response.data);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('IPN error:', error);
    res.status(500).json({ error: 'IPN processing failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});