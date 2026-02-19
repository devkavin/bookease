alter table bookings
  drop constraint if exists bookings_service_id_fkey;

alter table bookings
  add constraint bookings_service_id_fkey
  foreign key (service_id)
  references services(id)
  on update cascade
  on delete set null;
