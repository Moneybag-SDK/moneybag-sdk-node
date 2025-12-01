import { Customer } from './Customer';

export interface VerifyResponse {
  success: boolean;
  data: {
    transaction_id: string;
    order_id: string;
    verified: boolean;
    status: string;
    amount: string;
    currency: string;
    payment_method: string;
    payment_reference_id: string;
    customer: Customer;
  };
  message: string;
}