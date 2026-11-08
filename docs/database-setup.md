# Home Essentials database setup

The database is the source of truth for publication state, staff roles, verified affiliate destinations, and public visibility. Public sign-up is disabled by design. Create staff accounts deliberately and keep the service-role key on the server.

## Recommended setup: hosted Supabase

For this project, use a hosted Supabase project. Docker is not required to run the website, use the admin dashboard, or deploy to Vercel.

1. Create a Supabase project.
2. Link this repository with `npx supabase@3.0.0 link --project-ref PROJECT_REF`.
3. Review the pending migration list with `npx supabase@3.0.0 db push --dry-run`.
4. Apply the migrations with `npx supabase@3.0.0 db push`.
5. Copy `.env.example` to `.env.local` and add the hosted project URL and anon key.
6. Configure the same values in Vercel; keep `SUPABASE_SERVICE_ROLE_KEY` server-only and do not add it unless a documented server workflow requires it.
7. Set the Supabase Auth site URL and allowed redirect URLs to the local URL and final HTTPS Vercel/custom domain.
8. Keep public sign-up disabled and create the first administrator through the controlled process below.

## Optional local database verification

This section is for developers who want to execute the SQL and RLS tests in an isolated local database. It is optional and is not part of the deployed architecture.

Requirements:

- Node.js 22.13 or newer
- Docker Desktop running
- Supabase CLI 3.x (the commands below use `npx`, so no global install is required)

From the project root:

```powershell
npx supabase@3.0.0 start
npx supabase@3.0.0 db reset
npx supabase@3.0.0 test db
npx supabase@3.0.0 status
```

Copy `.env.example` to `.env.local`, then use the local API URL, anon key, and service-role key printed by `supabase status`. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

The local services use these default URLs:

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Mail viewer: `http://127.0.0.1:54324`
- Website: `http://127.0.0.1:3000`

## Create the first administrator

1. Create the user from Supabase Studio under Authentication, or invite the user from the hosted Supabase dashboard.
2. Copy the new user's UUID.
3. As the database owner, insert the corresponding profile:

```sql
insert into public.profiles (id, email, full_name, role)
values ('USER_UUID', 'admin@example.com', 'Administrator', 'admin');
```

Do not store authorization roles in `raw_user_meta_data`. Database policies resolve roles from `public.profiles`, and non-admin users cannot promote themselves.

## Safety rules

- Only active `amazon.com` affiliate URLs can satisfy product publication checks.
- A product cannot be published without a category, recommendation summary, disclosure-ready content, primary image, and active affiliate link.
- A guide cannot be published without a dek, category, cover image, and valid structured content blocks.
- Prices default to unavailable. Store price data only when it comes from an approved Amazon API workflow and retain the source timestamp.
- Product and article rows are publicly readable only after publication. Drafts, affiliate-link records, click analytics, activity logs, and staff profiles remain protected by RLS.
- The `public-media` bucket accepts only image MIME types up to 5 MiB. Administrator-only write access is enforced by storage policies.

## Verification

Run the project checks after every schema or policy change:

```powershell
npm run test
npm run lint
npm run typecheck
npm run build
npx supabase@3.0.0 db reset
npx supabase@3.0.0 test db
```

`tests/database/schema.test.ts` verifies the migration contract without Docker. The pgTAP suite in `supabase/tests/rls.test.sql` can additionally verify behavior against a local PostgreSQL/Supabase stack or a dedicated non-production test project.
