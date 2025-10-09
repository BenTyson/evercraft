# Evercraft - Eco-Focused Marketplace

## Complete Implementation Plan

**Last Updated:** October 7, 2025
**Status:** Phase 7 - Reviews & Ratings (Complete) ✅
**Completion:** 85% MVP

---

## 📋 Project Overview

Building an Etsy-like marketplace exclusively for eco-conscious sellers, featuring:

- Verified eco-friendly sellers only (application + manual review process)
- Nonprofit donation integration (sellers choose nonprofits, portion of sales donated)
- Sustainability-first features (eco-scoring, carbon tracking, material transparency)
- Beautiful, accessible UI rivaling Etsy/Faire
- Mission: Transition mass e-commerce to eco-friendly alternatives

---

## 🎯 Current Status

### Active Phase

**Current Status: Phase 7 Complete ✅**

Evercraft is 85% complete toward MVP launch. All core features are implemented including authentication, product management, shopping cart, checkout, order fulfillment, nonprofit donations, and the newly completed reviews & ratings system.

**Next Up: Phase 8 - Admin Panel & Platform Management**

### Progress Checklist

- [x] **Phase 0**: Foundation & Design System ✅
  - [x] Etsy/Faire UX research
  - [x] Design system creation
  - [x] High-fidelity mockups
  - [x] Database schema design (27 models)
  - [x] Project setup (Next.js 15, TypeScript, Tailwind v4)
  - [x] CI/CD pipeline
- [x] **Phase 1**: Authentication ✅
  - [x] Clerk integration with role-based access control
- [x] **Phase 2**: Seller Onboarding ✅
  - [x] Seller application and verification system
- [x] **Phase 3**: Product Listing ✅
  - [x] Product CRUD with variants and images
- [x] **Phase 4**: Product Discovery ✅
  - [x] Browse, search, and filter functionality
- [x] **Phase 5**: Shopping Cart & Checkout ✅
  - [x] Zustand cart with Stripe integration
- [x] **Phase 6**: Order Management ✅
  - [x] Order processing, fulfillment, and tracking
- [x] **Phase 7**: Reviews & Ratings ✅
  - [x] Complete review system with ratings, images, helpful votes
- [ ] **Phase 8**: Admin Panel (Weeks 25-27)
- [ ] **Phase 9**: Analytics & Tools (Weeks 28-30)

**MVP Launch Target:** Week 30 (~7-8 months)

---

## 🛠 Tech Stack

### Frontend

- **Framework:** Next.js 15.5.4 (App Router) ✅
- **Language:** TypeScript (strict mode) ✅
- **Styling:** Tailwind CSS v4 (PostCSS) ✅
- **Components:** shadcn/ui (customized) ✅
- **Animations:** Framer Motion 12.23.22 ✅
- **Forms:** React Hook Form + Zod validation ✅
- **State:** Zustand 5.0.8 ✅
- **Utilities:** date-fns 4.1.0 ✅

### Backend

- **API:** Next.js Server Actions (primary) + API Routes ✅
- **Database:** PostgreSQL ✅
- **ORM:** Prisma 6.16.3 ✅
- **Auth:** Clerk 6.33.3 ✅
- **File Upload:** UploadThing 7.7.4 ✅

### Key Services

- **Payments:** Stripe 19.1.0 + Stripe Connect ✅
- **Search:** PostgreSQL full-text (Meilisearch planned)
- **Email:** Resend 6.1.2 ✅
- **Shipping:** Shippo integration (planned)
- **SMS:** Twilio (optional, not implemented)

### Infrastructure

- **Deployment:** Railway ✅
- **CDN:** Railway built-in ✅
- **Monitoring:** Sentry (planned)
- **Analytics:** PostHog (planned)

### Testing & Quality

- **Unit/Integration:** Vitest 3.2.4 + React Testing Library 16.3.0 ✅
- **E2E:** Playwright 1.55.1 ✅
- **Visual Regression:** Chromatic (planned)
- **Linting:** ESLint 9 + Prettier 3.6.2 ✅
- **Git Hooks:** Husky 9.1.7 + lint-staged 16.2.3 ✅

---

## 🎨 Design Direction

### Research Phase (Weeks 1-2)

- **Primary Benchmarks:** Etsy (product discovery, checkout), Faire (wholesale, clean B2B aesthetic)
- **Secondary:** Shopify, Uncommon Goods, The Citizenry
- **Eco-Brand Inspiration:** Patagonia, Reformation, Package Free

### Visual Identity

**Color Palette:**

