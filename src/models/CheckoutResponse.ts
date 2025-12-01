export interface CheckoutResponse {
  success: boolean;
  data: {
    checkout_url: string;
    session_id: string;
    expires_at: string;
  };
  message: string;
}