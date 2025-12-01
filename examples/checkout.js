"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@moneybag/sdk");
const moneybag = new sdk_1.MoneybagSdk({
    apiKey: process.env.MONEYBAG_API_KEY || 'your-api-key',
    baseUrl: process.env.MONEYBAG_BASE_URL || 'https://sandbox.api.moneybag.com.bd/api/v2',
});
async function createCheckout() {
    try {
        const checkoutRequest = {
            order_id: `order_${Date.now()}`,
            currency: 'BDT',
            order_amount: '1280.00',
            order_description: 'Online purchase of electronics',
            success_url: 'https://yourdomain.com/payment/success',
            cancel_url: 'https://yourdomain.com/payment/cancel',
            fail_url: 'https://yourdomain.com/payment/fail',
            ipn_url: 'https://yourdomain.com/payment/ipn',
            customer: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                address: '123 Main Street',
                city: 'Dhaka',
                postcode: '1000',
                country: 'Bangladesh',
                phone: '+8801700000000',
            },
            order_items: [
                {
                    sku: 'PROD001',
                    product_name: 'iPhone 15',
                    product_category: 'Electronic',
                    quantity: 1,
                    unit_price: '1200.00',
                    vat: '120.00',
                    convenience_fee: '80.00',
                    discount_amount: '100.00',
                    net_amount: '1300.00',
                },
            ],
            shipping: {
                name: 'John Doe',
                address: '123 Main Street',
                city: 'Dhaka',
                postcode: '1000',
                country: 'Bangladesh',
            },
            payment_info: {
                is_recurring: false,
                installments: 0,
                currency_conversion: false,
                allowed_payment_methods: ['card', 'mobile_banking'],
                requires_emi: false,
            },
        };
        const response = await moneybag.checkout(checkoutRequest);
        console.log('Checkout session created successfully!');
        console.log('Session ID:', response.data.session_id);
        console.log('Checkout URL:', response.data.checkout_url);
        console.log('Expires at:', response.data.expires_at);
        console.log('\\nRedirect your customer to:', response.data.checkout_url);
    }
    catch (error) {
        console.error('Error creating checkout:', error);
    }
}
createCheckout();
//# sourceMappingURL=checkout.js.map