# Evercraft 🌱

An eco-focused marketplace platform connecting conscious consumers with sustainable sellers, featuring transparent nonprofit donations and comprehensive sustainability tracking.

## 📋 Project Overview

Evercraft is building an alternative to mass e-commerce platforms like Etsy and Amazon, exclusively for eco-conscious products and sustainable businesses. Our mission is to make sustainable shopping the norm, not the exception.

### Key Features

- 🌿 **Verified Eco-Sellers:** Manual application review ensures only sustainable businesses
- 💚 **Nonprofit Integration:** Sellers donate % of sales to verified nonprofits
- 📊 **Sustainability Scoring:** Products rated on materials, packaging, and carbon footprint
- 🛍️ **Full Marketplace:** Product discovery, checkout, order management, reviews
- 📈 **Impact Tracking:** Real-time metrics on environmental impact and donations

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, tRPC, PostgreSQL, Prisma
- **Payments:** Stripe Connect (marketplace payments)
- **Search:** Meilisearch
- **Testing:** Vitest, Playwright
- **Deployment:** Railway

See [docs/TECH_STACK.md](./docs/TECH_STACK.md) for detailed technology decisions.

## 📚 Documentation

- [PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) - Complete phased implementation plan (30 weeks to MVP)
- [TECH_STACK.md](./docs/TECH_STACK.md) - Technology stack and rationale
- [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) - UI/UX guidelines, components, colors
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Database design and entities
- [CURRENT_STATUS.md](./docs/CURRENT_STATUS.md) - Session tracking and progress

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- PostgreSQL 14+
- npm or pnpm

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd evercraft
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up the database

```bash
npm run prisma:migrate
npm run prisma:generate
```

5. Run the development server

```bash
npm run dev
```

6. Open [http://localhost:4000](http://localhost:4000)

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting

### Testing

- `npm test` - Run unit/integration tests (Vitest)
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests (Playwright)
- `npm run test:e2e:ui` - Run E2E tests with UI

### Database

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🏗 Project Structure

```
evercraft/
├── docs/              # Comprehensive project documentation
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components (shadcn/ui + custom)
│   ├── lib/           # Utility functions, helpers
│   ├── generated/     # Generated Prisma Client
│   └── styles/        # Global styles
├── prisma/
│   └── schema.prisma  # Database schema
├── tests/
│   ├── unit/          # Unit tests
│   └── e2e/           # End-to-end tests
├── public/            # Static assets
└── ...config files
```

## 🗓 Development Roadmap

**Phase 0 (Current): Foundation & Design System** (Weeks 1-3)

- ✅ Project setup
- ✅ Documentation structure
- 🚧 UX research (Etsy, Faire)
- 🚧 Design system creation
- 🚧 Database schema design

**Upcoming Phases:**

- **Phase 1:** Authentication & User Management (Weeks 4-5)
- **Phase 2:** Seller Onboarding & Verification (Weeks 6-8) ⭐
- **Phase 3:** Product Listing & Management (Weeks 9-11) ⭐
- **Phase 4:** Product Discovery (Weeks 12-15) ⭐ UI/UX Critical
- **Phase 5:** Shopping Cart & Checkout (Weeks 16-18)
- **Phase 6-9:** Order Management, Reviews, Admin Panel, Analytics

**MVP Launch Target:** Week 30 (~7-8 months)

See [PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) for complete roadmap.

## 🎨 Design Principles

- **Minimalist & Modern:** Clean, white base with dark forest green accents
- **Accessibility First:** WCAG 2.1 AA compliant, keyboard navigation, screen reader friendly
- **Performance:** Lighthouse scores 90+, sub-2s load times
- **Mobile-First:** Optimized for mobile, progressively enhanced for desktop

See [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for detailed guidelines.

## 🤝 Contributing

This project is currently in active development. Contribution guidelines will be added as the project matures.

## 📄 License

TBD

## 🌟 Mission

> "Transitioning mass e-commerce to an eco-friendly alternative, one sustainable product at a time."

We believe in:

- **Transparency:** Honest impact metrics, verified sellers, open sourcing
- **Community:** Supporting makers, nonprofits, and conscious consumers
- **Sustainability:** Environmental responsibility in every decision
- **Excellence:** World-class UX rivaling the best marketplaces

---

**Current Status:** Phase 0 - Foundation (Week 1 of 30)
**Last Updated:** October 5, 2025

For detailed progress tracking, see [CURRENT_STATUS.md](./docs/CURRENT_STATUS.md)
