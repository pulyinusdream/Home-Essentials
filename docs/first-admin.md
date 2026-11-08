# Create the first Home Essentials administrator

There is no public registration or “first user becomes admin” route. Create the first account inside Supabase, then assign its database profile explicitly.

## 1. Configure hosted Supabase

In the Supabase dashboard, open **Authentication → URL Configuration**:

- Set the site URL to the deployed HTTPS website.
- Add `http://127.0.0.1:3000/**` for local development.
- Add the final Vercel and custom-domain callback patterns.

Keep public email sign-up disabled under Authentication providers.

## 2. Create the account

Use **Authentication → Users → Add user** in the Supabase dashboard. Create the user with a strong temporary password, mark the email as confirmed only after checking the address, and copy the generated user UUID.

## 3. Assign the profile

Open the SQL editor as the project owner and run this with the real UUID and email:

```sql
insert into public.profiles (id, full_name, email, role)
values (
  'USER_UUID',
  'Paul Andrie Vicente',
  'YOUR_EMAIL_ADDRESS',
  'admin'
)
on conflict (id) do update
set full_name = excluded.full_name,
    email = excluded.email,
    role = 'admin';
```

The UUID must already exist in `auth.users`. Do not place the role in user metadata; application checks and RLS read it from `public.profiles`.

## 4. Configure the application

Add these values to `.env.local` and to the Vercel project settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

Use the project URL and public publishable key from Supabase. No service-role key is needed by this application.

Restart the local Next.js server, open `/admin/login`, and sign in. After confirming access, change the temporary password through a controlled Supabase password-reset flow.

## Additional staff

- `admin`: products, buying guides, publishing controls, and verified affiliate-link changes.
- `editor`: product and buying-guide editorial work without affiliate-link or role changes.

Create each Auth user deliberately, then insert a matching `profiles` row. Editors cannot promote themselves; the database blocks role and account-email changes unless an administrator performs them.
