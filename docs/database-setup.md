# Hosted Supabase setup

Hosted Supabase is the database, authentication provider, and authorization boundary for Home Essentials. Docker is not required.

## 1. Create the project

Create a Supabase project and wait until its database is ready. From the project **Connect** panel, copy:

- Project URL
- Publishable key

Create `.env.local` from `.env.example` and set:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_CONTACT_EMAIL=YOUR_PUBLIC_CONTACT_EMAIL
```

The publishable key is intentionally public. RLS controls what it can read or change. This application does not need a service-role key.

## 2. Apply the schema

Recommended remote CLI workflow:

```powershell
npx supabase@3.0.0 link --project-ref YOUR_PROJECT_REF
npx supabase@3.0.0 db push --dry-run
npx supabase@3.0.0 db push
```

Then run `supabase/seed.sql` once through the Supabase SQL Editor. It inserts seven real category labels and no products.

If you do not use the CLI, open the SQL Editor and run every file under `supabase/migrations` in filename order, followed by `supabase/seed.sql`.

## 3. Configure authentication

In **Authentication → URL Configuration**:

- Set the production site URL to the final HTTPS domain.
- Add `http://127.0.0.1:3000/**` for local development.
- Add the required Vercel preview pattern only if preview sign-in is needed.

Keep public sign-up disabled. Follow `docs/first-admin.md` to create the first Auth user and matching `public.profiles` row.

## 4. Security model

- Anonymous users can read active categories and published products or guides only.
- Anonymous users can read an exact affiliate URL only when its link is active and verified and its product is published in an active category.
- Editors can manage editorial products and guides but cannot change affiliate links or promote users.
- Administrators can add and verify Amazon links.
- Product publication is rejected by PostgreSQL unless required content and an active verified Amazon US link exist.
- Article publication is rejected unless its required editorial fields and structured content exist.
- Staff roles come from `public.profiles`, never editable user metadata.
- Manual prices are not accepted as live product prices.

## 5. Create the administrator

Create the user under **Authentication → Users**, copy the UUID, then run as the database owner:

```sql
insert into public.profiles (id, email, full_name, role)
values ('USER_UUID', 'YOUR_EMAIL', 'Administrator', 'admin');
```

The UUID must already exist in `auth.users`.

## 6. Verify

Run the application checks:

```powershell
npm run test
npm run lint
npm run typecheck
npm run build
```

Then verify with the hosted project:

1. Sign in at `/admin/login`.
2. Save a draft product.
3. Add and confirm a real Associates link as an administrator.
4. Preview and publish the product.
5. Confirm its public product page contains the exact direct Amazon URL.
6. Unpublish it and confirm the public page becomes unavailable.

The pgTAP files in `supabase/tests` provide an optional deeper RLS integration suite for a dedicated test project or local database. They are not required to run or deploy the website.
