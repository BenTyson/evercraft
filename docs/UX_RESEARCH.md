# UX Research - Competitive Analysis

**Last Updated:** October 6, 2025
**Status:** Completed - Week 1 Phase 0

---

## Overview

This document captures UX research for Evercraft, analyzing competitor platforms (Etsy, Faire) to inform our design decisions. Focus areas: product discovery, checkout flow, seller dashboards, and mobile UX.

---

## Research Goals

1. **Understand best practices** in e-commerce marketplace UX
2. **Identify pain points** in existing platforms
3. **Discover opportunities** to differentiate Evercraft
4. **Inform design decisions** for our eco-focused marketplace

---

## Competitive Platforms

### Primary Benchmarks

- **Etsy:** Consumer marketplace, handmade/vintage focus
- **Faire:** B2B wholesale marketplace, clean modern aesthetic

### Secondary References

- **Shopify:** E-commerce platform UI patterns
- **Uncommon Goods:** Curated sustainable products
- **The Citizenry:** Artisan goods, storytelling

---

## 1. Etsy Analysis

### Overview

- **URL:** https://www.etsy.com
- **Target Audience:** Individual buyers seeking handmade, vintage, unique items
- **Strengths:** Massive selection, personalization, strong search
- **Weaknesses:** Cluttered UI, inconsistent seller quality, overwhelming options

### Homepage

**Hero Section:**

- **Layout:** Large hero banner with seasonal imagery, prominent search bar, featured categories carousel
- **CTAs:** Primary: "Search for anything", Secondary: Category quick links (Jewelry, Home & Living, etc.)
- **Visual Style:** Colorful, busy, heavily image-driven with personalized product recommendations
- **What works:**
  - Immediate search access - reduces friction to discovery
  - Personalization drives engagement (logged-in users see tailored content)
  - Category quick access helps undecided browsers
- **What doesn't:**
  - Overwhelming visual density can cause decision paralysis
  - Inconsistent brand identity (varies by seller)
  - Too many competing CTAs reduce conversion focus
- **Insights for Evercraft:**
  - Keep prominent search with eco-focused suggestions
  - Use whitespace strategically to reduce overwhelm
  - Feature 3-4 curated collections vs. 20+ options
  - Consistent brand aesthetic (all products fit eco-criteria)

**Navigation:**

- **Menu Structure:** Horizontal top nav with hover-dropdown mega menus, sticky header on scroll
- **Search Bar:** Centrally placed in header, always visible, prominent positioning
- **Categories:** Organized hierarchically: Jewelry & Accessories → Necklaces → Pendants (3 levels deep)
- **What works:**
  - Sticky header keeps search/cart accessible while scrolling
  - Hover menus allow quick category scanning without page loads
  - Built separate mobile-friendly navigation patterns (hamburger menu)
  - Increased font sizes and tap target sizes (44px+ touch targets)
- **What doesn't:**
  - Mega menus can be overwhelming with 50+ subcategories
  - Desktop navigation doesn't translate well to mobile initially (had to redesign)
  - Category depth can bury niche products (requires 3+ clicks)
- **Insights for Evercraft:**
  - Implement sticky header from day one (reduces navigation friction)
  - Limit mega menu to 2 levels deep, ~20 categories max
  - Design mobile-first navigation, progressively enhance for desktop
  - Add "Eco Collections" as top-level nav (Plastic-Free, Zero Waste, Carbon Neutral)

**Featured Content:**

- **Sections:** Trending Now, Editor's Picks, Recently Viewed, Recommended For You, Gift Guides (seasonal), Shop by Category
- **Personalization:** Algorithm-driven recommendations based on browsing history, favorites, purchases, and similar user behavior
- **What works:**
  - Personalization increases engagement and discovery
  - Multiple entry points reduce bounce rate
  - Seasonal content (holidays, trends) feels timely
  - "Recently Viewed" helps users continue shopping journey
- **What doesn't:**
  - Too many sections create infinite scroll fatigue
  - Lack of clear hierarchy (everything competes for attention)
  - No clear value proposition or brand mission on homepage
  - Ads and promotions blend with organic content
- **Insights for Evercraft:**
  - Feature 4-5 homepage sections max (less is more)
  - Lead with mission: "Shop Sustainable, Support Nonprofits" hero message
  - Create "Impact This Week" section (total donated, trees planted, etc.)
  - "Featured Eco-Sellers" spotlight with story snippets
  - Maintain clear visual hierarchy (mission → discovery → social proof)

### Search & Product Discovery

**Search Experience:**

- **Search Bar:** Prominent in header, features autocomplete suggestions, recent searches, trending terms
- **Results Layout:** Responsive grid (4-5 columns desktop, 2 mobile), modular rectangular product cards
- **Filters:** Price, Category, Shipping, Location, Item Type, Color, Size, Occasion, Shop Location, Custom Options
- **Sort Options:** Relevance, Most Recent, Lowest Price, Highest Price, Customer Reviews
- **What works:**
  - Robust categorization helps users find products without knowing exact items
  - Search filters are comprehensive and save user time
  - Autocomplete reduces typos and speeds discovery
  - Grid layout provides quick visual scanning
  - Strong search relevancy algorithm
- **What doesn't:**
  - Results can be overwhelming (millions of items)
  - Filter combinations can produce zero results (poor feedback)
  - No AI-powered "search by sustainability criteria" filter
  - Search bar could be larger/more prominent on mobile
