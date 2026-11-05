# RackVira / رک‌ویرا

Independent network equipment storefront and customer account. The reference catalog covers new and pre-owned equipment, comparison, and a quote basket. Prices, warranty details, and availability in this catalog are examples.

## Run locally

Use Node.js 22.15 or later.

```sh
npm ci
npm test
npm run typecheck:edge
npm run build
npm run dev -- --host 127.0.0.1 --port 8081
```

- `/` — public catalog and product details; the basket hands reference selections to the quote form.
- `/account` — private orders, quotes, billing documents, addresses, and buyer profile.
- `/preview/account` — local development fixture. This route is absent from production builds.
- `public/rackvira.svg` — original vector mark for the shop, account, favicon, and documents.

## Connect a real store account

1. Provision a **dedicated Supabase project** and deploy this repository's migrations and `shop-account` Edge Function to it. Never reuse the hosting project, API keys or database. No users or commerce data are seeded.
2. Copy `.env.example` to `.env.local` and set only the new project's URL and publishable key. The service role credential stays in the Edge Function environment. Serve unknown front-end paths through the SPA fallback.
3. Enable email confirmation and configure the production site URL and permitted RackVira `/auth` redirect URLs in the Auth settings. Use verified SMTP and test confirmation, password recovery and session isolation with staging accounts. The account gate and API both require an authenticator challenge when one is enrolled.
4. Load verified products, stock and warranty terms from the actual supplier. Configure payment and seller identity before issuing official documents. Issue documents through a trusted billing process using the buyer profile and a verified order, then store the immutable buyer snapshot with the document. The quote form cannot confirm payment or issue a document.
5. If legacy store orders or invoices exist, inventory them and plan an explicit owner mapping and migration. The hosting database and past migrations are not changed by the split. Do not reuse the old hosting session or copy production secrets.

Without the two store settings, the catalog and estimates remain browsable; live sign-in, payment and order issuance are unavailable.
