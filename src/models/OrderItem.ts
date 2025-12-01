export interface OrderItem {
  sku?: string;
  product_name?: string;
  product_category?: string;
  quantity?: number;
  unit_price?: string;
  vat?: string;
  convenience_fee?: string;
  discount_amount?: string;
  net_amount?: string;
  metadata?: Record<string, unknown>;
}