# BookEase

Premium micro-SaaS appointment booking app built with Next.js App Router, TypeScript, Tailwind, shadcn-style components, Supabase, TanStack Query, RHF+Zod, and Framer Motion.

## Setup Supabase
1. Create a Supabase project.
2. In SQL editor, run migrations in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
3. Enable Email auth provider in Supabase Auth.

## Environment Variables
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `RESEND_API_KEY` (optional)
- `APP_URL`

## Run locally
```bash
npm install
npm run dev
```

## Flows
- Marketing: `/` and `/pricing`
- Auth: `/auth/sign-in` and `/auth/sign-up`
- Onboarding: `/onboarding`
- Dashboard: `/dashboard/*`
- Public booking: `/b/[slug]`
- Confirmation: `/b/[slug]/confirmed`
- ICS download: `/api/bookings/[id]/ics`

## Deployment (Vercel)
- Deploy Next.js app to Vercel.
- Add all env vars in Vercel project settings.
- Ensure Supabase URL/key values are from same project.

## RLS + public booking security
- RLS enabled on all app tables.
- Owners can only CRUD rows related to their own businesses.
- Public reads only see businesses/services needed for booking.
- Public booking insert is **not** open via RLS; booking creation runs through secure server API using service role key, with overlap checks before insert.
