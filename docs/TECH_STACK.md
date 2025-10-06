# Technology Stack

**Last Updated:** October 5, 2025

---

## Overview

Evercraft is built with modern, scalable technologies prioritizing performance, developer experience, and maintainability.

---

## Frontend

### Core Framework

- **Next.js 14+** (App Router)
  - Server-side rendering (SSR) for SEO
  - Server components for performance
  - API routes for backend
  - Image optimization built-in
  - File-based routing
  - Excellent TypeScript support

### Language

- **TypeScript** (Strict mode)
  - Type safety across entire codebase
  - Better IDE support
  - Catch errors at compile time
  - Self-documenting code

### Styling

- **Tailwind CSS**
  - Utility-first CSS framework
  - Rapid UI development
  - Consistent design system
  - Minimal CSS bundle (purge unused)
  - Dark mode support built-in

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

---

## Backend

### API Layer

- **Next.js API Routes**
  - Serverless functions
  - Same codebase as frontend
  - Edge runtime support

- **tRPC** (Type-safe API)
  - End-to-end type safety
  - No code generation
  - Auto-complete in IDE
  - Eliminates API documentation need

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

- **Clerk** (Recommended) or **NextAuth.js**

  **Clerk Pros:**
  - Built-in UI components
  - User management dashboard
  - Multi-factor auth
  - Social logins (Google, Apple, Facebook)
  - Webhooks for user events
  - Excellent UX

  **NextAuth.js Pros:**
  - Open source, free
  - Flexible, self-hosted
  - Many providers
  - Custom database integration

  **Decision:** Start with Clerk for speed, migrate to NextAuth if needed

---

## Key Services & Integrations

### Payments

- **Stripe Connect**
  - Marketplace payments (split payments)
  - Seller onboarding (KYC)
  - Automated payouts
  - Payment intents API
  - Supports Apple Pay, Google Pay
  - Strong fraud detection
  - PCI compliance handled
  - Webhooks for events

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

- **Uploadthing** (Recommended) or **Cloudinary**

  **Uploadthing Pros:**
  - Built for Next.js
  - Type-safe uploads
  - Automatic image optimization
  - S3-backed
  - Simple pricing

  **Cloudinary Pros:**
  - Advanced image transformations
  - Video support
  - AI-powered features
  - CDN included
  - More mature

  **Decision:** Uploadthing for simplicity, Cloudinary if advanced features needed

### Email

- **Resend**
  - Developer-friendly API
  - React Email templates
  - Good deliverability
  - Affordable pricing
  - Webhooks for tracking

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

1. **Next.js over Remix/Nuxt:** Best ecosystem, performance, SEO
2. **PostgreSQL over MongoDB:** E-commerce needs relational data
3. **Stripe Connect over PayPal:** Better marketplace support
4. **Meilisearch over Algolia:** Cost-effective, open source
5. **Clerk over NextAuth:** Faster MVP, great UX (can migrate later)
6. **Railway over Vercel/AWS:** User familiarity, simplicity
7. **shadcn/ui over MUI:** Modern, accessible, customizable
8. **tRPC over REST:** Type safety, better DX
9. **Vitest over Jest:** Faster, better ESM support

### Open Decisions

- [ ] Clerk vs NextAuth (final decision in Phase 1)
- [ ] Uploadthing vs Cloudinary (evaluate in Phase 3)
- [ ] Self-hosted Meilisearch vs managed service (evaluate scaling needs)

---

**This stack is optimized for:**
✅ Fast development velocity (MVP in 7-8 months)
✅ Excellent UX (performance, accessibility)
✅ Type safety (minimize bugs)
✅ Scalability (grow with platform)
✅ Cost-effectiveness (startup-friendly)
✅ Developer experience (modern tooling)
