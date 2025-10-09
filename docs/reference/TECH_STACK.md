# Technology Stack

**Last Updated:** October 7, 2025

---

## Overview

Evercraft is built with modern, scalable technologies prioritizing performance, developer experience, and maintainability.

---

## Frontend

### Core Framework

- **Next.js 15.5.4** (App Router)
  - Server-side rendering (SSR) for SEO
  - Server components for performance
  - Server Actions for mutations
  - Image optimization built-in
  - File-based routing
  - Excellent TypeScript support
  - React 19 support

### Language

- **TypeScript** (Strict mode)
  - Type safety across entire codebase
  - Better IDE support
  - Catch errors at compile time
  - Self-documenting code

### Styling

- **Tailwind CSS v4** (PostCSS)
  - Utility-first CSS framework
  - Rapid UI development
  - Consistent design system
  - Minimal CSS bundle (purge unused)
  - Dark mode support built-in
  - Latest v4 architecture with improved performance

### UI Components

- **shadcn/ui**
  - Accessible components (Radix UI primitives)
  - Customizable (copy to project, not npm package)
  - Beautiful default styling
  - TypeScript support
  - Tailwind CSS integration

### Animations

- **Framer Motion**
  - Smooth, performant animations
  - Declarative API
  - Gesture support
  - Layout animations
  - SVG animations

### Forms & Validation

- **React Hook Form**
  - Performant (minimal re-renders)
  - Easy validation
  - TypeScript support
- **Zod**
  - Schema validation
  - Type inference
  - Server + client validation

### State Management

- **Zustand** (global state)
  - Simple, minimal boilerplate
  - TypeScript support
  - DevTools integration
- **React Context** (component state)
  - Built-in, no additional library
  - Good for auth, theme, etc.

### Utility Libraries

- **date-fns 4.1.0**
  - Modern date utility library
  - Modular and tree-shakeable
  - TypeScript support
  - Used for review timestamps and date formatting

---

## Backend

### API Layer

- **Next.js Server Actions** (Primary)
  - Server-side functions for mutations
  - Type-safe with TypeScript
  - Automatic POST endpoint generation
  - Progressive enhancement support
  - Used for all data mutations (reviews, orders, etc.)

- **Next.js API Routes** (Secondary)
  - RESTful endpoints for specific use cases
  - Serverless functions
  - Same codebase as frontend
  - Edge runtime support

### Database

- **PostgreSQL**
  - Robust relational database
  - ACID compliance
  - Complex queries support
  - JSON support (for flexible fields)
  - Excellent indexing
  - Mature ecosystem

### ORM

- **Prisma**
  - Type-safe database client
  - Auto-generated types from schema
  - Migration system
  - Excellent TypeScript support
  - Introspection and seeding
  - Prisma Studio (GUI for data)

### Authentication

- **Clerk 6.33.3** ✅ Implemented

  **Features in use:**
  - Built-in UI components (sign-in, sign-up, user profile)
  - User management dashboard
  - Multi-factor authentication
  - Social logins (Google, Apple, Facebook)
  - Webhooks for user lifecycle events
  - Role-based access control (BUYER, SELLER, ADMIN)
  - Middleware for route protection
  - TypeScript support
  - Excellent developer experience

---

## Key Services & Integrations

### Payments

- **Stripe 19.1.0** ✅ Implemented
  - Stripe Connect for marketplace payments
  - Split payments to sellers and nonprofit donations
  - Seller onboarding with KYC verification
  - Automated payouts
  - Payment Intents API
  - Supports Apple Pay, Google Pay
  - Strong fraud detection
  - PCI compliance handled
  - Webhooks for payment events
  - React Stripe.js integration (@stripe/react-stripe-js 5.0.0)

### Search

- **Meilisearch**
  - Fast, typo-tolerant search
  - Faceted search (filters)
  - Relevance scoring
  - Open source, self-hosted
  - Affordable (vs Algolia)
  - API-first
  - Instant search UX

