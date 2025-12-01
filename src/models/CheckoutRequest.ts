import { Customer } from './Customer';
import { Shipping } from './Shipping';
import { OrderItem } from './OrderItem';
import { PaymentInfo } from './PaymentInfo';

export interface CheckoutRequest {
  order_id: string;
  currency: string;
  order_amount: string;
  order_description?: string;
  success_url: string;
  cancel_url: string;
  fail_url: string;
  ipn_url?: string;
  customer: Customer;
  shipping?: Shipping;
  order_items?: OrderItem[];
  payment_info?: PaymentInfo;
  metadata?: Record<string, unknown>;
}