- **Primary:** White (#FFFFFF) - clean base
- **Secondary:** Soft off-white/cream (#FAFAF8) - warmth
- **Accent:** Dark forest green (#1B4332, #2D6A4F) - eco, trust, premium
- **Text:** Charcoal (#212529) - readability
- **Borders/Dividers:** Subtle gray (#E9ECEF)
- **Success/Impact:** Lighter greens (#52B788, #95D5B2)

**Typography:**

- **Headlines:** Inter, Outfit, or Sohne (clean sans-serif)
- **Body:** Inter or System fonts (high readability)
- **Hierarchy:** Clear size scale, generous line-height

**Visual Style:**

- Abundant white space (breathing room)
- Subtle shadows for elevation (not heavy drop shadows)
- Rounded corners (8px cards, 6px buttons)
- High-quality product photography as hero
- Minimalist iconography (Lucide or Heroicons)
- Smooth micro-interactions (hover states, transitions)
- Grid-based layouts (consistent spacing system)

### Standards

- **Mobile-First:** 60%+ of e-commerce is mobile
- **Accessibility:** WCAG 2.1 AA compliant
- **Performance:** Lighthouse scores 90+ (all metrics)
- **SEO:** Structured data, meta tags, Core Web Vitals

---

## 📅 Detailed Phase Breakdown

### **Phase 0: Foundation & Design System (Weeks 1-3)**

#### Week 1-2: Research & Design

- [ ] Competitive UX analysis (Etsy, Faire)
  - User flows (signup, product discovery, checkout)
  - Information architecture
  - Navigation patterns
  - Mobile UX
- [ ] Create design system
  - Color palette and tokens
  - Typography scale
  - Spacing system (4px base)
  - Component variants
  - Icon library selection
- [ ] High-fidelity mockups (Figma/similar)
  - Homepage (hero, featured, impact metrics)
  - Product listing page (grid, filters)
  - Product detail page (gallery, eco-info, seller card)
  - Shopping cart (slide-out + full page)
  - Checkout flow (multi-step)
  - Seller dashboard
  - Admin panel

#### Week 3: Technical Foundation

- [ ] Initialize Next.js 14 project (App Router)
- [ ] Configure TypeScript (strict mode)
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Install Framer Motion
- [ ] Configure testing framework
  - Vitest for unit/integration
  - Playwright for E2E
  - React Testing Library
- [ ] Set up ESLint + Prettier
- [ ] Configure Husky + lint-staged
- [ ] Database schema design (ERD)
- [ ] Railway deployment pipeline
- [ ] Environment configuration (.env.example)

**Deliverables:**

- ✅ Complete design system documentation
- ✅ High-fidelity mockups for all core pages
- ✅ Database schema (ERD with all entities)
- ✅ Project boilerplate with testing
- ✅ CI/CD pipeline configured

---

### **Phase 1: Authentication & User Management (Weeks 4-5)**

#### User Authentication

- [ ] Choose auth provider (Clerk vs NextAuth.js)
- [ ] Email/password registration & login
- [ ] OAuth integration (Google, Apple, Facebook)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA) for sellers

#### User Profiles & Roles

- [ ] Role-based access control (RBAC)
  - Buyer role
  - Seller role
  - Admin role
- [ ] Buyer profile
  - Personal information
  - Saved addresses (multiple)
  - Payment methods
  - Preferences (email notifications, etc.)
  - Impact tracking dashboard
- [ ] Seller profile
  - Shop name, bio, story
  - Eco-credentials display
  - Avatar/logo upload
- [ ] Avatar upload with image optimization

#### Testing

- [ ] Unit tests for auth flows
- [ ] E2E tests (registration, login, password reset)
- [ ] Security testing (rate limiting, injection prevention)
- [ ] Test coverage: 90%+

**Deliverables:**

- ✅ Complete authentication system
- ✅ User profile management (buyer & seller)
- ✅ Role-based access control
- ✅ 90%+ test coverage

---

### **Phase 2: Seller Onboarding & Verification (Weeks 6-8)** ⭐ Critical

#### Seller Application System

- [ ] Multi-step application form
  - Business information (name, EIN, address)
  - Eco-practices questionnaire
    - Materials used
    - Sourcing practices
    - Production methods
    - Packaging approach
    - Carbon footprint awareness
  - Sustainability certifications upload (PDF/images)
  - Product samples/portfolio (images)
  - Story/mission statement (rich text)
- [ ] Form validation (client + server)
- [ ] Draft saving (auto-save progress)
- [ ] Application submission

#### Admin Review System

- [ ] Admin review dashboard
  - Application queue (pending, under review, approved, rejected)
  - Filter and search applications
  - Detailed application view
- [ ] Approval/rejection workflow
  - Review checklist
  - Internal notes
  - Feedback system (if rejected)
- [ ] Email notifications at each stage
  - Application received
  - Under review
  - Approved (with next steps)
  - Rejected (with reason)

#### Seller Dashboard - Initial Setup

- [ ] Shop customization
  - Shop name
  - Banner image upload
  - Logo upload
  - Shop colors (limited customization)
  - About/story (rich text editor)
- [ ] Nonprofit selection system
  - Browse verified nonprofits by category
    - Environment
    - Social justice
    - Education
    - Animal welfare
    - Community development
  - Search nonprofits
  - View nonprofit profiles (mission, impact metrics, images)
  - Select nonprofit
  - Set donation percentage (with platform minimum, e.g., 1%)
- [ ] Stripe Connect onboarding
  - Connect bank account
  - Verify identity
  - Tax information (W-9)
- [ ] Shipping profiles setup
  - Domestic shipping
  - International (optional)
  - Free shipping thresholds
  - Processing time
- [ ] Policy templates
  - Returns & exchanges
  - Shipping policy
  - Privacy policy

#### Nonprofit Management System

- [ ] Nonprofit database
  - Name, EIN, contact
  - Mission statement
  - Impact metrics
  - Categories
  - Images (logo, photos)
  - Website, social media
- [ ] Nonprofit verification (admin)
  - 501(c)(3) status verification
  - Approval workflow
- [ ] Nonprofit profiles (public-facing)
- [ ] API for nonprofit data
- [ ] Donation tracking and reporting

#### Testing

- [ ] Application flow E2E tests
- [ ] Admin dashboard functionality tests
- [ ] Stripe Connect integration tests (test mode)
- [ ] Nonprofit selection tests
- [ ] Form validation tests

**Deliverables:**

- ✅ Complete seller application and verification system
- ✅ Seller shop setup flow
- ✅ Nonprofit selection and management
- ✅ Stripe Connect integration
- ✅ Admin review tools

---

### **Phase 3: Product Listing & Management (Weeks 9-11)** ⭐ Critical

#### Product Creation Interface (Seller-side)

- [ ] Multi-image upload
  - Drag-and-drop interface
  - Image cropping/editing
  - Reordering images
  - Set primary image
  - Max 10 images per product
- [ ] Product information
  - Title (max 140 chars)
  - Description (rich text, max 5000 chars)
  - Price (USD)
  - SKU (auto-generate option)
  - Compare-at price (for sales)
- [ ] Variants system
  - Size, color, custom options
  - Variant-specific pricing
  - Variant-specific images
  - Variant SKUs
- [ ] Inventory management
  - Stock quantity (by variant)
  - Unlimited stock option
  - Track inventory checkbox
- [ ] Category and tags
  - Primary category (dropdown, hierarchical)
  - Secondary categories (multi-select)
  - Tags (free-form, suggestions)
- [ ] Eco-attributes
  - Materials used (dropdown + custom)
    - Organic cotton
    - Recycled materials
    - Bamboo
    - Hemp
    - Reclaimed wood
    - Custom entry
  - Sustainability certifications
    - GOTS, Fair Trade, B-Corp, etc.
    - Upload verification docs
  - Packaging type
    - Plastic-free
    - Compostable
    - Recycled
    - Minimal
  - Production method
    - Handmade
    - Small batch
    - Made to order
    - Locally sourced
  - Carbon footprint estimate (optional calculator)
  - Care instructions (for product longevity)
- [ ] Shipping profiles assignment
- [ ] Product status (draft, active, sold out, archived)
- [ ] SEO fields (meta title, description)

#### Bulk Upload

- [ ] CSV template generation
- [ ] CSV import with validation
- [ ] Error reporting
- [ ] Preview before import
- [ ] Bulk edit existing products

#### Inventory Management

- [ ] Real-time stock tracking
- [ ] Low stock alerts (configurable threshold)
- [ ] Variant-level inventory
- [ ] Auto-deactivation when sold out
- [ ] Inventory history/logs

#### Product Sustainability Scoring

- [ ] Algorithm for eco-score (0-100)
  - Materials: 30%
  - Certifications: 25%
  - Packaging: 20%
  - Production method: 15%
  - Carbon footprint: 10%
- [ ] Badge system
  - Bronze (50-69)
  - Silver (70-89)
  - Gold (90-100)
- [ ] Admin tools to adjust scoring weights

#### Testing

- [ ] Product creation flow tests
- [ ] Image upload and optimization tests
- [ ] Inventory management tests
- [ ] Variant handling tests (complex scenarios)
- [ ] Bulk upload validation tests
- [ ] Eco-scoring algorithm tests

**Deliverables:**

- ✅ Complete product listing system
- ✅ Image handling and optimization
- ✅ Variants and inventory management
- ✅ Sustainability scoring algorithm
- ✅ Bulk upload capability
- ✅ Comprehensive testing

---

### **Phase 4: Customer-Facing Product Discovery (Weeks 12-15)** ⭐ UI/UX Excellence Critical

#### Homepage

- [ ] Hero section
  - Mission statement
  - Primary CTA (Shop Now, Sell with Us)
  - Background image/video (eco-focused)
- [ ] Featured collections carousel
  - Curated eco-categories
  - "Plastic-Free Living"
  - "Zero Waste Kitchen"
  - "Sustainable Fashion"
  - "Eco Home Decor"
- [ ] Seller spotlight section
  - Rotating featured sellers
  - Shop link, story preview
- [ ] Platform impact metrics (real-time)
  - Total products sold
  - CO2 emissions saved
  - Total donated to nonprofits
  - Trees planted (if applicable)
- [ ] Featured nonprofits section
- [ ] Trending eco-products grid
- [ ] Editorial content/blog preview
- [ ] Newsletter signup (sticky or footer)
- [ ] Social proof (testimonials, press mentions)

#### Search & Filter System (Meilisearch)

- [ ] Search bar (prominent, accessible)
  - Autocomplete suggestions
  - Recent searches
  - Popular searches
  - Category suggestions
- [ ] Typo-tolerant search
- [ ] Advanced filters (sidebar)
  - Price range (slider)
  - Category/subcategory (hierarchical)
  - Eco-score (slider or checkboxes)
  - Materials (multi-select)
  - Certifications (multi-select)
  - Local sellers (zip code proximity)
  - Shipping speed (same day, 1-3 days, etc.)
  - On sale (checkbox)
  - Free shipping (checkbox)
  - In stock only (checkbox)
- [ ] Sort options
  - Relevance (default)
  - Price: Low to High
  - Price: High to Low
  - Newest
  - Best Selling
  - Highest Eco-Score
- [ ] Save searches (logged-in users)
- [ ] Filter combinations persist in URL

#### Product Listing Page (Grid View)

- [ ] Responsive grid (1-4 columns based on screen)
- [ ] Infinite scroll or pagination
- [ ] Product cards
  - Primary image (hover shows second image)
  - Title (truncated)
  - Price
  - Eco-badge (if high score)
  - Seller name (linked)
  - Quick view button (modal)
  - Favorite icon (heart)
- [ ] Quick view modal
  - Image carousel
  - Add to cart
  - Key details
  - View full details link
- [ ] Filter summary (active filters shown, removable chips)
- [ ] Grid/list view toggle
- [ ] Results count
- [ ] Mobile: collapsible filter drawer

#### Product Detail Page (PDP)

- [ ] Image gallery
  - Carousel with thumbnails
  - Zoom on hover/click
  - 360° view support (if available)
  - Fullscreen mode
- [ ] Product information
  - Title
  - Price (with compare-at if on sale)
  - Star rating + review count (linked)
  - Stock status (in stock, low stock, sold out)
- [ ] Variant selection
  - Size/color swatches
  - Real-time availability check
  - Disabled variants (sold out)
- [ ] Quantity selector
- [ ] Add to cart button (sticky on mobile)
- [ ] Add to favorites button
- [ ] Eco-information section (accordion or tabs)
  - Sustainability score with explanation
  - Materials breakdown (visual)
  - Certifications with verification links
  - Carbon footprint estimate
  - Packaging information
  - Care/longevity tips
- [ ] Seller information card
  - Shop name (linked)
  - Avatar
  - Follower count
  - Quick shop preview
  - Follow button
  - Contact button
- [ ] Nonprofit badge
  - Show which nonprofit receives %
  - Link to nonprofit profile
- [ ] Shipping & returns information
  - Estimated delivery
  - Shipping cost (or free)
  - Return policy summary
- [ ] Reviews & ratings section
  - Star distribution chart
  - Verified purchase badges
  - Photo reviews
  - Sort/filter reviews
  - Pagination
- [ ] "Similar items" recommendations (carousel)
- [ ] "Shop this seller's other products" (carousel)
- [ ] Social sharing buttons
- [ ] Breadcrumb navigation
- [ ] Product schema markup (SEO)

#### Seller Shop Page

- [ ] Shop header
  - Banner image
  - Logo
  - Shop name
  - Follow button
  - Follower count
  - Message seller button
- [ ] Seller story and mission (rich text)
- [ ] Eco-credentials display (badges)
- [ ] Selected nonprofit showcase
  - Nonprofit logo and name
  - Link to nonprofit profile
  - Total donated by this seller
- [ ] Product grid (filterable by category, sort)
- [ ] Shop announcements (pinned message)
- [ ] Policies section (expandable)
  - Returns & exchanges
  - Shipping info
  - Processing time
- [ ] Shop reviews (separate from product reviews)
  - Overall shop rating
  - Review list
- [ ] Social media links
- [ ] Report shop button (if policy violations)

#### Category & Collection Pages

- [ ] Category hierarchy navigation (breadcrumbs)
- [ ] Category hero image/banner
- [ ] Editorial description (rich text, SEO)
- [ ] Curated collections
  - "Plastic-Free Living"
  - "Zero Waste Kitchen"
  - Custom collections
- [ ] Featured sellers in category
- [ ] Product grid (with filters)

#### Testing

- [ ] Search performance tests (< 100ms results)
- [ ] Filter combination tests (all permutations)
- [ ] Page load performance (Lighthouse 90+)
- [ ] Mobile responsiveness (all breakpoints)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] E2E user journeys
  - Homepage → search → PDP → cart
  - Homepage → collection → PDP
  - Seller shop → product → cart
- [ ] Image lazy loading tests
- [ ] Schema markup validation

**Deliverables:**

- ✅ Beautiful, high-converting homepage
- ✅ Fast, accurate search and filtering (Meilisearch)
- ✅ Exceptional product detail pages
- ✅ Engaging seller shop pages
- ✅ Intuitive category/collection browsing
- ✅ Lighthouse scores 90+ (all metrics)
- ✅ Mobile-first responsive design
- ✅ WCAG 2.1 AA compliant

---

### **Phase 5: Shopping Cart & Checkout (Weeks 16-18)**

#### Shopping Cart

- [ ] Cart functionality
  - Add/remove items
  - Update quantity
  - Save for later (move to wishlist)
  - Cart persistence (logged-in: DB, guest: localStorage)
- [ ] Multi-seller cart handling
  - Group items by shop
  - Separate checkout per shop (if needed)
  - Show shipping cost per shop
- [ ] Cart UI
  - Slide-out cart overlay (mini cart)
  - Full cart page
  - Item thumbnails, titles, variants
  - Price breakdown
- [ ] Shipping cost estimation
  - By shop (if different sellers)
  - Update on zip code entry
- [ ] Nonprofit donation preview
  - Show per-shop donation
  - Total platform impact
- [ ] Subtotal calculations
  - Items subtotal
  - Estimated shipping
  - Estimated tax (if applicable)
  - Total
- [ ] Promo code field (placeholder for Phase 9)
- [ ] Cart abandonment tracking
- [ ] Abandoned cart recovery emails
  - 1 hour after abandonment
  - 24 hours after
  - Include cart contents

#### Checkout Flow (Multi-step)

- [ ] Guest checkout option
  - Email input
  - Create account prompt (optional)
- [ ] Shipping address
  - Google autocomplete
  - Save multiple addresses (logged-in)
  - Billing same as shipping (checkbox)
- [ ] Shipping method selection (per shop)
  - Standard shipping
  - Expedited shipping
  - **Green shipping option** (carbon-neutral with offset cost)
  - Estimated delivery date
- [ ] Order review step
  - All items (grouped by shop)
  - Shipping addresses
  - Shipping methods
  - Edit links
- [ ] Payment
  - Stripe Elements (cards)
  - Apple Pay
  - Google Pay
  - Save card for future (checkbox)
- [ ] Tip the seller option (optional, per shop)
  - Suggested amounts ($1, $2, $5, custom)
- [ ] Additional nonprofit donation
  - Round-up to nearest dollar
  - Custom amount
  - Select different nonprofit (override seller's choice)
- [ ] Order notes (optional)
- [ ] Gift options
  - Gift wrap (if seller offers)
  - Gift message
  - Ship to different address
- [ ] Terms & conditions acceptance (checkbox)
- [ ] Place order button (loading state)

#### Stripe Connect Payment Flow

- [ ] Split payment logic
  - Seller portion (minus platform fee)
  - Platform fee (commission)
  - Nonprofit donation (from seller's portion)
  - Additional buyer donation (separate)
- [ ] Payment hold (funds released on delivery confirmation or X days)
- [ ] Failed payment handling
  - Error messages
  - Retry logic
  - Save cart state
- [ ] Refund handling
  - Full refund
  - Partial refund
  - Split refund logic (seller, platform, nonprofit)

#### Order Confirmation

- [ ] Confirmation page
  - Order number
  - Order summary (items, shipping, payment)
  - Estimated delivery
  - Seller contact info
- [ ] Impact summary
  - Carbon offset from green shipping
  - Nonprofit contribution
  - Eco-score of purchase
- [ ] Email receipt (beautiful template)
  - Order details
  - Shipping tracking (when available)
  - Download invoice link
- [ ] Download invoice/receipt (PDF)

#### Testing

- [ ] Cart functionality tests (add, remove, update)
- [ ] Checkout flow E2E (multiple scenarios)
  - Guest checkout
  - Logged-in checkout
  - Multi-seller checkout
  - With/without green shipping
  - With/without additional donation
- [ ] Payment integration tests (Stripe test mode)
  - Successful payment
  - Failed payment
  - 3D Secure
- [ ] Split payment calculation tests
- [ ] Promo code validation tests (prep for Phase 9)
- [ ] Abandoned cart email tests
- [ ] Mobile checkout UX tests

**Deliverables:**

- ✅ Seamless cart experience (mini cart + full page)
- ✅ Optimized checkout flow (minimal friction)
- ✅ Stripe Connect integration with split payments
- ✅ Green shipping options
- ✅ Nonprofit donation options (seller + buyer)
- ✅ Robust payment and error handling
- ✅ Beautiful order confirmation
- ✅ Comprehensive testing

---

### **Phase 6: Order Management & Fulfillment (Weeks 19-21)**

#### Buyer Order Management

- [ ] Order history page
  - List all orders
  - Filter (status, date range)
  - Search (order number, seller name)
- [ ] Order detail view
  - Order number, date
  - Items (with images, variants)
  - Seller information
  - Shipping address
  - Payment method (last 4 digits)
  - Order status (processing, shipped, delivered, cancelled)
  - Tracking information (if available)
- [ ] Track shipment
  - Carrier integration (real-time tracking)
  - Status timeline (ordered → shipped → out for delivery → delivered)
  - Estimated delivery date
- [ ] Download invoice (PDF)
- [ ] Request cancellation (before shipped)
- [ ] Contact seller (message button)
- [ ] Leave review (after delivery)
  - Product review
  - Seller review

#### Seller Order Management

- [ ] Order dashboard
  - Tabs: New, Processing, Shipped, Completed, Cancelled
  - Order count per tab
  - Filters and search
- [ ] Order notifications
  - Email (new order)
  - In-app notification (badge)
  - SMS (optional, high priority)
- [ ] Order detail view (seller perspective)
  - Buyer information (name, shipping address)
  - Items ordered
  - Payment status (pending, paid, refunded)
  - Shipping method selected by buyer
  - Order notes from buyer
- [ ] Print packing slip
  - Formatted for printing
  - Include order details, items, shipping address
  - Barcode (order number)
- [ ] Print shipping label (Shippo/EasyPost integration)
  - Select carrier (USPS, UPS, FedEx)
  - Select service (First Class, Priority, etc.)
  - Generate label (PDF)
  - Cost displayed
  - Deducted from seller balance or charged
- [ ] Mark as shipped
  - Upload tracking number
  - Select carrier
  - Estimated delivery date
  - Automatic buyer notification
- [ ] Bulk order processing
  - Select multiple orders
  - Bulk print packing slips
  - Bulk print shipping labels (same weight/size)
  - Bulk mark as shipped (CSV upload with tracking)
- [ ] Cancellation/refund handling
  - Approve/deny cancellation requests
  - Initiate refund (full or partial)
  - Reason for refund (dropdown)
  - Automatic Stripe refund processing
- [ ] Order analytics (basic)
  - Total orders today/week/month
  - Revenue (after fees)
  - Average order value

#### Shipping Integration (Shippo or EasyPost)

- [ ] Account setup (API keys)
- [ ] Real-time shipping rates (checkout)
- [ ] Label generation
  - USPS, UPS, FedEx support
  - International shipping
  - Insurance options
- [ ] Tracking number automation
  - Auto-update order status on scan
  - Push notifications to buyer
- [ ] Carrier selection logic (cheapest, fastest)
- [ ] Address validation (prevent errors)
- [ ] Return label generation (if applicable)

#### Notifications System

- [ ] Email notifications (Resend)
  - Order placed (buyer, seller)
  - Payment received (seller)
  - Order shipped (buyer, with tracking)
  - Out for delivery (buyer)
  - Delivered (buyer, with review request)
  - Order cancelled (buyer, seller)
  - Refund processed (buyer)
- [ ] In-app notifications
  - Bell icon with badge
  - Notification center
  - Mark as read
  - Notification preferences
- [ ] SMS notifications (Twilio, optional)
  - Order shipped (buyer)
  - Delivered (buyer)
  - Opt-in required
- [ ] Notification preferences management
  - Email on/off per type
  - SMS on/off per type
  - In-app on/off per type

#### Testing

- [ ] Order flow tests (buyer perspective)
  - View orders
  - Track shipment
  - Request cancellation
  - Download invoice
- [ ] Order flow tests (seller perspective)
  - Receive order
  - Print packing slip
  - Generate shipping label
  - Mark as shipped
  - Process refund
- [ ] Shipping integration tests (Shippo/EasyPost test mode)
  - Rate calculation
  - Label generation
  - Tracking updates
- [ ] Notification delivery tests (all channels)
- [ ] Bulk processing tests
- [ ] Edge cases (cancellation before ship, refund scenarios)

**Deliverables:**

- ✅ Complete buyer order management
- ✅ Complete seller order fulfillment tools
- ✅ Shipping label integration (Shippo/EasyPost)
- ✅ Real-time tracking automation
- ✅ Multi-channel notification system
- ✅ Bulk processing capabilities
- ✅ Comprehensive testing

---

### **Phase 7: Reviews, Ratings & Social Features (Weeks 22-24)**

#### Review System ✅ COMPLETED

- [x] Product reviews ✅
  - Star rating (1-5)
  - Review text (min 10 chars, max 1000)
  - Photo upload (optional, via UploadThing)
  - Verified purchase badge (automatic)
- [x] Review submission ✅
  - Review form (accessible from product page and order history)
  - Edit review (anytime for own reviews)
  - Delete review functionality
- [x] Helpful voting ✅
  - Mark as helpful button
  - Helpful count display
  - Sort by most helpful
- [x] Review filtering and sorting ✅
  - Filter: all reviews, verified purchases only
  - Sort: most recent, highest rated, most helpful
- [x] Review aggregation ✅
  - Average rating calculation
  - Star distribution display
  - Total review count
- [x] User review management ✅
  - View all own reviews at `/account/reviews`
  - Edit/delete functionality with confirmation
  - Product context and links

**Not Implemented (Future):**

- [ ] Seller reviews (separate from product)
- [ ] Review moderation (profanity filter, flagging)
- [ ] Seller response to reviews
- [ ] Post-delivery email prompts

#### Favorites & Collections

- [ ] Favorite products
  - Heart icon (product cards, PDP)
  - Favorites page (grid view)
  - Remove from favorites
  - Stock status on favorites
  - Price drop notifications (optional)
- [ ] Favorite shops (follow sellers)
  - Follow button (shop page, seller card)
  - Followers page (list)
  - New product notifications from followed shops
- [ ] Custom collections
  - Create collection (name, description, privacy)
  - Public or private collections
  - Add products to collections
  - Reorder products (drag-drop)
  - Cover image (auto or manual)
  - Share collections (URL)
- [ ] Collection recommendations
  - "People also saved" (collaborative filtering)
  - Curated platform collections

#### Social Features

- [ ] Share products
  - Social media (Facebook, Twitter, Pinterest, Instagram)
  - Email (send to friend)
  - Copy link (clipboard)
  - QR code generation (optional)
- [ ] Referral program (eco-incentives)
  - Unique referral link (per user)
  - Referee gets discount (e.g., $10 off first order)
  - Referrer gets credit (e.g., $10 after referee's purchase)
  - Track referrals (dashboard)
  - Leaderboard (top referrers)
- [ ] Gift registry
  - Create registry (wedding, baby, etc.)
  - Add products from site
  - Share registry link
  - Mark items as purchased (hide from others)
- [ ] Wishlists
  - Create multiple wishlists
  - Share wishlist
  - Add to cart from wishlist

#### Messaging System (Buyer-Seller)

- [ ] Message threads
  - Per order (order-specific questions)
  - General (pre-purchase questions)
  - Threaded conversations
- [ ] Compose message
  - To/from (buyer ↔ seller)
  - Subject (optional)
  - Message body (rich text, max 5000 chars)
  - Attachment support (images, PDFs, max 5MB)
- [ ] Message inbox
  - Unread badge
  - Filter (unread, archived, order-related)
  - Search messages
- [ ] Canned responses (seller)
  - Pre-written templates
  - Quick insert
  - Variables (buyer name, order number, etc.)
- [ ] Message notifications
  - Email (immediate)
  - In-app (badge)
  - SMS (optional)
- [ ] Spam/abuse reporting
  - Report button
  - Admin review queue
  - Auto-suspend for repeated offenses

#### Testing

- [ ] Review submission tests (product, seller)
- [ ] Review moderation workflow tests
- [ ] Seller response tests
- [ ] Helpful voting tests
- [ ] Favorites/collections CRUD tests
- [ ] Messaging system tests (send, receive, attachments)
- [ ] Canned response tests
- [ ] Social sharing tests (metadata, Open Graph)
- [ ] Referral program logic tests
- [ ] Gift registry tests

**Deliverables (Actual):**

- ✅ Complete product review system with ratings, images, and helpful votes
- ✅ User review management interface at `/account/reviews`
- ✅ Review aggregation with statistics and filtering
- ✅ Server Actions implementation (`/src/actions/reviews.ts` - 520+ lines)
- ✅ UI Components: StarRating, ReviewForm, ProductReviews, UserReviewsList
- ✅ Integration with existing order system for verified purchases

**Deferred to Future Phases:**

- Seller reviews (separate system)
- Review moderation tools
- Favorites and collections
- Buyer-seller messaging
- Social sharing and referral program
- Gift registry and wishlists

---

### **Phase 8: Admin Panel & Platform Management (Weeks 25-27)**

#### Admin Dashboard (Overview)

- [ ] Platform metrics overview
  - GMV (Gross Merchandise Value) - today, week, month, year
  - Active sellers (total, new this month)
  - Active buyers (total, new this month)
  - Total orders (today, week, month)
  - Revenue (platform fees)
  - Platform impact metrics
    - Total donated to nonprofits
    - Total carbon offset
    - Products sold
- [ ] Real-time activity feed
  - New orders
  - New sellers
  - New reviews
  - Flagged content
- [ ] Charts and visualizations
  - Revenue trend (line chart)
  - Order volume (bar chart)
  - Top categories (pie chart)
  - Seller growth (line chart)
- [ ] Alerts and notifications
  - Low system health
  - High error rates
  - Pending moderation items
  - Policy violations

#### User Management

- [ ] User list (all users)
  - Search by name, email, ID
  - Filter by role (buyer, seller, admin)
  - Filter by status (active, suspended, banned)
  - Sort by date joined, last active, orders, revenue
- [ ] User detail view
  - Personal information
  - Order history
  - Review history
  - Message history
  - Account status
  - Activity logs
- [ ] User actions
  - Suspend account (temporary)
  - Ban account (permanent)
  - Reinstate account
  - Reset password
  - Send email to user
  - Impersonate user (for support, with logging)
- [ ] Activity logs (per user)
  - Login history
  - Order history
  - Admin actions taken

#### Seller Management

- [ ] Seller application queue
  - Pending applications (sortable by date)
  - Under review (assigned to admin)
  - Application detail view
    - All submitted information
    - Uploaded documents (view inline)
    - Checklist for review
    - Internal notes (admin-only)
  - Approve action
    - Send welcome email
    - Grant seller access
  - Reject action
    - Provide feedback/reason
    - Send rejection email
- [ ] Seller list (all sellers)
  - Search by shop name, owner name
  - Filter by verification status, performance
  - Sort by revenue, orders, rating
- [ ] Seller detail view
  - Shop information
  - Owner information
  - Verification status (eco-credentials)
  - Performance metrics
    - Total sales
    - Order count
    - Average rating
    - Response time
    - Fulfillment time
  - Policy violations log
  - Stripe Connect status
- [ ] Seller actions
  - Revoke verification (if policy violation)
  - Suspend shop (temporary)
  - Ban shop (permanent)
  - Adjust commission rate (special cases)
  - Feature shop (homepage, collections)

#### Product Moderation

- [ ] Flagged products queue
  - User-reported products
  - Automated flags (prohibited keywords, etc.)
  - Review product details
  - Approve or remove
- [ ] Product search (all products)
  - Search by title, SKU, seller
  - Filter by status, category, eco-score
- [ ] Product actions
  - Approve product
  - Remove product (with reason)
  - Feature product (homepage, collections)
  - Adjust eco-score (override)
- [ ] Category management
  - Add/edit/delete categories
  - Hierarchical structure
  - Category images
  - SEO fields (meta title, description)
- [ ] Tag management
  - View all tags
  - Merge duplicate tags
  - Delete unused tags

#### Nonprofit Management

- [ ] Nonprofit list
  - Search by name, category
  - Filter by verification status
  - Sort by total donations received
- [ ] Add/edit nonprofits
  - Name, EIN, contact
  - Mission, impact metrics
  - Categories
  - Images (logo, photos)
  - Website, social links
- [ ] Nonprofit verification
  - Upload 501(c)(3) determination letter
  - Admin review and approval
  - Verification badge
- [ ] Donation tracking
  - Total donations per nonprofit
  - Donations by seller
  - Donation history (transaction log)
- [ ] Payout management
  - Schedule payouts (monthly)
  - Payout history
  - Payout status (pending, completed, failed)
- [ ] Impact reporting
  - Generate nonprofit impact reports
  - Exportable (PDF, CSV)

#### Content Management

- [ ] Homepage content editing
  - Hero section (headline, image, CTA)
  - Featured collections (select products)
  - Featured sellers (select shops)
  - Impact metrics (manual override if needed)
  - Testimonials
- [ ] Collection curation
  - Create curated collections
  - Add products manually or by criteria
  - Collection images and descriptions
  - Publish/unpublish
- [ ] Blog/editorial management
  - Create/edit articles
  - Author assignment
  - Categories and tags
  - Publish/unpublish
  - SEO fields
- [ ] Email template management
  - Edit transactional email templates
  - Preview before sending
  - Variables (name, order number, etc.)
- [ ] Policy page management
  - Terms of Service (editable)
  - Privacy Policy (editable)
  - Seller Agreement (editable)
  - Version history (track changes)

#### Financial Management

- [ ] Transaction logs (all transactions)
  - Order ID, date, buyer, seller
  - Amount, platform fee, nonprofit donation
  - Status (paid, refunded, pending)
  - Export to CSV
- [ ] Fee configuration
  - Listing fee (if any)
  - Transaction fee percentage
  - Payment processing fee
  - Promotional pricing (temporary fee reduction)
- [ ] Payout management (sellers)
  - Pending payouts (calculated)
  - Payout schedule (weekly, monthly)
  - Payout history
  - Failed payouts (retry mechanism)
- [ ] Refund tracking
  - All refunds (order ID, amount, reason)
  - Partial vs full refunds
  - Refund breakdown (seller, platform, nonprofit)
- [ ] Tax reporting tools
  - 1099-K generation for sellers (automated)
  - Export seller earnings (CSV for tax prep)
  - Platform revenue reports
- [ ] Financial reports
  - Revenue report (platform fees by period)
  - Seller earnings report (top earners, trends)
  - Nonprofit donation report (by nonprofit, by period)
  - Refund report (trends, reasons)
  - Export all reports (PDF, CSV)

#### Support Tools

- [ ] Support ticket system integration
  - View all tickets (if using Zendesk, Intercom, etc.)
  - Or build basic ticket system:
    - Ticket list (pending, in progress, resolved)
    - Assign to admin
    - Respond to ticket
    - Internal notes
    - Close ticket
- [ ] User search (quick support lookup)
  - Search by email, order number
  - Quick view of user/order details
- [ ] Common issues documentation
  - Internal knowledge base
  - How-to guides for admins
  - Escalation procedures
- [ ] Ban/suspension management
  - View all suspended/banned users
  - Reason for action
  - Reinstatement requests
  - Appeal process

#### Testing

- [ ] Admin dashboard data accuracy tests
- [ ] User/seller management action tests
- [ ] Application review workflow tests
- [ ] Product moderation tests
- [ ] Nonprofit management tests
- [ ] Financial calculation tests (fees, payouts, refunds)
- [ ] Report generation tests (accuracy, export formats)
- [ ] Permission tests (admin-only access)

**Deliverables:**

- ✅ Comprehensive admin dashboard with metrics
- ✅ User and seller management tools
- ✅ Product and content moderation system
- ✅ Nonprofit management and donation tracking
- ✅ Financial management and reporting
- ✅ Support tools and ticket system
- ✅ Robust testing and permissions

---

### **Phase 9: Analytics & Seller Tools (Weeks 28-30)**

#### Seller Analytics Dashboard

- [ ] Sales overview
  - Revenue chart (daily, weekly, monthly, yearly)
  - Order count (by period)
  - Average order value (AOV)
  - Comparison to previous period (% change)
- [ ] Revenue and fees breakdown
  - Gross sales
  - Platform fees (itemized)
  - Payment processing fees
  - Nonprofit donations (sent)
  - Net earnings
- [ ] Traffic analytics
  - Shop views (total, unique)
  - Product views (by product)
  - Traffic sources (direct, search, social, referral)
  - Referrer domains
- [ ] Conversion metrics
  - Shop conversion rate (views → orders)
  - Product conversion rate (views → adds to cart)
  - Cart abandonment rate
  - Top converting products
- [ ] Best-selling products
  - Rank by revenue
  - Rank by units sold
  - Rank by views
- [ ] Customer demographics (anonymized)
  - Top buyer locations (city, state)
  - New vs returning customers
  - Average customer lifetime value
- [ ] Nonprofit impact (for seller)
  - Total donated to selected nonprofit
  - Number of orders contributing
  - Impact metrics (if nonprofit provides data)
- [ ] Environmental impact (calculated)
  - Eco-score of products sold
  - Estimated carbon footprint saved
  - Materials breakdown (organic, recycled, etc.)
- [ ] Export data
  - CSV export (sales, products, customers)
  - PDF reports (weekly, monthly, yearly)
  - Scheduled reports (email delivery)

#### Seller Marketing Tools

- [ ] Coupon/discount creation
  - Discount type (percentage, fixed amount)
  - Applies to (all products, specific products, categories)
  - Minimum purchase requirement
  - Usage limit (total, per customer)
  - Expiration date
  - Coupon code (auto-generate or custom)
- [ ] Sales and promotions
  - Flash sales (time-limited)
  - BOGO (Buy One Get One)
  - Free shipping threshold
  - Bundle deals (buy 3, save 10%)
- [ ] Scheduled promotions
  - Set start and end dates
  - Automatic activation/deactivation
  - Preview promotional pricing
- [ ] Email marketing to followers
  - Compose email (rich text)
  - Subject line
  - Preview before send
  - Send to all followers or segment
  - Track open rates, click rates
- [ ] Social media integration
  - Connect Instagram, Facebook, Pinterest
  - Product catalog sync
  - Shoppable posts (future)
- [ ] Shop announcement management
  - Create announcements (sales, holidays, shipping delays)
  - Pin to shop page
  - Expiration date
- [ ] SEO tools
  - Meta title/description editor (per product)
  - Keyword suggestions (based on category)
  - SEO score (basic analysis)
  - Sitemap inclusion

#### Customer Analytics (For Buyers)

- [ ] Personal impact dashboard
  - Total spent on eco-products
  - Carbon footprint saved (estimated)
  - Nonprofits supported (list with amounts)
  - Waste diverted (packaging stats)
  - Trees planted (if applicable)
- [ ] Purchase history analysis
  - Total orders
  - Favorite categories
  - Average order value
  - Repeat purchase rate
- [ ] Personalized recommendations
  - Based on browsing history
  - Based on purchase history
  - Collaborative filtering (similar users)
- [ ] Eco-score tracking over time
  - Average eco-score of purchases
  - Trend chart (improving sustainability)
  - Goals and achievements

#### Platform Analytics (Public-Facing)

- [ ] Live impact counter (homepage)
  - Total products sold (odometer animation)
  - Total CO2 saved
  - Total donated to nonprofits
  - Trees planted (if applicable)
  - Updates in real-time (or near real-time)
- [ ] Platform impact page
  - Detailed breakdown of impact
  - Charts and visualizations
  - Stories from nonprofits
  - Seller success stories
- [ ] Community impact reports (quarterly)
  - PDF download
  - Infographic format
  - Share on social media

#### Testing

- [ ] Analytics calculation accuracy tests
  - Revenue, fees, conversions
  - Traffic and sources
  - Impact metrics
- [ ] Dashboard rendering tests (charts, graphs)
- [ ] Data export tests (CSV, PDF formats)
- [ ] Coupon/promotion logic tests (edge cases)
- [ ] Email marketing delivery tests
- [ ] Real-time update tests (impact counter)
- [ ] Recommendation engine tests (relevance)

**Deliverables:**

- ✅ Comprehensive seller analytics dashboard
- ✅ Seller marketing and promotion tools
- ✅ Customer impact tracking dashboard
- ✅ Platform-wide public impact metrics
- ✅ Data export and reporting
- ✅ Recommendation engine
- ✅ Accurate, tested analytics

---

## 🚀 MVP Launch (Week 30)

### Pre-Launch Checklist

- [ ] All Phase 0-9 features complete and tested
- [ ] Security audit (third-party recommended)
- [ ] Performance benchmarks met (Lighthouse 90+)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Legal documents finalized (lawyer review)
  - Terms of Service
  - Privacy Policy
  - Seller Agreement
  - Cookie Policy
- [ ] Compliance readiness
  - PCI-DSS (via Stripe)
  - CCPA (California)
  - Basic GDPR (if EU traffic)
- [ ] Insurance secured
  - E&O (Errors & Omissions)
  - Cyber liability
- [ ] Customer support ready
  - Help center populated
  - Support email/ticket system
  - Response time SLA defined
- [ ] Marketing assets ready
  - Landing page (waitlist)
  - Social media accounts
  - Press kit
- [ ] Beta testing complete
  - Recruit 50-100 beta sellers
  - Recruit 500-1000 beta buyers
  - Iterate on feedback

### Launch Strategy

1. **Soft Launch (Week 28-29)**
   - Invite-only (beta users)
   - Monitor metrics closely
   - Rapid iteration on feedback
   - Gradual scale-up

2. **Public Launch (Week 30)**
   - Press release
   - Social media campaign
   - Eco-influencer partnerships
   - Paid advertising (Google, Meta, Pinterest)
   - PR outreach (eco-focused publications: TreeHugger, Grist, etc.)
   - Launch event (virtual or in-person)

3. **Post-Launch (Week 31+)**
   - Daily monitoring (first 2 weeks)
   - Incident response readiness
   - User feedback channels (in-app, social, email)
   - Rapid bug fixing
   - Content marketing (blog posts, guides)

### Success Metrics (First 90 Days)

- 100+ active sellers
- 1,000+ buyers
- $50K+ GMV
- 4.5+ average seller rating
- < 5% cart abandonment (vs 70% industry average)
- 90+ Lighthouse scores maintained
- < 1% error rate
- 95%+ uptime

---

## 📊 Post-MVP Roadmap (Phases 10-20)

### Phase 10: Advanced Search & Recommendations (Weeks 31-33)

- Natural language processing search
- Visual search (search by image)
- Voice search (mobile)
- AI-powered recommendations
- Discovery features (shop by values, trending, new arrivals)

### Phase 11: Mobile Optimization & PWA (Weeks 34-36)

- Progressive Web App (offline capabilities)
- Push notifications
- Add to home screen
- Native features (camera, geolocation, share API)
- Mobile performance < 3s load time

### Phase 12: Community & Content (Weeks 37-39)

- Blog/editorial platform (CMS integration)
- Eco-education center (resource library)
- Community forum (discussions, Q&A)
- Newsletter system (segmentation, automation)

### Phase 13: Advanced Eco-Features & Gamification (Weeks 40-42)

- Carbon footprint calculator (per product, per order)
- Sustainability verification system (third-party certifications)
- Circular economy features (repair, trade-in, upcycling)
- Gamification and rewards (eco-score, badges, challenges, leaderboards)
- Impact visualization (charts, goals, achievements)

### Phase 14: Security, Compliance & Legal (Weeks 43-45)

- Security audit and penetration testing
- CCPA full compliance (data deletion, portability)
- GDPR readiness (if expanding to EU)
- WCAG 2.1 AA compliance audit
- Legal document updates
- Tax compliance (sales tax, 1099-K)
- Content policies and moderation

### Phase 15: Performance Optimization & Scaling (Weeks 46-48)

- Database optimization (indexes, query optimization)
- CDN setup (Cloudflare)
- Caching strategy (Redis)
- Background job processing (BullMQ)
- Load balancing and horizontal scaling
- SEO optimization (structured data, sitemaps)
- Monitoring and alerting (Sentry, uptime)

### Phase 16: Nonprofit Integration Enhancement (Weeks 49-50)

- Nonprofit onboarding and verification
- Enhanced donation flow (recurring donations)
- Impact reporting for all stakeholders
- Automated payouts to nonprofits
- Tax receipts for donations

### Phase 17: Customer Support & Help System (Weeks 51-52)

- Help center (FAQ, video tutorials)
- Support ticket system (categorization, SLA)
- Live chat (optional)
- Self-service tools (order cancellation, address change)

### Phase 18: Seller Growth & Marketing Features (Weeks 53-54)

- Seller promotion tools (sales events, bundles)
- Advertising platform (promoted listings, bidding)
- Seller resources (handbook, webinars, success stories)
- Email marketing for sellers (newsletters, campaigns)

### Phase 19: International Expansion Preparation (Weeks 55-56)

- Multi-language support (i18n)
- Multi-currency support
- International shipping (customs, duties)
- Country-specific compliance (GDPR, VAT)

### Phase 20: Launch Preparation & Beta (Weeks 57-60)

- Extended beta testing
- Data migration tools
- Final security and performance audits
- Marketing site and pre-launch campaign
- Soft launch → Public launch

---

## 📈 Key Metrics to Track

### Platform Health

- **GMV (Gross Merchandise Value):** Total sales volume
- **Active Sellers:** Sellers with ≥1 order in last 30 days
- **Active Buyers:** Buyers with ≥1 order in last 30 days
- **Order Volume:** Total orders per period
- **AOV (Average Order Value):** Average $ per order
- **Conversion Rate:** Visitors → buyers
- **Retention Rate:** Repeat buyers
- **Churn Rate:** Sellers/buyers leaving platform

### Eco-Mission Metrics

- **Total Donations:** $ donated to nonprofits
- **Carbon Offset:** Total CO2 saved/offset
- **Plastic-Free Products Sold:** Count
- **Certified Products %:** Products with certifications
- **Average Sustainability Score:** Across all products

### UX/Performance Metrics

- **Page Load Times:** < 2s target
- **Lighthouse Scores:** 90+ target (all metrics)
- **Bounce Rate:** % of single-page sessions
- **Cart Abandonment Rate:** Industry avg 70%, target < 30%
- **Checkout Completion Rate:** % who complete checkout
- **Mobile vs Desktop:** Usage split
- **Accessibility Issues:** WCAG violations (target: 0)

### Seller Success Metrics

- **Seller Approval Rate:** % of applications approved
- **Average Seller Revenue:** Per seller per month
- **Top-Performing Sellers:** 80/20 rule analysis
- **Seller Retention:** % of sellers active after 6 months
- **Average Response Time:** Seller message response time

---

## 🗂 Database Schema (High-Level)

### Core Entities

**Users**

- id, email, password_hash, role (buyer, seller, admin)
- name, avatar, phone, created_at, updated_at
- email_verified, two_factor_enabled

**Shops** (seller-owned)

- id, user_id (seller), slug, name, bio, story
- banner_image, logo, colors, created_at, updated_at
- nonprofit_id (selected nonprofit)
- donation_percentage
- stripe_account_id (Stripe Connect)
- is_verified, verification_status

**Products**

- id, shop_id, title, description, price, compare_at_price
- sku, category_id, tags (array), status (draft, active, sold_out)
- eco_score (calculated), eco_attributes (JSON)
- created_at, updated_at

**ProductVariants**

- id, product_id, name (e.g., "Small / Red"), sku, price
- inventory_quantity, track_inventory (boolean)
- image_id (optional variant-specific image)

**ProductImages**

- id, product_id, url, alt_text, position (order)
- is_primary (boolean)

**Categories**

- id, parent_id (self-referential), name, slug, description
- image, meta_title, meta_description
- position (order)

**Orders**

- id, buyer_id, order_number, status (processing, shipped, delivered, cancelled)
- subtotal, shipping_cost, tax, total, nonprofit_donation
- shipping_address (JSON), billing_address (JSON)
- payment_status, payment_intent_id (Stripe)
- created_at, updated_at

**OrderItems**

- id, order_id, product_id, variant_id (optional)
- shop_id, quantity, price_at_purchase, subtotal
- nonprofit_id (from shop), donation_amount

**Payments**

- id, order_id, stripe_payment_intent_id
- amount, platform_fee, seller_payout, nonprofit_donation
- status (pending, paid, refunded)
- created_at

**ShippingProfiles**

- id, shop_id, name, processing_time
- domestic_rate, international_rate (optional)
- free_shipping_threshold

**Addresses**

- id, user_id, label (Home, Work, etc.)
- name, street, city, state, zip, country
- phone, is_default (boolean)

**Reviews**

- id, product_id, user_id, order_id
- rating (1-5), text, images (array)
- is_verified_purchase, helpful_count
- created_at, updated_at

**SellerReviews**

- id, shop_id, user_id, order_id
- rating, shipping_speed_rating, communication_rating
- text, created_at

**Messages**

- id, from_user_id, to_user_id, order_id (optional)
- subject, body, attachments (array)
- is_read, created_at

**Favorites**

- id, user_id, product_id, created_at

**Collections**

- id, user_id, name, description, is_public
- cover_image, created_at, updated_at

**CollectionProducts**

- id, collection_id, product_id, position

**Nonprofits**

- id, name, ein, mission, description
- category (array), logo, images (array)
- website, social_links (JSON)
- is_verified, stripe_account_id (for payouts)

**Donations**

- id, order_id, nonprofit_id, shop_id
- amount, status (pending, paid)
- payout_id (when sent to nonprofit)
- created_at

**SellerApplications**

- id, user_id, business_info (JSON)
- eco_practices (JSON), certifications (array of URLs)
- product_samples (array of URLs), story (text)
- status (pending, under_review, approved, rejected)
- admin_notes (text), reviewed_by (admin_user_id)
- created_at, updated_at

**Certifications**

- id, product_id or shop_id, type (GOTS, Fair Trade, etc.)
- document_url, expiration_date, is_verified

**SustainabilityScores**

- id, product_id, materials_score, certifications_score
- packaging_score, production_score, carbon_score
- total_score (0-100), badge (bronze, silver, gold)

**AnalyticsEvents**

- id, user_id (optional), session_id, event_type
- event_data (JSON), created_at

**AdminLogs**

- id, admin_user_id, action, target_type, target_id
- details (JSON), created_at

**SupportTickets**

- id, user_id, subject, description, category
- status (open, in_progress, resolved, closed)
- assigned_to (admin_user_id), created_at, updated_at

**Promotions**

- id, shop_id, code, discount_type (%, $)
- discount_value, applies_to (JSON)
- min_purchase, usage_limit, usage_count
- starts_at, expires_at

**NotificationPreferences**

- id, user_id, email_enabled (JSON), sms_enabled (JSON)
- in_app_enabled (JSON)

**SearchHistory**

- id, user_id, query, filters (JSON), created_at

---

## 🎯 Next Steps

1. **Approve this plan** ✅
2. **Phase 0 begins:**
   - Week 1-2: UX research (Etsy, Faire) and design system creation
   - Week 3: Technical foundation (Next.js setup, database design)
3. **Phase 1-9:** Execute MVP implementation
4. **Week 30:** MVP Launch 🚀
5. **Post-MVP:** Continue with Phases 10-20 based on user feedback

---

## 📝 Notes

- This plan is a living document. Update after each phase completion.
- Use `CURRENT_STATUS.md` for session-to-session tracking.
- Commit frequently with descriptive messages (reference phases).
- Weekly reviews to ensure we're on track with timeline and quality.
- Prioritize UI/UX excellence throughout—this is a key differentiator.
- Test early, test often. Quality is non-negotiable.

---

**Let's build something amazing! 🌱**