- **Insights for Evercraft:**
  - Add eco-specific filters: Carbon Neutral, Plastic-Free, Vegan, Fair Trade, B-Corp, Packaging Type
  - Implement "Search by Impact" - filter by nonprofit cause supported
  - Show filter result counts before applying (avoid zero result frustration)
  - Meilisearch will provide typo-tolerance and fast results
  - Default sort: "Most Sustainable" (scoring algorithm)

**Filters & Facets:**

- **Filter Categories:** Multi-level: Price range, Shipping options (free, express), Seller location, Product attributes (color, material, size), Custom/personalized, Occasion
- **UI Pattern:** Desktop: Left sidebar with collapsible sections, Mobile: Slide-up modal sheet
- **Mobile Filters:** Bottom sheet slides up, full-screen takeover with "Apply" CTA, allows multi-select before committing
- **What works:**
  - Collapsible filter groups prevent overwhelming users
  - Multi-select allows complex queries (e.g., "red OR blue" + "under $50")
  - Visual feedback shows active filters with removable chips
  - Filter counts show result quantities (prevents dead ends)
- **What doesn't:**
  - Too many filter options (30+) create decision paralysis
  - No smart defaults based on user preferences
  - Filter hierarchy isn't intuitive (color buried under "more options")
- **Insights for Evercraft:**
  - Prioritize eco-filters at top (Plastic-Free, Carbon Neutral, etc.)
  - Limit to 15-20 total filters, progressive disclosure for advanced
  - Remember user filter preferences (localStorage for guests, DB for logged-in)
  - Add "Sustainability Score" range slider (0-100 scale)
  - Visual eco-badges in filter UI (icons next to labels)

### Product Detail Page (PDP)

**Layout:**

- **Image Gallery:** Multi-image carousel with thumbnail navigation, zoom on click/hover, 5-10 images typical
- **Product Info:** Large title, price (prominently displayed), star rating, description (detailed), variations (size, color dropdowns)
- **Seller Info:** Shop name with star rating, location, response time, "Message seller" CTA - displayed above fold
- **Reviews:** Below product description, filterable by rating, sortable by date/helpfulness, includes photos
- **CTA Hierarchy:** Primary: "Add to cart" (large, high contrast), Secondary: "Add to favorites" (heart icon), Tertiary: Share (social icons)
- **What works:**
  - Image gallery is robust (zoom, multiple angles)
  - Clear CTA hierarchy reduces confusion
  - Seller info builds trust (ratings, location, response time)
  - Reviews with photos increase conversion
  - Variations clearly displayed with dropdowns
  - "Favorites" feature enables comparison shopping
- **What doesn't:**
  - Description formatting inconsistent (seller-dependent)
  - Shipping costs not shown until later (hidden friction)
  - No sustainability information prominently displayed
  - Related products section clutters page bottom
- **Insights for Evercraft:**
  - Add "Eco Impact" section above fold: materials, packaging, carbon footprint
  - Show nonprofit recipient with logo + mission snippet
  - Standardize product info template (enforce structure for sellers)
  - Display shipping cost estimate upfront (zip code input)
  - Add "Sustainability Score" badge near price
  - Minimize related products (keep focus on conversion)

**Trust Signals:**

- **Reviews:** Star rating with count, written reviews with photos, verified purchase badge, seller responses, filtering by rating (5-star, 4-star, etc.), sort by most recent/helpful
- **Seller Badges:** "Star Seller" (high ratings + fast shipping), "Etsy's Pick," years on platform, response rate percentage
- **Shipping Info:** Estimated delivery date range, free shipping threshold, calculated shipping (shown after adding to cart)
- **Return Policy:** Linked in sidebar, not prominently displayed (requires click)
- **What works:**
  - Photo reviews significantly boost trust
  - Verified purchase badges validate authenticity
  - "Star Seller" badge provides quick quality signal
  - Response rate shows seller engagement
- **What doesn't:**
  - Return policy buried (reduces confidence)
  - No standardized quality certifications (eco, safety, etc.)
  - Shipping cost surprise at checkout hurts conversion
  - Seller badges not explained (what is "Star Seller"?)
- **Insights for Evercraft:**
  - Eco Certifications as badges: B-Corp, Fair Trade, Plastic-Free, Carbon Neutral (standardized icons)
  - Return policy in expandable accordion on PDP (above fold)
  - Show shipping cost estimate before "Add to Cart"
  - "Verified Eco-Seller" badge (manual review completed)
  - Impact metrics: "Sellers supporting [Nonprofit Name]" + "10% of sales donated"

### Shopping Cart & Checkout

**Cart:**

- **Cart Type:** Both: Slide-out mini cart (quick view) + full cart page (detailed review)
- **Multi-Seller:** Orders grouped by shop, each shop shows separate shipping cost, can't combine shipping across sellers
- **Shipping Calc:** Calculated at cart page, requires selecting shipping method per shop
- **What works:**
  - Mini cart provides quick confirmation without leaving browse context
  - Full cart page allows detailed review before commitment
  - Clear shop grouping helps understand multi-seller orders
  - Quantity adjustment in-cart reduces friction
  - "Save for Later" moves items out of cart without deleting
- **What doesn't:**
  - No guest checkout preview (forces account creation)
  - Shipping costs add up quickly across multiple sellers (sticker shock)
  - No combined cart total until checkout (hidden final price)
  - Promotional discount codes not tested in cart (trial-and-error)
