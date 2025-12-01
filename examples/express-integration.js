"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sdk_1 = require("@moneybag/sdk");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const moneybag = new sdk_1.MoneybagSdk({
    apiKey: process.env.MONEYBAG_API_KEY || 'your-api-key',
    baseUrl: process.env.MONEYBAG_BASE_URL || 'https://sandbox.api.moneybag.com.bd/api/v2',
});
app.post('/api/checkout', async (req, res) => {
    try {
        const { cartItems, customer } = req.body;
        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
        const checkoutRequest = {
            order_id: `order_${Date.now()}`,
            currency: 'BDT',
            order_amount: totalAmount.toFixed(2),
            order_description: 'Purchase from our store',
            success_url: `${process.env.BASE_URL}/payment/success`,
            cancel_url: `${process.env.BASE_URL}/payment/cancel`,
            fail_url: `${process.env.BASE_URL}/payment/fail`,
            ipn_url: `${process.env.BASE_URL}/api/payment/ipn`,
            customer: customer,
            order_items: cartItems.map((item) => ({
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
            })),
            payment_info: {
                allowed_payment_methods: ['card', 'mobile_banking'],
            },
        };
        const response = await moneybag.checkout(checkoutRequest);
        res.json({
            success: true,
            checkoutUrl: response.data.checkout_url,
            sessionId: response.data.session_id,
        });
    }
    catch (error) {
        if (error instanceof sdk_1.ValidationException) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
        else {
            console.error('Checkout error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create checkout session',
            });
        }
    }
});
app.get('/payment/success', async (req, res) => {
    try {
        const params = sdk_1.RedirectHandler.parseRedirectUrl(req.url);
        const response = await moneybag.verify(params.transaction_id);
        if (response.data.verified && response.data.status === 'SUCCESS') {
            res.send(`
        <h1>Payment Successful!</h1>
        <p>Order ID: ${response.data.order_id}</p>
        <p>Amount: ${response.data.amount} ${response.data.currency}</p>
        <p>Transaction ID: ${response.data.transaction_id}</p>
      `);
        }
        else {
            res.send('<h1>Payment verification failed</h1>');
        }
    }
    catch (error) {
        console.error('Verification error:', error);
        res.status(500).send('Error verifying payment');
    }
});
app.get('/payment/fail', (req, res) => {
    res.send('<h1>Payment Failed</h1><p>Your payment could not be processed.</p>');
});
app.get('/payment/cancel', (req, res) => {
    res.send('<h1>Payment Cancelled</h1><p>You cancelled the payment.</p>');
});
app.post('/api/payment/ipn', async (req, res) => {
    try {
        const { transaction_id } = req.body;
        if (!transaction_id) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        }
        const response = await moneybag.verify(transaction_id);
        if (response.data.verified) {
            console.log('IPN received for transaction:', transaction_id);
            console.log('Payment status:', response.data.status);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('IPN error:', error);
        res.status(500).json({ error: 'IPN processing failed' });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=express-integration.js.map