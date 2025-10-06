# Database Schema

This directory contains the Prisma schema and migrations for Evercraft.

## Schema Overview

The database schema includes **27 models** organized into the following categories:

### Core Entities

- **User**: Multi-role users (buyers, sellers, admins)
- **Shop**: Seller-owned shops with nonprofit partnerships
- **Product**: Product catalog with eco-attributes
- **ProductVariant**: Product variations (size, color, etc.)
- **ProductImage**: Product images with positioning
- **Category**: Hierarchical product categories

### Orders & Payments

- **Order**: Customer orders with nonprofit donations
- **OrderItem**: Individual items in orders
- **Payment**: Payment records via Stripe

### Nonprofits & Impact

- **Nonprofit**: Verified nonprofits for donations
- **Donation**: Donation tracking and payouts
- **Certification**: Eco-certifications (B-Corp, Fair Trade, etc.)
- **SustainabilityScore**: Detailed eco-scoring (0-100 scale)

### User Features

- **Address**: Shipping/billing addresses
- **Favorite**: Saved products
- **Collection**: User-created product collections
- **Review**: Product reviews with photos
- **SellerReview**: Seller/shop reviews
- **Message**: Buyer-seller messaging

### Supporting Entities

- **SellerApplication**: Seller verification applications
- **ShippingProfile**: Seller shipping configurations
- **Promotion**: Coupons and discounts
- **AnalyticsEvent**: Event tracking
- **SearchHistory**: Search query tracking
- **SupportTicket**: Customer support
- **NotificationPreference**: User notification settings

## Key Features

### Eco-Focused Design

- **Sustainability Scoring**: 0-100 algorithm-based scoring
- **Eco Attributes**: Materials, packaging, carbon footprint
- **Certifications**: B-Corp, Fair Trade, Plastic-Free, etc.
- **Nonprofit Integration**: Every shop supports a verified nonprofit

### Performance Optimizations

- Indexes on foreign keys (userId, shopId, productId, etc.)
- Indexes on frequently queried fields (status, createdAt, email)
- Unique constraints for data integrity
- Cascade deletes for referential integrity

### Type Safety

- 8 enums for type-safe status values
- TypeScript types auto-generated from schema
- Strict null checking via optional fields

## Usage

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Create Migration

```bash
npm run prisma:migrate
# or
npx prisma migrate dev --name descriptive_migration_name
```

### Open Prisma Studio

```bash
npm run prisma:studio
# or
npx prisma studio
```

### Reset Database (DESTRUCTIVE)

```bash
npx prisma migrate reset
```

## Database Client

Import the database client from `src/lib/db.ts`:

```typescript
import { db } from '@/lib/db';

// Example query
const users = await db.user.findMany();

// Example with relations
const products = await db.product.findMany({
  include: {
    shop: true,
    category: true,
    images: true,
  },
});
```

## Environment Variables

Required in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/evercraft?schema=public"
```

## Migrations

Migrations are stored in `prisma/migrations/`. Each migration includes:

- SQL migration file
- Metadata about the migration

**Never manually edit migration files** - always use `prisma migrate dev` to create new migrations.

## Schema Validation

Before committing schema changes:

1. Format schema: `npx prisma format`
2. Validate schema: `npx prisma validate`
3. Generate client: `npx prisma generate`
4. Create migration: `npx prisma migrate dev`

## Notes

- Client is generated to `src/generated/prisma` (custom output path)
- Singleton pattern used in `src/lib/db.ts` to prevent multiple instances
- Development mode logs queries for debugging
- Production mode only logs errors

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) - Detailed schema design
- [Next.js + Prisma Best Practices](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