- **Insights for Evercraft:**
  - Implement slide-out cart for quick actions + full cart page
  - Show estimated total (including shipping) in cart
  - Allow guest checkout from cart (optional account creation post-purchase)
  - Add "Total Impact" widget in cart: "$X going to nonprofits, Y lbs CO2 offset"
  - Green shipping options highlighted (carbon-neutral, plastic-free packaging)

**Checkout Flow:**

- **Number of Steps:** Multi-step: (1) Shipping address, (2) Shipping method per shop, (3) Payment, (4) Review order
- **Guest Checkout:** No - requires Etsy account (email + password or social login)
- **Payment Options:** Credit/debit card, PayPal, Apple Pay, Google Pay, Etsy Gift Card, Klarna (payment plans)
- **Mobile Experience:** Simplified single-column layout, large touch targets, autofill-friendly forms, sticky "Place Order" button
- **What works:**
  - Multi-payment options reduce abandonment
  - Address autofill/saved addresses speed repeat purchases
  - Progress indicator shows steps remaining
  - Order review step prevents errors
  - Mobile checkout is optimized with large tap targets
- **What doesn't:**
  - No guest checkout (major conversion killer)
  - Multi-step can feel long (4 steps)
  - Shipping method selection per shop is tedious (10+ shops = 10+ selections)
  - No eco-shipping option surfaced (e.g., "slow shipping = less carbon")
- **Insights for Evercraft:**
  - Allow guest checkout (email only, optional account creation)
  - Single-page checkout where possible (progressive disclosure)
  - Smart defaults: pre-select standard shipping, allow bulk "upgrade all to express"
  - Add "Eco Shipping" option: carbon-neutral, slower, cheaper (incentivize sustainability)
  - Show impact summary on confirmation: "You've supported 3 nonprofits and offset 5 lbs CO2"
  - Stripe Connect for payment processing (handles marketplace splits + nonprofit donations)

### Seller Dashboard

**Overview:**

- **Layout:** Left sidebar navigation + main dashboard area with widget cards
- **Key Metrics:** Sales today, orders to ship, messages, views, favorites, conversion rate - displayed as cards/tiles
- **Navigation:** Sidebar with: Dashboard, Orders, Listings, Marketing, Finances, Settings, Stats (expandable sections)
- **What works:**
  - At-a-glance metrics reduce cognitive load
  - Card-based layout is scannable
  - Sidebar keeps navigation always accessible
  - Quick actions available from dashboard (fulfill order, respond to message)
- **What doesn't:**
  - Information density can be overwhelming for new sellers
  - No onboarding checklist for first-time setup
  - Stats require multiple clicks to see detailed analytics
  - No sustainability metrics tracked (missed opportunity)
- **Insights for Evercraft:**
  - Add "Impact Dashboard" widget: total donated to nonprofit, CO2 offset, eco-badge earned
  - Onboarding checklist: Application status, shop setup, first product, first sale
  - Simplified view for new sellers (progressive complexity)
  - Quick stats: Sales, Orders pending, Nonprofit impact this month

**Product Management:**

- **Listing Flow:** Multi-step form: (1) Photos (drag-drop, 10 max), (2) Details (title, description, price, quantity, variations), (3) Shipping, (4) Preview, (5) Publish
- **Bulk Actions:** Yes - bulk edit (price, quantity, shipping), bulk renew, bulk delete
- **Inventory:** Manual tracking, low-stock alerts, variation-level inventory (e.g., Small: 5, Medium: 12)
- **What works:**
  - Drag-drop photo upload is intuitive
  - Variations handled well (size, color combinations)
  - Preview before publish reduces errors
  - Bulk actions save time for large catalogs
- **What doesn't:**
  - No sustainability info fields (materials, packaging, certifications)
  - Photo requirements not clear (resolution, aspect ratio)
  - No templates for similar products (start from scratch each time)
  - Description editor is basic (limited formatting)
- **Insights for Evercraft:**
  - Add required eco-fields: Materials (dropdown + text), Packaging (plastic-free? recyclable?), Certifications (Fair Trade, B-Corp, etc.)
  - Sustainability score auto-calculated from fields
  - Product templates: "Duplicate listing" with eco-info carried over
  - Rich text editor for descriptions (headings, lists, bold)
  - Image guidelines shown inline (1200x1200px min, 4:3 ratio)

**Order Management:**

- **Order View:** Table view with filters (new, processing, shipped, completed), search by order number/buyer name
- **Fulfillment:** Integrated shipping label purchase (USPS, UPS, FedEx), tracking upload, mark as shipped
- **Communication:** Built-in messaging, buyer can contact seller pre/post-purchase, seller can send updates
- **What works:**
  - Centralized order table with clear status
  - Shipping label integration saves time (no external site needed)
  - Order status updates (processing → shipped → delivered) keep buyers informed
  - Filter/search helps with large order volumes
- **What doesn't:**
  - No bulk fulfillment (must ship orders one-by-one)
  - Messaging not threaded (hard to follow conversation)
  - No order notes (internal seller notes)
  - No eco-packaging options in fulfillment flow
- **Insights for Evercraft:**
  - Bulk fulfillment: select multiple orders, print all labels, mark all shipped
  - Order notes field (internal only, for seller reference)
  - Threaded messaging with buyer (conversation view)
  - Shippo integration for eco-friendly shipping options (carbon-neutral carriers)
  - Show nonprofit donation on order detail (seller sees impact)

