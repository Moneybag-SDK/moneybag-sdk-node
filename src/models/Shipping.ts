export interface Shipping {
  name: string;
  address: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  metadata?: Record<string, unknown>;
}