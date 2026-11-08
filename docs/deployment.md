# Vercel deployment

Home Essentials deploys as an ordinary Next.js project backed by hosted Supabase. Docker is not part of the deployment process.

## Before deployment

- Create the hosted Supabase project.
- Apply all migrations and the category seed in `docs/database-setup.md`.
- Create the first administrator in `docs/first-admin.md`.
- Decide the final Vercel or custom domain.
- Prepare a public business contact email.
- Have the Amazon Associates tracking ID and real verified product links ready.

## Vercel project

1. Push the source repository to a private or public Git provider repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Keep the framework preset as **Next.js**.
4. Keep the project root at the repository root.
5. The install command is `npm install`; the build command is `npm run build`.
6. Add these Production and Preview environment variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_FINAL_DOMAIN
NEXT_PUBLIC_CONTACT_EMAIL=YOUR_PUBLIC_CONTACT_EMAIL
```

The Supabase Vercel integration may synchronize the URL and publishable key automatically. Confirm that the variable names match the application. Do not add a service-role key; the application does not use one.

## Supabase authentication URLs

In **Authentication → URL Configuration**:

- Set the site URL to `https://YOUR_FINAL_DOMAIN`.
- Add `http://127.0.0.1:3000/**` for local development.
- If staff must sign in to Vercel previews, add the narrow Vercel preview pattern recommended by Supabase for your team slug.

Password sign-in does not require public registration. Keep sign-up disabled and create staff users deliberately.

## Deploy

Trigger the first deployment. Vercel must complete `npm run build` successfully. After deployment:

1. Open the homepage, products, categories, guides, disclosure, privacy, and contact pages.
2. Open `/admin/login` and sign in with the first administrator.
3. Create a draft product with a unique name and slug.
4. Add its real ASIN and exact Associates link, then confirm the link.
5. Add an authorized HTTPS image and meaningful alt text.
6. Complete the required editorial and SEO fields and publish.
7. Open the public product page and inspect the **View on Amazon** anchor. Its `href` must be the exact stored Amazon.com Special Link, not a local redirect.
8. Confirm the disclosure is visible near the button and in the footer.
9. Unpublish the test item if it is not launch-ready.

## Custom domain and launch

- Add the custom domain in Vercel and update DNS.
- Update `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS domain and redeploy.
- Update the Supabase Auth site URL.
- Add the exact website domain to the Amazon Associates account’s site list before using Special Links there.
- Submit the final website address in any other relevant account settings, including Pinterest.
- Recheck sitemap and robots at `/sitemap.xml` and `/robots.txt`.

## Rollback

Vercel can promote an earlier successful deployment if an application regression occurs. Database migrations should be additive; test a corrective migration in a separate project before applying it to production. Do not delete or rewrite production content to roll back a frontend deployment.

## Official references

- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Vercel Marketplace integration](https://supabase.com/docs/guides/integrations/vercel-marketplace)
- [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
