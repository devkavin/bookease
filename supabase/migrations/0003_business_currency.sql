alter table businesses
add column if not exists system_currency text not null default 'USD';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_system_currency_format'
  ) then
    alter table businesses
      add constraint businesses_system_currency_format
      check (system_currency ~ '^[A-Z]{3}$');
  end if;
end $$;
