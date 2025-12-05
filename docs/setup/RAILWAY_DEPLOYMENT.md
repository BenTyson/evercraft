# Railway Staging Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repo**: Push your code to GitHub (Railway deploys from git)
3. **API Keys Ready**: You'll need test/staging keys for all services

---

## Step 1: Create Railway Project

```bash
# Install Railway CLI (optional but recommended)
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init
```

Or use the Railway dashboard:
1. Go to [railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select your evercraft repository

---

## Step 2: Add PostgreSQL Database

In Railway dashboard:
1. Click "+ New" → "Database" → "PostgreSQL"
2. Railway automatically sets `DATABASE_URL`
3. Note: Railway uses `${{Postgres.DATABASE_URL}}` variable reference

---

## Step 3: Configure Environment Variables

In Railway dashboard → Your service → Variables tab, add:

### Required Variables

```bash
# Database (auto-set by Railway if using their Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Next.js
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
PORT=3000

# Clerk Authentication
# Get from: https://dashboard.clerk.com → Your App → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe (Test Mode)
# Get from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
# Get from: https://uploadthing.com/dashboard
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Resend Email
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_...

# Shippo Shipping
# Get from: https://apps.goshippo.com/settings/api
SHIPPO_API_KEY=shippo_test_...

# Platform Settings (optional)
PLATFORM_DEFAULT_NONPROFIT_ID=
```

---

## Step 4: Configure Clerk for Staging

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application for staging OR use development mode
3. Add your Railway URL to allowed origins:
   - `https://your-app.up.railway.app`
4. Update webhook URL if using Clerk webhooks

---

## Step 5: Configure Stripe for Staging

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Test Mode
2. Get test API keys (they start with `pk_test_` and `sk_test_`)
3. Set up webhook endpoint:
   - URL: `https://your-app.up.railway.app/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `account.updated` (for Connect)

---

## Step 6: Deploy

### Option A: Automatic (GitHub Integration)
Push to your main branch - Railway auto-deploys.

### Option B: Manual Deploy
```bash
railway up
```

---

## Step 7: Run Database Migrations

Railway runs migrations automatically via `startCommand` in `railway.toml`.

If you need to run manually:
```bash
railway run npm run prisma:migrate deploy
```

---

## Step 8: Seed Initial Data

The seed file creates comprehensive demo data for testing:

```bash
# Option 1: Use railway shell (recommended - runs inside Railway network)
railway shell
npm run prisma:seed

# Option 2: If railway run works with public DB URL
railway run npm run prisma:seed
```

**Note**: `railway run` executes locally and may fail if DATABASE_URL uses internal hostname (`postgres.railway.internal`). Use `railway shell` instead to run commands inside Railway's network.

### Seed Data Created
- 82 categories (13 top-level + 69 subcategories)
- 4 nonprofits (Ocean Conservancy, Rainforest Alliance, etc.)
- 5 users (1 admin, 1 buyer, 3 sellers)
- 3 verified shops with eco profiles
- 14 products with images and sustainability scores
- 7 product variants (napkin colors, coffee sizes)
- 3 sample orders with payments and donations
- Reviews and collections

---

## Post-Deployment Checklist

### Verify Core Functionality
- [ ] Homepage loads
- [ ] Can create account via Clerk
- [ ] Can browse products
- [ ] Can view product details

### Verify Integrations
- [ ] Stripe checkout works (use test card `4242 4242 4242 4242`)
- [ ] Stripe Connect onboarding starts
- [ ] File uploads work
- [ ] Emails send (check Resend dashboard)
- [ ] Shipping rates calculate

### Test Critical Flows
- [ ] Complete buyer checkout flow
- [ ] Seller application submission
- [ ] Admin login and dashboard access

---

## Troubleshooting

### Build Fails
```bash
# Check build logs in Railway dashboard
# Common issues:
# - Missing environment variables
# - Prisma generate not running

# Fix: Ensure buildCommand includes prisma:generate
```

### Database Connection Issues
```bash
# Verify DATABASE_URL is set
railway variables

# Test connection
railway run npx prisma db pull
```

### Health Check Fails
```bash
# Check if app starts locally with production build
npm run build && npm start

# Increase healthcheckTimeout in railway.toml if needed
```

---

## Useful Commands

```bash
# View logs
railway logs

# Open shell in container
railway shell

# List variables
railway variables

# Connect to database
railway connect postgres
```

---

## Cost Estimate

Railway Hobby Plan ($5/month):
- Includes 512MB RAM, shared CPU
- PostgreSQL included
- Sufficient for staging/testing

For production, consider Pro plan or dedicated resources.

---

*Last updated: December 5, 2025*
