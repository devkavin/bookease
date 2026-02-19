export type Booking = {
  id: string;
  business_id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_at: string;
  end_at: string;
  status: 'confirmed' | 'cancelled';
  note: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
};

export type Business = { id: string; owner_id: string; name: string; slug: string; timezone: string };