### Mobile Experience

**Responsive Design:**

- **Navigation:** Hamburger menu (top-left), bottom nav bar with: Home, Search, Cart, Messages, Account (sticky)
- **Touch Targets:** 44px+ tap targets, generous spacing between interactive elements
- **Performance:** Generally fast, some image-heavy pages lag, infinite scroll for product grids
- **What works:**
  - Bottom nav provides quick access to key functions (search, cart)
  - Hamburger menu declutters header
  - Large tap targets prevent mis-taps
  - Sticky header keeps search accessible
  - Mobile checkout is streamlined (fewer fields, autofill)
- **What doesn't:**
  - Search can be hard to access (requires opening menu on some pages)
  - Image carousels sometimes glitchy on touch
  - Seller dashboard not optimized for mobile (too cramped)
  - No mobile app mentioned (web-only, could benefit from PWA)
- **Insights for Evercraft:**
  - Mobile-first design from day one
  - Bottom nav: Home, Browse (search), Cart, Impact (new), Account
  - PWA implementation (Phase 11): add to home screen, offline browsing
  - Optimize seller dashboard for mobile (card stacking, collapsible sections)
  - Touch-optimized image gallery (swipe, pinch-zoom)

### Key Takeaways - Etsy

**Strengths to Emulate:**

1. **Robust search & filters:** Powerful categorization, multi-select filters, autocomplete - makes discovery easy even with millions of products
2. **Personalization engine:** Recommendations based on browsing/purchase history drive engagement and repeat visits
3. **Favorites system:** Allows comparison shopping and wishlist building, clever connection to notifications for deals
4. **Review system with photos:** Photo reviews dramatically increase trust and conversion, verified purchase badges add authenticity
5. **Multi-image galleries:** Zoom, multiple angles, thumbnail navigation - comprehensive product visualization
6. **Seller trust signals:** Star ratings, response time, years on platform, "Star Seller" badges build confidence
7. **Sticky header navigation:** Search/cart always accessible while scrolling reduces friction
8. **Mobile-optimized checkout:** Large tap targets, autofill-friendly, streamlined for smaller screens

**Weaknesses to Avoid:**

1. **Cluttered UI:** Too many sections, competing CTAs, visual overwhelm - creates decision paralysis and cognitive load
2. **No guest checkout:** Forced account creation is a major conversion killer, especially for first-time buyers
3. **Inconsistent seller quality:** Wide range of professionalism and product quality hurts brand perception
4. **Hidden shipping costs:** Not showing costs until late in funnel creates sticker shock and abandonment
5. **Overwhelming options:** Millions of products without strong curation leads to analysis paralysis
6. **Tedious multi-seller checkout:** Selecting shipping method for 10 separate shops is exhausting
7. **No sustainability information:** Missing major opportunity to highlight eco-friendly products and practices

**Opportunities for Evercraft:**

1. **Eco-first differentiation:** Add sustainability scores, eco-badges, carbon footprint, packaging info - make it prominent, not buried
2. **Curated quality:** Manual seller verification ensures consistent quality and brand trust (higher bar than Etsy)
3. **Transparent impact:** Show nonprofit donations and environmental metrics throughout journey (cart, checkout, confirmation)
4. **Cleaner aesthetic:** Use whitespace, limit options, clear hierarchy - reduce overwhelm while maintaining functionality
5. **Guest checkout:** Allow email-only checkout, optional account creation post-purchase - remove friction
6. **Upfront shipping costs:** Show estimates before "Add to Cart," eliminate surprise at checkout
7. **Eco-shipping options:** Carbon-neutral, slower/cheaper, plastic-free packaging - incentivize sustainable choices
8. **Simplified multi-seller flow:** Smart defaults, bulk actions ("upgrade all to express") - reduce tedium

---

## 2. Faire Analysis

### Overview

- **URL:** https://www.faire.com
- **Target Audience:** Retail buyers sourcing wholesale products
- **Strengths:** Clean aesthetic, professional feel, excellent seller curation
- **Weaknesses:** B2B focus (less applicable to B2C), limited to wholesale

### Homepage

**Hero Section:**

- **Layout:** Full-width hero with high-quality lifestyle imagery, clear value proposition, prominent CTAs for buyers/sellers
- **CTAs:** Primary: "Start Shopping" (buyers), Secondary: "Sell on Faire" (brands), clear audience segmentation
- **Visual Style:** Clean, modern, professional - generous whitespace, muted colors, high-end aesthetic
- **What works:**
  - Immediately clarifies audience (B2B wholesale, not B2C retail)
  - Professional feel builds trust with business buyers
  - Clear value props: Net 60 terms, free returns, curated brands
  - High-quality imagery conveys premium positioning
- **What doesn't:**
  - B2B focus makes it less applicable to Evercraft's B2C model
  - Assumes buyer understands wholesale marketplace concept
  - Could be more approachable for small/new retailers
- **Insights for Evercraft:**
  - Adopt clean, professional aesthetic but make it warm/approachable
  - Clear mission statement above fold: "Shop Sustainable, Support Nonprofits"
  - Segment CTAs: "Shop Now" (consumers), "Apply to Sell" (businesses)

**Navigation:**

