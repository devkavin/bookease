alter table profiles enable row level security;
alter table businesses enable row level security;
alter table services enable row level security;
alter table availability_rules enable row level security;
alter table availability_exceptions enable row level security;
alter table bookings enable row level security;

create policy "profiles own select" on profiles for select using (auth.uid() = id);
create policy "profiles own update" on profiles for update using (auth.uid() = id);
create policy "profiles own insert" on profiles for insert with check (auth.uid() = id);

create policy "owner businesses crud" on businesses for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner services crud" on services for all using (business_id in (select id from businesses where owner_id = auth.uid())) with check (business_id in (select id from businesses where owner_id = auth.uid()));
create policy "owner rules crud" on availability_rules for all using (business_id in (select id from businesses where owner_id = auth.uid())) with check (business_id in (select id from businesses where owner_id = auth.uid()));
create policy "owner exceptions crud" on availability_exceptions for all using (business_id in (select id from businesses where owner_id = auth.uid())) with check (business_id in (select id from businesses where owner_id = auth.uid()));
create policy "owner bookings crud" on bookings for all using (business_id in (select id from businesses where owner_id = auth.uid())) with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "public business by slug" on businesses for select using (true);
create policy "public active services" on services for select using (is_active = true);

-- Public booking insert is blocked by default; handled by secure server-side API using service role.
