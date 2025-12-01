export interface PaymentInfo {
  is_recurring?: boolean;
  installments?: number;
  currency_conversion?: boolean;
  allowed_payment_methods: string[];
  requires_emi?: boolean;
}