- **Menu Structure:** Simple horizontal nav: Shop, Brands, New Arrivals, About, top-right: Search, Account
- **Search Bar:** Clean, minimal, icon-based (click to expand), unobtrusive
- **Categories:** Organized by product type and style (Home, Fashion, Beauty, etc.) with curated subcategories
- **What works:**
  - Minimal navigation reduces cognitive load
  - Focus on content vs. navigation chrome
  - Curated categories (quality over quantity)
  - Professional, uncluttered header
- **What doesn't:**
  - Search less prominent (could hurt discovery)
  - Limited top-level categories (works for B2B, may need more for B2C)
- **Insights for Evercraft:**
  - Balance minimal aesthetic with consumer discovery needs
  - Keep navigation clean but ensure search is always visible
  - Top-level nav: Shop, Impact, Sellers, About (4-5 max)

### Product Discovery

**Browse Experience:**

- **Grid Layout:** 3-4 columns desktop, generous spacing between cards, lots of whitespace
- **Product Cards:** Large product image, brand name prominent, product title, wholesale pricing (MOQ, bulk pricing)
- **Filters:** Category, Brand, Price range, New arrivals, Shipping options, Values (e.g., Women-owned, Sustainable)
- **What works:**
  - Generous whitespace feels premium, not cluttered
  - Brand-first approach (brand name more prominent than product)
  - "Values" filters (Women-owned, Sustainable) align with conscious commerce
  - Clean card design with clear hierarchy
  - Machine learning recommendations drive discovery
- **What doesn't:**
  - B2B pricing model (MOQ, bulk) not applicable to B2C
  - Limited filters compared to Etsy (works for curated inventory)
  - Grid can feel sparse on large screens
- **Insights for Evercraft:**
  - Adopt generous whitespace and clean card design
  - Make seller/brand prominent (storytelling)
  - Implement "Values" filters: Plastic-Free, Carbon Neutral, Fair Trade, etc.
  - Balance clean aesthetic with sufficient information density for B2C

### Product Detail Page

**Layout:**

- **Image Gallery:** Large, professional product photography, minimal carousel, focus on quality over quantity
- **Product Info:** Clean layout, product title, brand name (linked), description, specifications, wholesale terms
- **Brand Story:** Brand profile section with logo, mission, values, "About this brand" expandable
- **What works:**
  - Brand storytelling is integrated, not separate
  - Professional photography sets quality expectations
  - Clean information hierarchy
  - "About this brand" adds context and builds trust
- **What doesn't:**
  - Wholesale-specific info (MOQ, terms) not relevant to B2C
  - Less emphasis on reviews (B2B buyers rely more on samples)
