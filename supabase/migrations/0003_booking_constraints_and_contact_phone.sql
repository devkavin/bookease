alter table bookings
  add column if not exists customer_phone text;

create unique index if not exists idx_bookings_service_start_confirmed
  on bookings (service_id, start_at)
  where status = 'confirmed';

alter table bookings
  add constraint bookings_customer_phone_format
  check (
    customer_phone is null
    or customer_phone ~ '^\+?[1-9][0-9]{7,14}$'
  );