### File Upload & Storage

- **UploadThing 7.7.4** ✅ Implemented
  - Built for Next.js integration
  - Type-safe uploads with TypeScript
  - Automatic image optimization
  - S3-backed storage
  - Simple pricing model
  - React components (@uploadthing/react 7.3.3)
  - Used for product images and review images
  - Seamless integration with App Router

### Email

- **Resend 6.1.2** ✅ Implemented
  - Developer-friendly API
  - React Email templates support
  - Good deliverability
  - Affordable pricing
  - Webhooks for tracking
  - Used for order confirmations and notifications

### Shipping

- **Shippo** (Recommended) or **EasyPost**

  **Both offer:**
  - Multi-carrier (USPS, UPS, FedEx)
  - Label generation
  - Rate shopping
  - Tracking
  - Address validation
  - International shipping

  **Decision:** Shippo (cleaner API, better docs)

### SMS (Optional)

- **Twilio**
  - Reliable delivery
  - Two-way messaging
  - Programmable
  - Global coverage

---

## Infrastructure

### Deployment

- **Railway**
  - Easy setup (user familiar)
  - Automatic deployments from Git
  - PostgreSQL hosting
  - Redis support
  - Environment variables
  - Preview deployments
  - Good pricing for startups

### CDN

- **Cloudflare** (or Railway's built-in)
  - Global edge network
  - DDoS protection
  - SSL/TLS
  - Caching
  - Analytics
  - Free tier available

### Caching

- **Redis** (via Railway or Upstash)
  - Session storage
  - API response caching
  - Rate limiting
  - Background job queues

### Background Jobs

- **BullMQ** (Redis-based)
  - Email sending (async)
  - Image processing
  - Report generation
  - Search indexing
  - Scheduled tasks

---

## Monitoring & Analytics

### Error Tracking

- **Sentry**
  - Real-time error tracking
  - Source maps support
  - User context
  - Performance monitoring
  - Alerts (Slack, email)

### Performance Monitoring

- **Vercel Analytics** (if deployed on Vercel) or **Railway equivalent**
  - Real user monitoring (RUM)
  - Core Web Vitals
  - Page load times
  - API latency

### User Analytics

- **PostHog** (Recommended)
  - Open source, privacy-focused
  - Self-hosted or cloud
  - Product analytics
  - Feature flags
  - Session recording
  - Funnels and retention
  - GDPR compliant

### Uptime Monitoring

- **Better Uptime** or **UptimeRobot**
  - Status page
  - Multi-region checks
  - Alerts (email, Slack)

---

## Testing

### Unit & Integration Testing

- **Vitest**
  - Fast (Vite-powered)
  - Jest-compatible API
  - ESM support
  - TypeScript support
  - In-source testing

- **React Testing Library**
  - User-centric testing
  - Accessibility-focused
  - Works with Vitest

### E2E Testing

- **Playwright**
  - Cross-browser (Chromium, Firefox, WebKit)
  - Parallel test execution
  - Auto-wait (no flaky tests)
  - Screenshots and videos
  - Trace viewer (debugging)
  - TypeScript support

### Visual Regression

- **Chromatic** (Storybook integration)
  - Catch UI bugs
  - Review changes visually
  - CI/CD integration

### API Testing

- **Supertest** (REST endpoints)
- **tRPC built-in testing** (type-safe)

---

## Code Quality

### Linting

- **ESLint**
  - Next.js config
  - Accessibility rules (eslint-plugin-jsx-a11y)
  - React hooks rules
  - TypeScript rules

### Formatting

- **Prettier**
  - Consistent code style
  - Auto-format on save
  - Tailwind plugin (class sorting)

### Git Hooks

- **Husky**
  - Pre-commit hooks
  - Pre-push hooks

- **lint-staged**
  - Run linters on staged files only
  - Fast commits

### Type Checking

- **TypeScript** (strict mode)
  - tsc --noEmit (type check without build)
  - Run in CI/CD

---

## Development Tools

### Package Manager

- **pnpm** (Recommended) or **npm**
  - Faster than npm
  - Disk space efficient
  - Strict dependency resolution

### Version Control

- **Git** with **GitHub**
  - Main branch protection
  - Pull request workflow
  - GitHub Actions (CI/CD)

### API Development

- **Postman** or **Insomnia** (REST testing)
- **tRPC DevTools** (built-in)

### Database GUI

- **Prisma Studio** (built-in with Prisma)
- **TablePlus** or **Postico** (PostgreSQL clients)

---

## CI/CD Pipeline

### GitHub Actions

- **Lint and Type Check** (on PR)
- **Unit Tests** (on PR and push)
- **E2E Tests** (on PR to main)
- **Build** (on push to main)
- **Deploy** (Railway auto-deploy or manual trigger)

### Deployment Flow

1. Push to feature branch
2. Create PR → automated checks run
3. Review and approve
4. Merge to main
5. Railway auto-deploys
6. Run smoke tests on production

---

## Security

### Authentication & Authorization

- **Clerk** (session management, MFA)
- **Middleware** (route protection in Next.js)
- **Role-based access control (RBAC)** (buyer, seller, admin)

### Data Protection

- **Environment variables** (secrets)
- **Railway secrets management**
- **Database encryption at rest** (PostgreSQL)
- **SSL/TLS** (all connections)

### Compliance

- **Stripe** (PCI-DSS)
- **GDPR compliance** (data deletion, portability)
- **CCPA compliance** (privacy policy, opt-out)

### Rate Limiting

- **Redis-based rate limiter** (prevent abuse)
- **Cloudflare rate limiting** (DDoS protection)

---

## Performance Optimization

### Frontend

- **Next.js Image Optimization** (automatic)
- **Code splitting** (dynamic imports)
- **Lazy loading** (images, components)
- **Prefetching** (next/link)
- **Service Worker** (PWA, offline support - Phase 11)

### Backend

- **Database indexing** (optimized queries)
- **Connection pooling** (Prisma)
- **Caching** (Redis for API responses)
- **CDN** (static assets)

### SEO

- **Server-side rendering (SSR)**
- **Metadata API** (Next.js 14)
- **Structured data** (Schema.org)
- **Sitemap** (automatic generation)
- **Robots.txt**

---

## Future Considerations

### Phase 10+

- **Elasticsearch** (advanced search, if Meilisearch insufficient)
- **GraphQL** (if API becomes too complex)
- **Microservices** (if monolith becomes unwieldy)
- **Kubernetes** (if scaling beyond Railway)
- **Multi-region deployment** (global performance)

### International Expansion (Phase 19)

- **i18n** (next-intl or next-i18next)
- **Multi-currency** (Stripe multi-currency)
- **Localized CDN** (regional edge caching)

---

## Cost Estimates (Monthly)

### MVP Launch (Low Traffic)

- **Railway:** ~$20-50 (compute + Postgres + Redis)
- **Stripe:** Pay-as-you-go (2.9% + $0.30 per transaction)
- **Clerk:** Free tier (up to 5k MAU) or $25/mo
- **Uploadthing/Cloudinary:** Free tier initially
- **Resend:** Free tier (100 emails/day) or $20/mo
- **Meilisearch:** Self-hosted on Railway (included in compute)
- **Sentry:** Free tier (5k errors/mo) or $26/mo
- **Shippo:** Pay-as-you-go (per label)
- **Domain:** ~$12/year

**Total (MVP, low traffic):** ~$100-200/month

### Growth Phase (10k+ users)

- **Railway:** ~$200-500
- **Stripe:** Volume discounts kick in
- **Clerk:** ~$100-200
- **Cloudinary:** ~$100
- **Resend:** ~$50
- **Redis (Upstash):** ~$50
- **Sentry:** ~$50
- **Monitoring:** ~$50

**Total (growth):** ~$600-1200/month

---

## Decision Log

### Key Decisions Made

1. **Next.js 15 over Remix/Nuxt:** Best ecosystem, performance, SEO
2. **PostgreSQL over MongoDB:** E-commerce needs relational data ✅
3. **Stripe Connect over PayPal:** Better marketplace support ✅
4. **Clerk over NextAuth:** Faster MVP, great UX, excellent DX ✅
5. **Railway over Vercel/AWS:** User familiarity, simplicity ✅
6. **shadcn/ui over MUI:** Modern, accessible, customizable ✅
7. **Server Actions over tRPC:** Native Next.js integration, simpler setup ✅
8. **Vitest over Jest:** Faster, better ESM support ✅
9. **UploadThing over Cloudinary:** Better Next.js integration ✅
10. **Zustand over Redux:** Simpler API, less boilerplate ✅
11. **date-fns over moment.js:** Modern, tree-shakeable, smaller bundle ✅

### Implementation Status

- ✅ **Phase 0-7:** Completed (Authentication, Products, Cart, Checkout, Orders, Reviews)
- 🚧 **Phase 8:** Admin Panel - 65% complete (Dashboard, applications, product moderation done)
- 📋 **Phase 9+:** Upcoming features (Analytics, advanced search, mobile app)

---

## Key Features Implemented

### Phase 8: Admin Panel 🚧 (65% Complete)

- **Server Actions:**
  - `/src/actions/admin.ts` - Dashboard metrics and activity feed (269 lines)
  - `/src/actions/admin-products.ts` - Product moderation (120 lines)
- **Pages & Components:**
  - `/admin` - Dashboard with platform metrics (revenue, orders, sellers, donations)
  - `/admin/applications` - Seller application review queue
  - `/admin/products` - Product moderation interface
  - Admin layout with sidebar navigation
- **Features Implemented:**
  - Platform metrics overview (GMV, active sellers/buyers, orders, donations)
  - Real-time activity feed (new orders, applications, products, shops)
  - Seller application management (approve/reject with notes)
  - Product moderation (publish/unpublish/archive/delete)
  - Admin authentication and authorization checks
- **Remaining Work:**
  - User management (search, suspend/ban, activity logs)
  - Nonprofit management (CRUD, performance tracking)
  - Financial reporting (detailed revenue, payouts)
  - Charts & visualizations (trends, distributions)
  - Content moderation (review flags, reports)

### Phase 7: Reviews & Ratings ✅

- **Server Actions:** `/src/actions/reviews.ts` with 520+ lines of type-safe mutations
- **Components:**
  - StarRating - Reusable rating display component
  - ReviewForm - Create/edit review form with validation
  - ProductReviews - Product review list with filtering/sorting
  - UserReviewsList - User's review management interface
- **Features:**
  - 1-5 star ratings with visual display
  - Verified purchase badges
  - Review images (via UploadThing)
  - Helpful vote system
  - Rating aggregation and statistics
  - Filtering (all, verified only)
  - Sorting (recent, highest rated, most helpful)
  - User review history at `/account/reviews`
  - Edit/delete functionality
  - Server-side validation with proper error handling

### Previous Phases (Phase 0-6) ✅

- User authentication with Clerk (social logins, MFA)
- Role-based access control (Buyer, Seller, Admin)
- Product catalog with variants and inventory
- Shopping cart with Zustand persistence
- Stripe checkout integration
- Order processing and fulfillment
- Nonprofit selection and donation tracking
- Impact metrics dashboard
- Seller verification workflow
- Image uploads via UploadThing

---

**This stack is optimized for:**
✅ Fast development velocity
✅ Excellent UX (performance, accessibility)
✅ Type safety (minimize bugs)
✅ Scalability (grow with platform)
✅ Cost-effectiveness (startup-friendly)
✅ Developer experience (modern tooling)