- **Insights for Evercraft:**
  - Integrate seller story on PDP (don't bury it)
  - Add "About [Seller Name]" expandable with eco-mission, nonprofit partner
  - Clean PDP layout with generous whitespace (not cluttered like Etsy)
  - High-quality imagery expectations for sellers

### Seller (Brand) Profile

**Brand Page:**

- **Layout:** Hero banner with brand imagery, logo, mission statement, product grid below
- **Story Telling:** "About" section with brand origin, values, founders, mission - prominently displayed
- **Product Display:** Clean grid of brand's products, ability to favorite brand, follow for updates
- **What works:**
  - Storytelling is first-class citizen (not afterthought)
  - Brand identity is clear and consistent
  - Ability to follow brands builds relationships
  - Professional presentation builds trust
- **What doesn't:**
  - Could add more multimedia (video, founder interviews)
  - Less emphasis on social proof/reviews
- **Insights for Evercraft:**
  - Create rich seller/shop pages with mission, story, team
  - Prominently display nonprofit partnership
  - Add "Follow" feature for favorite eco-sellers
  - Include founder story, eco-practices, certifications
  - Consider video introductions (Phase 12)

### Mobile Experience

**Mobile Design:**

- **Overall:** Clean, modern, professional - same aesthetic as desktop, fully responsive
- **Performance:** Fast loading, smooth scrolling, optimized images
- **What works:**
  - Maintains premium feel on mobile
  - Touch-friendly interactions
  - Streamlined for smaller screens without losing functionality
- **What doesn't:**
  - Some B2B features less mobile-friendly (bulk ordering)
- **Insights for Evercraft:**
  - Maintain clean aesthetic across all breakpoints
  - Optimize for mobile performance from day one
  - Test on various devices during development

### Key Takeaways - Faire

**Strengths to Emulate:**

1. **Clean, modern aesthetic:** Generous whitespace, subtle shadows, uncluttered layouts - premium feel without pretension
2. **Professional feel:** Trustworthy, high-quality imagery and design language build confidence
3. **Seller curation:** Quality over quantity - carefully vetted brands create consistent experience
4. **Brand storytelling:** First-class treatment of seller/brand narrative, not buried or afterthought
5. **Minimal navigation:** Focus on content, not chrome - reduces cognitive load and decision paralysis
6. **"Values" filters:** Women-owned, Sustainable, etc. - aligns with conscious commerce trends
7. **Machine learning:** AI-powered recommendations drive discovery and match users with relevant products
8. **Performance:** Fast, smooth, optimized - technical excellence supports premium positioning

**Weaknesses to Avoid:**

1. **B2B complexity:** Wholesale terms, MOQ, Net 60 - not applicable to B2C, would confuse consumers
2. **Limited filters:** Works for curated B2B inventory, but B2C needs more discovery options
3. **Sparse grids:** Generous whitespace can feel empty on large screens, balance needed
4. **Minimal search:** Icon-based search less discoverable than persistent search bar (B2C needs easy discovery)

**Opportunities for Evercraft:**

1. **Bring Faire's B2B aesthetic to B2C:** Modern, clean design for consumers - elevate marketplace expectations
2. **Combine Faire cleanliness with Etsy functionality:** Clean cards + robust filters = best of both worlds
3. **Adopt "Values" approach for eco-commerce:** Carbon Neutral, Plastic-Free, etc. as first-class filters
4. **Storytelling-first:** Make seller mission, nonprofit partnership, eco-practices prominent (like Faire's brand pages)
5. **Machine learning for impact:** Recommend products based on user's sustainability values and causes they care about
6. **Professional but approachable:** Faire's premium feel + warm, mission-driven messaging = eco-conscious brand identity

---

## 3. Additional Platforms (Brief Analysis)

### Shopify

**Key Observations:**

- [Observation 1]
- [Observation 2]

**Insights for Evercraft:**

- [Insight 1]

### Uncommon Goods

**Key Observations:**

- [Observation 1]
- [Observation 2]

**Insights for Evercraft:**

- [Insight 1]

### The Citizenry

**Key Observations:**

- Excellent storytelling
- Focus on artisan background
- High-quality photography

**Insights for Evercraft:**

- Emphasize seller stories and eco-mission
- Invest in quality visuals

---

## 4. User Flows Comparison

### Product Discovery Flow

**Etsy:**

1. Homepage → Browse categories OR Search query
2. Filter by: price, category, location, shipping, custom options
3. Sort by: relevance, price, reviews
4. Click product card → PDP

**Faire:**

1. Homepage → Browse by category OR Search
2. Filter by: category, brand, values (Sustainable, Women-owned)
3. Machine learning recommendations
4. Click product → PDP with brand story

**Evercraft (Proposed):**

1. Homepage → Mission-driven hero + Eco Collections OR Search with eco-suggestions
2. Filter by: eco-criteria (Plastic-Free, Carbon Neutral, Fair Trade, Vegan), price, category, nonprofit cause
3. Sort by: "Most Sustainable" (default), price, newest, reviews
4. Product cards show: eco-badge, sustainability score, nonprofit supported
5. Click product → PDP with eco-impact section + seller story

### Checkout Flow

**Etsy:**

1. Add to cart (separate carts per seller)
2. View cart → Requires account creation
3. Shipping address entry
4. Select shipping method per seller (tedious if multiple sellers)
5. Payment details
6. Review order
7. Confirmation (no impact summary)

**Faire:**

1. Add to cart
2. Wholesale checkout (MOQ, Net 60 terms)
3. B2B payment options
4. Confirmation

**Evercraft (Proposed):**

1. Add to cart → Mini cart slide-out with "Total Impact" widget
2. Cart page → Shows estimated total with shipping, donation breakdown by nonprofit
3. Checkout (guest-friendly) → Email only, optional account
4. Single-page checkout:
   - Shipping address (autofill)
   - Shipping method with eco-options highlighted (carbon-neutral, slower/cheaper)
   - Payment (Stripe with multiple options)
5. Review & place order
6. Confirmation with impact summary: "You've supported 3 nonprofits, offset 5 lbs CO2, supported 2 eco-businesses"

### Seller Onboarding Flow

**Etsy:**

1. Click "Sell on Etsy"
2. Create account (email/social)
3. Set up shop (name, policies)
4. Add first listing (photos, details, price)
5. Publish (live immediately)

**Evercraft (Proposed):**

1. **Application** (Phase 2):
   - Business info (name, website, social media)
   - Eco-practices questionnaire (materials, packaging, certifications, supply chain)
   - Nonprofit selection (choose from verified list)
   - Donation percentage commitment (minimum requirement)
2. **Manual Review** (admin dashboard):
   - Verify eco-claims (check certifications, website)
   - Review product samples if needed
   - Approve or request more info
3. **Shop Setup** (upon approval):
   - Welcome email with onboarding checklist
   - Shop profile (logo, banner, mission statement, founder story)
   - Nonprofit partnership displayed on shop page
4. **Product Listing**:
   - Required eco-fields (materials, packaging, certifications)
   - Sustainability score auto-calculated
   - Photos (1200x1200px min)
   - Rich text description
5. **First Sale**:
   - Celebration email
   - Impact dashboard shows first donation to nonprofit

---

## 5. Information Architecture

### Etsy IA

```
Home
├── Search/Browse
│   ├── Category Pages
│   ├── Search Results
│   └── Product Detail
├── Seller Shops
│   ├── Shop Home
│   ├── Shop Policies
│   └── Reviews
├── Cart
└── Checkout
```

### Faire IA

```
Home
├── Browse
│   ├── Categories
│   ├── Brands
│   └── Products
├── Brand Pages
│   ├── About
│   ├── Products
│   └── Terms
└── Checkout
```

### Evercraft (Proposed) IA

```
Home
├── Shop
│   ├── Categories
│   ├── Collections (Plastic-Free, Zero Waste, etc.)
│   ├── Search Results
│   ├── Product Detail (with Eco Info)
│   └── Seller Shop Pages (with Nonprofit Info)
├── Impact
│   ├── Platform Impact Metrics
│   ├── Nonprofits Directory
│   └── Seller Stories
├── About
│   ├── Our Mission
│   ├── How It Works
│   └── Eco Education Center
├── Sell
│   ├── Seller Application
│   └── Seller Login → Dashboard
└── Account
    ├── Orders
    ├── Favorites
    ├── Personal Impact Dashboard
    └── Settings
```

---

## 6. UI Patterns Library

### Navigation Patterns

**Desktop:**

- ✓ **Horizontal nav** (Etsy, Faire): Industry standard, familiar to users
- ✓ **Sticky header** (both): Keeps search/cart accessible, reduces scroll-back friction
- ✓ **Mega menu vs dropdown**: Etsy uses mega (overwhelming), Faire uses simple dropdown (clean)

**Mobile:**

- ✓ **Hamburger menu** (standard): Familiar pattern, declutters header
- ✓ **Bottom navigation** (app-like): Quick access to key functions (Home, Browse, Cart, Account)
- ✓ **Sticky search bar**: Keeps discovery always accessible

**Recommendation for Evercraft:**

- **Desktop**: Horizontal sticky header with simple dropdown menus (Faire-style, not mega)
  - Logo left, Nav center (Shop, Impact, Sellers, About), Search/Cart/Account right
  - 2-level dropdown max (avoid Etsy's 3-level complexity)
- **Mobile**: Bottom nav (Home, Browse, Cart, Impact, Account) + sticky header with logo/search
  - Bottom nav provides thumb-friendly quick access
  - Hamburger for secondary pages (About, Help, Policies)
- **Key difference**: Add "Impact" to top-level nav (showcase mission differentiation)

### Product Grid Patterns

**Card Styles:**

- **Etsy**: Dense cards - Image (square), title (2 lines), price, star rating, seller, free shipping badge
- **Faire**: Spacious cards - Large image (3:4 ratio), brand name prominent, title (1 line), wholesale info

**Recommendation for Evercraft:**

```
┌─────────────────────┐
│   [Eco Badge]       │ ← Top-right overlay (Plastic-Free, Carbon Neutral, etc.)
│                     │
│     [Product]       │ ← Image (4:3 ratio, 1200x1200px min)
│      [Image]        │
│                     │
├─────────────────────┤
│ Sustainability: 87  │ ← Score bar (0-100, color-coded)
│ [██████████░░░]    │
├─────────────────────┤
│ Product Title       │ ← 2 lines max, 16px, Semi-bold
│ Truncate if too...  │
├─────────────────────┤
│ by Seller Name      │ ← 14px, muted color, linked
│ Supporting: [NP]🌱  │ ← Nonprofit badge/icon
├─────────────────────┤
│ $XX.XX    ⭐ 4.8(12)│ ← Price + rating
│           [♥] [+]  │ ← Favorite + Quick add
└─────────────────────┘
```

- **Spacing**: Generous whitespace (Faire-inspired), 24px gaps between cards
- **Grid**: 4 columns desktop (1200px+), 3 cols tablet (768-1199px), 2 cols mobile (<768px)
- **Hover state**: Subtle lift shadow, scale 1.02, second image preview
- **Performance**: Lazy load images, WebP format, srcset for responsive images

### Filter UI Patterns

**Desktop:**

- **Etsy**: Left sidebar - always visible, collapsible sections, multi-select checkboxes
- **Faire**: Left sidebar - minimal filters, clean spacing

**Mobile:**

- **Etsy**: Slide-up bottom sheet - full-screen takeover, "Apply" CTA commits changes
- **Faire**: Similar pattern

**Recommendation for Evercraft:**

- **Desktop**: Left sidebar (280px width)
  - Eco-filters prioritized at top (Plastic-Free, Carbon Neutral, Fair Trade, Vegan)
  - Sustainability Score range slider (0-100)
  - Traditional filters below (Price, Category, Shipping)
  - Nonprofit Cause filter (dropdown: Ocean Conservation, Climate Action, etc.)
  - Collapsible sections with chevron icons
  - Active filter chips above product grid (removable X)
- **Mobile**: Slide-up bottom sheet (80vh height)
  - Same filter organization
  - Sticky footer with "Apply Filters" CTA + result count
  - "Clear All" link in header
  - Smooth animation (300ms ease-out)
- **Key innovation**: "Most Sustainable" filter preset - one-tap to show highest-scoring products

---

## 7. Accessibility Observations

### Etsy Accessibility

- **Keyboard Navigation:** [Assessment]
- **Screen Reader:** [Assessment]
- **Color Contrast:** [Assessment]
- **Touch Targets:** [Assessment]

### Faire Accessibility

- **Keyboard Navigation:** [Assessment]
- **Screen Reader:** [Assessment]
- **Color Contrast:** [Assessment]
- **Touch Targets:** [Assessment]

### Evercraft Requirements

- WCAG 2.1 AA compliant
- All interactive elements keyboard accessible
- Minimum 4.5:1 contrast for text
- 44px × 44px minimum touch targets

---

## 8. Performance Observations

### Page Load Times (Approximate)

- **Etsy Homepage:** [X seconds]
- **Faire Homepage:** [X seconds]
- **Etsy PDP:** [X seconds]
- **Faire PDP:** [X seconds]

### Lighthouse Scores

| Platform             | Performance | Accessibility | Best Practices | SEO     |
| -------------------- | ----------- | ------------- | -------------- | ------- |
| Etsy                 | [Score]     | [Score]       | [Score]        | [Score] |
| Faire                | [Score]     | [Score]       | [Score]        | [Score] |
| **Goal (Evercraft)** | **90+**     | **90+**       | **90+**        | **90+** |

---

## 9. Key Design Decisions for Evercraft

Based on competitive research and marketplace design best practices:

### What We'll Do Differently

1. **Eco-First Design:** Green accents, sustainability info prominent, eco-badges as first-class UI elements
2. **Transparent Impact:** Show nonprofit donations and environmental metrics throughout user journey (homepage, PDP, cart, confirmation)
3. **Curated Quality:** Manual seller verification, higher bar than Etsy, consistent brand experience
4. **Clean Aesthetic:** Faire-like modern design for B2C consumers - premium but approachable
5. **Story-Driven:** Emphasize seller missions, eco-practices, nonprofit partnerships as core value prop
6. **Guest Checkout:** Email-only checkout, optional account post-purchase (remove friction)
7. **Upfront Costs:** Show shipping estimates before cart, no surprise fees
8. **Sustainability Scoring:** Algorithmic scoring (0-100) based on materials, packaging, carbon footprint, certifications

### What We'll Adopt from Competitors

1. **From Etsy:**
   - Robust search/filter with autocomplete
   - Personalization engine (recommendations)
   - Photo reviews with verified purchase badges
   - Favorites/wishlist system
   - Sticky header navigation
   - Multi-image galleries with zoom
2. **From Faire:**
   - Clean aesthetic with generous whitespace
   - Professional feel and high-quality imagery standards
   - Brand storytelling as first-class citizen
   - "Values" filters (Plastic-Free, Carbon Neutral, etc.)
   - Minimal navigation (content over chrome)
   - Machine learning for recommendations
3. **From Both:**
   - Mobile-first responsive design
   - Clear CTA hierarchy
   - Seller trust signals (ratings, badges)

### What We'll Avoid

1. **From Etsy:**
   - Cluttered UI with too many competing sections
   - Overwhelming options without curation
   - Inconsistent seller quality
   - Forced account creation (no guest checkout)
   - Hidden shipping costs
2. **From Faire:**
   - Overly corporate/formal feel (we want approachable)
   - Minimal search (B2C needs easy discovery)
   - Sparse information density (balance needed)

### Marketplace UX Best Practices Applied

1. **Onboarding:** No mandatory login to browse - let users explore before committing (industry best practice: avoid early registration walls)
2. **Search & Discovery:** Fast, typo-tolerant search (Meilisearch) with eco-specific filters - research shows effective UI can increase conversions 200%+
3. **Checkout Optimization:** Single-page checkout with progressive disclosure - Forrester study shows excellent UX increases conversions up to 400%
4. **Mobile-First:** 67% of mobile sites have mediocre-to-poor navigation UX - opportunity to outshine competitors
5. **Performance:** Target Lighthouse 90+ (most marketplaces underperform) - sub-2s load times
6. **Accessibility:** WCAG 2.1 AA from day one (44px+ touch targets, 4.5:1 contrast, keyboard nav)

---

## 10. Action Items

### Design Phase (Phase 0 - Week 1-3)

- [x] **Complete competitive UX research** (Etsy, Faire, marketplace best practices)
- [ ] **Create Figma design system** incorporating research insights (Week 1-2)
  - Color palette (forest greens already defined)
  - Typography scale (Inter font family)
  - Component library (buttons, cards, badges, forms)
  - Eco-specific components (sustainability badges, impact widgets, nonprofit cards)
- [ ] **Design high-fidelity mockups** (Week 2-3)
  - Homepage with mission-driven hero, impact metrics, curated collections
  - Product Discovery (search results, filters, product cards with eco-badges)
  - Product Detail Page with eco-impact section, nonprofit info, seller story
  - Shopping cart with impact summary
  - Checkout flow (single-page, guest-friendly, eco-shipping options)
  - Seller dashboard with impact metrics
  - Admin panel for seller verification
- [ ] **Prototype key user flows** (Week 3)
  - Product discovery → PDP → Cart → Checkout (guest)
  - Seller application → Verification → Product listing
  - Buyer account → Orders → Impact dashboard

### Development Phase (Starting Phase 1 - Week 4)

- [ ] Implement design system with research-informed patterns
- [ ] Build accessible components (keyboard nav, ARIA labels, WCAG 2.1 AA)
- [ ] Optimize for performance (target: Lighthouse 90+, sub-2s load times)
- [ ] Set up Meilisearch for typo-tolerant, fast search
- [ ] Implement eco-specific features (sustainability scoring algorithm, eco-badges, impact tracking)

### Future Research (Ongoing)

- [ ] User testing with target audience (eco-conscious consumers) - Phase 4
- [ ] Seller interviews (potential eco-businesses) - Phase 2
- [ ] Accessibility audit with screen reader users - Phase 5
- [ ] A/B testing: guest checkout vs. forced account creation - Phase 6
- [ ] Analytics review: conversion funnel optimization - Phase 9

---

## Resources

- **Figma Research Board:** [Link when created]
- **Screenshot Archive:** `/docs/research/` (to be created)
- **Competitive Analysis Spreadsheet:** [Link if created]

---

**Note:** This template should be filled in during Week 1-2 of Phase 0. Schedule time to thoroughly explore Etsy and Faire, taking screenshots and notes.
