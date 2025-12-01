"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@moneybag/sdk");
const moneybag = new sdk_1.MoneybagSdk({
    apiKey: process.env.MONEYBAG_API_KEY || 'your-api-key',
    baseUrl: process.env.MONEYBAG_BASE_URL || 'https://sandbox.api.moneybag.com.bd/api/v2',
});
async function verifyPayment(transactionId) {
    try {
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
        }
        else {
            console.log('\\n❌ Payment verification failed');
        }
    }
    catch (error) {
        console.error('Error verifying payment:', error);
    }
}
const transactionId = process.argv[2] || 'txn1234567890';
console.log(`Verifying payment for transaction: ${transactionId}\\n`);
verifyPayment(transactionId);
//# sourceMappingURL=verify.js.map