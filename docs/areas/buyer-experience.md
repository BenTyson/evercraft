# Buyer Experience System

Complete reference for buyer-facing routes, components, and flows.

**Last Updated:** October 23, 2025

---

## Overview

The buyer experience encompasses product discovery, shopping, checkout, and order management. All public-facing pages are accessible without authentication, with enhanced features for logged-in users.

**Related documentation:**

- [Product Variants](../features/product-variants.md) - Variant selection in cart and checkout
- [Eco Impact V2](../features/eco-impact-v2.md) - 13 eco-filters on browse page
- [Database Schema](../session-start/database_schema.md) - Product/Order/Review models
- [Seller Dashboard](./seller-dashboard.md) - Cross-reference for product management

---

## Page Routes

### Public Pages

| Route                | File                                  | Lines | Description                                           |
| -------------------- | ------------------------------------- | ----- | ----------------------------------------------------- |
| `/`                  | `/src/app/page.tsx`                   | 203   | Homepage with hero, featured products, impact stats   |
| `/home`              | `/src/app/home/page.tsx`              | 331   | Alternative homepage layout                           |
| `/browse`            | `/src/app/browse/page.tsx`            | 632   | Product catalog with 13 eco-filters, sorting, search  |
| `/products/[id]`     | `/src/app/products/[id]/page.tsx`     | 444   | Product detail with eco-profile, reviews, variants    |
| `/shop/[slug]`       | `/src/app/shop/[slug]/page.tsx`       | 268   | Shop storefront (products, story, reviews, nonprofit) |
| `/categories`        | `/src/app/categories/page.tsx`        | 104   | Category browsing with visual grid layout             |
| `/categories/[slug]` | `/src/app/categories/[slug]/page.tsx` | 267   | Category page with products and SEO                   |
| `/impact`            | `/src/app/impact/page.tsx`            | 354   | Impact dashboard with real-time metrics               |

**Browse Page Features:**

- 13 eco-filters (see [Eco Impact V2](../features/eco-impact-v2.md#browse-filters))
- Horizontal category bar with expandable subcategories
- Toggleable sidebar filters (default hidden, Faire-inspired aesthetic)
- Sort options (featured, price, rating, newest)
- Large search bar with descriptive placeholder
- Grid view with product cards (browse variant - minimal, clean design)

**Product Detail Page Features:**

- Image gallery with zoom
- Variant selection (see [Product Variants](../features/product-variants.md))
- Add to cart with quantity selector
- Eco-profile section with badges
- Reviews and ratings
- Seller information card
- Nonprofit badge (if applicable)
- Similar items recommendations

### Cart & Checkout

| Route                    | File                                      | Lines | Description                      |
| ------------------------ | ----------------------------------------- | ----- | -------------------------------- |
| `/cart`                  | `/src/app/cart/page.tsx`                  | 207   | Shopping cart management         |
| `/checkout`              | `/src/app/checkout/page.tsx`              | 367   | Checkout flow (shipping address) |
| `/checkout/payment`      | `/src/app/checkout/payment/page.tsx`      | 207   | Payment processing with Stripe   |
| `/checkout/confirmation` | `/src/app/checkout/confirmation/page.tsx` | 161   | Order confirmation page          |

**Cart Features:**

- Multi-shop cart handling (items grouped by shop)
- Variant display (size, color, etc.)
- Quantity updates
- Remove items
- Shipping cost estimation
- Nonprofit donation preview
- Zustand state management with persistence

**Checkout Features:**

- Guest checkout option
- Shipping address (Google autocomplete)
- Stripe payment (cards, Apple Pay, Google Pay)
- Order review step
- Nonprofit donation display
- Place order with loading state

### Buyer Dashboard (Auth Required)

| Route              | File                                | Lines | Description                |
| ------------------ | ----------------------------------- | ----- | -------------------------- |
| `/orders`          | `/src/app/orders/page.tsx`          | 216   | User's order history       |
| `/orders/[id]`     | `/src/app/orders/[id]/page.tsx`     | 353   | Order detail with tracking |
| `/account/reviews` | `/src/app/account/reviews/page.tsx` | 56    | User's reviews management  |
| `/favorites`       | `/src/app/favorites/page.tsx`       | 123   | User's favorited products  |

**Order Features:**

- Order list with status filtering
- Order detail with tracking
- Download invoice (PDF)
- Request cancellation (before shipped)
- Leave review (after delivery)
- Contact seller (via messaging system)

**Reviews Features:**

- View all own reviews
- Edit/delete reviews
- Product context and links
- Star rating display

**Favorites Features:**

- Grid view of favorited products
- Remove from favorites
- Stock status on favorites
- Add to cart from favorites

### Authentication Pages

| Route                     | File                                       | Description   |
| ------------------------- | ------------------------------------------ | ------------- |
| `/sign-in/[[...sign-in]]` | `/src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in |
| `/sign-up/[[...sign-up]]` | `/src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up |

### Messaging (Auth Required)

| Route                | File                                  | Lines | Description                    |
| -------------------- | ------------------------------------- | ----- | ------------------------------ |
| `/messages`          | `/src/app/messages/page.tsx`          | 152   | Buyer inbox with conversations |
| `/messages/[userId]` | `/src/app/messages/[userId]/page.tsx` | 113   | Thread with seller             |

**Messaging Features:**

- Conversation-based inbox (grouped by participants)
- Text messages (up to 2000 characters)
- Image attachments (up to 3 per message, 4MB each)
- Order context linking
- Unread count badge in header
- Real-time read status updates
- Lightbox image viewer

**Entry Points:**

- Product detail pages: Contact button next to seller info
- Shop pages: Contact Shop Owner button in hero
- Product cards: MessageCircle icon on hover
- Order detail pages: Message Seller button per order item

---

## Components

### Navigation Components

**SiteHeader**

- **Purpose:** Main site navigation
- **File:** `/src/components/layout/site-header.tsx` (333 lines)
- **Features:**
  - Sticky positioning on scroll
  - Logo and primary navigation links
  - Cart icon with item count badge
  - Messages icon with unread count badge
  - Favorites icon (authenticated users)
  - User account menu / Sign-in button
  - Mobile hamburger menu with full navigation
  - Role-based navigation (Seller Dashboard, Admin links)
  - **Removed:** Desktop search bar (Session 20 - search moved to browse page)
  - **Removed:** Mobile search bar (Session 20 - search moved to browse page)

### Product Discovery Components

**Product Card**

- **Purpose:** Product display in grids
- **File:** `/src/components/eco/product-card.tsx` (303 lines)
- **Variants:** `default`, `shop`, `browse`
- **Features:**
  - Primary image with lazy loading
  - Title, price, compare-at price
  - Eco-badges (conditionally shown based on variant)
  - Seller name with contact button (conditionally shown)
  - Heart favorite icon (overlaid on image top-right)
  - Quick Add button (only on default variant)
  - Product ratings (only on default variant)
  - Variant display: "From $X" for products with variants
  - Clean, Faire-inspired aesthetic

**Product Grid**

- **Purpose:** Responsive grid layout
- **Features:**
  - 1-4 columns based on screen size
  - Infinite scroll or pagination
  - Loading skeletons

**Filter Sidebar**

- **Purpose:** Product filtering on browse page
- **File:** `/src/components/eco/eco-filter-panel.tsx` (163 lines)
- **File:** `/src/components/filters/hierarchical-category-filter.tsx` (139 lines)
- **UI Pattern:** Toggleable sidebar (default hidden), Faire-inspired clean aesthetic
- **Features:**
  - 13 eco-filters organized by groups (Materials, Packaging, Carbon & Origin)
  - Hierarchical category filter with expandable subcategories
  - Certifications filter with product counts
  - Uppercase section headers with muted color
  - Hover states on checkboxes for better UX
  - Compact spacing and consistent styling
  - Clear all button
  - Active filter chips with remove option
  - **Removed:** Minimum eco-completeness slider (Session 20)
  - **Removed:** Price range slider (not implemented)

**Sort Dropdown**

- **Purpose:** Product sorting
- **Options:**
  - Relevance (default)
  - Price: Low to High
  - Price: High to Low
  - Newest
  - Highest Eco-Score

### Product Detail Components

**Image Gallery**

- **Purpose:** Product image carousel
- **Features:**
  - Thumbnail navigation
  - Zoom on hover/click
  - Fullscreen mode
  - Multiple angles

**Variant Selector**

- **Purpose:** Select product variant
- **Features:**
  - Size/color swatches
  - Real-time availability check
  - Disabled variants (sold out)
  - Price updates on selection
- **See:** [product-variants.md](../features/product-variants.md)

**Eco-Profile Section**

- **Purpose:** Display product eco-attributes
- **Features:**
  - Completeness percentage
  - Eco-badges (organic, recycled, vegan, etc.)
  - Materials breakdown
  - Certifications with verification
  - Packaging information
- **See:** [eco-impact-v2.md#product-eco-profile](../features/eco-impact-v2.md#product-eco-profile)

**Reviews Section**

- **Purpose:** Product reviews and ratings
- **Features:**
  - Star distribution chart
  - Verified purchase badges
  - Photo reviews
  - Sort/filter reviews
  - Pagination
  - Mark as helpful

### Cart Components

**Cart Item**

- **Purpose:** Single cart item display
- **Features:**
  - Product image and title
  - Variant display (if applicable)
  - Quantity selector
  - Price and subtotal
  - Remove button

**Cart Summary**

- **Purpose:** Order summary
- **Features:**
  - Items subtotal
  - Estimated shipping
  - Estimated tax
  - Nonprofit donation
  - Total
  - Checkout button

### Checkout Components

**Address Form**

- **Purpose:** Shipping address input
- **Features:**
  - Google autocomplete
  - Save address (logged-in users)
  - Multiple addresses support
  - Billing same as shipping checkbox

**Payment Form**

- **Purpose:** Stripe payment input
- **Features:**
  - Stripe Elements (secure card input)
  - Apple Pay / Google Pay
  - Save card for future checkbox
  - Loading states

**Order Review**

- **Purpose:** Final order review before payment
- **Features:**
  - All items (grouped by shop)
  - Shipping address
  - Payment method preview
  - Edit links
  - Place order button

### Order Components

**Order Card**

- **Purpose:** Order list item
- **Features:**
  - Order number, date
  - Status badge
  - Item count
  - Total price
  - View details link

**Order Detail**

- **Purpose:** Full order view
- **Features:**
  - Order timeline (ordered → shipped → delivered)
  - Item list with images
  - Shipping address
  - Tracking information
  - Download invoice
  - Contact seller button
  - Leave review button (after delivery)

**Tracking Timeline**

- **Purpose:** Order status visualization
- **Features:**
  - Status steps
  - Estimated delivery date
  - Carrier tracking link

### Review Components

**StarRating**

- **File:** Component in reviews system
- **Purpose:** Display or input star rating
- **Sizes:** sm (16px), md (20px), lg (24px)
- **Colors:** Filled (yellow), Empty (gray)

**ReviewForm**

- **File:** Component in reviews system
- **Purpose:** Create/edit review
- **Features:**
  - Interactive 5-star rating
  - Text input (10-1000 chars)
  - Image upload (optional, UploadThing)
  - Validation
  - Cancel/Submit actions

**ProductReviews**

- **File:** Component in reviews system
- **Purpose:** Product review list
- **Features:**
  - Filter (all, verified only)
  - Sort (recent, highest rated, most helpful)
  - Review cards with author, rating, text, images
  - Verified purchase badges
  - Helpful vote button
  - Pagination

### Messaging Components

**ConversationsList**

- **File:** `/src/components/messages/conversations-list.tsx`
- **Purpose:** Inbox view with all conversations
- **Features:**
  - List of conversations sorted by last message
  - Unread count badge per conversation
  - Last message preview (text or image indicator)
  - Avatar and participant name
  - Timestamp display

**ConversationThread**

- **File:** `/src/components/messages/conversation-thread.tsx`
- **Purpose:** Message thread display with auto-scroll
- **Features:**
  - Messages grouped by date
  - Auto-scroll to bottom on new message
  - Empty state for new conversations
  - Sticky header with scroll behavior

**MessageBubble**

- **File:** `/src/components/messages/message-bubble.tsx`
- **Purpose:** Individual message display
- **Features:**
  - Images above text (best practice layout)
  - Grid layout: 1 image (4:3), 2 images (side-by-side), 3 images (first full + two below)
  - Forest green (#1B4332) for sent messages
  - Neutral gray (#F1F3F5) for received messages
  - Click images to open lightbox
  - Order link badge (if order context)
  - Timestamp display

**MessageComposer**

- **File:** `/src/components/messages/message-composer.tsx`
- **Purpose:** Send messages with text and/or images
- **Features:**
  - Textarea with auto-resize
  - Image upload button (UploadThing)
  - Image preview thumbnails before sending
  - Remove images before sending
  - Character count (max 2000)
  - Send button (Enter or Shift+Enter)
  - Supports image-only messages

**ImageLightbox**

- **File:** `/src/components/messages/image-lightbox.tsx`
- **Purpose:** Full-screen image viewer
- **Features:**
  - Click to view full-size images
  - Navigate between images (arrows, keyboard)
  - Close on ESC or overlay click
  - Image counter (1 of 3)
  - Portal/modal implementation

**MarkReadHandler**

- **File:** `/src/components/messages/mark-read-handler.tsx`
- **Purpose:** Client-side read marking
- **Features:**
  - Marks conversation as read on mount
  - Refreshes router to update unread counts
  - No visual render (returns null)

---

## Server Actions

### Product Actions

**File:** `/src/actions/products.ts` (348 lines)

| Function              | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `getProducts(params)` | Fetch products with 13 eco-filters, sorting, pagination  |
| `getProductById(id)`  | Get product details with eco-profile, reviews, shop info |
| `getCategories()`     | List categories with product counts                      |
| `getCertifications()` | List certifications with counts                          |

**Features:**

- ✅ 13 eco-filters: organic, recycled, vegan, biodegradable, fairTrade, plasticFree, recyclable, compostable, minimal, carbonNeutral, local, madeToOrder, renewableEnergy
- ✅ Includes eco-profile data in queries
- ✅ Includes shop eco-profile tier and completeness
- ✅ Sort options: featured, price-low, price-high, rating, newest

**See:** [eco-impact-v2.md#browse-filters](../features/eco-impact-v2.md#browse-filters)

### Shop Actions

**File:** `/src/actions/shops.ts` (311 lines)

| Function               | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `getShopBySlug(slug)`  | Get shop details by slug or ID (includes visible sections) |
| `getShopProducts()`    | Fetch shop products with pagination and section filtering  |
| `getShopReviews()`     | Fetch shop seller reviews with pagination                  |
| `getShopReviewStats()` | Calculate shop rating statistics                           |

**Features:**

- ✅ Shop storefront data fetching with sections
- ✅ Section filtering via `sectionSlug` parameter
- ✅ Section tabs with product counts
- ✅ Average rating calculation
- ✅ Pagination for products and reviews

**See:** [shop-sections.md](../features/shop-sections.md) for section system

### Category Actions

**File:** `/src/actions/categories.ts` (223 lines)

| Function                    | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `getCategoryHierarchy()`    | Get all categories organized by parent/child    |
| `getTopLevelCategories()`   | Get only parent categories with children        |
| `getCategoryBySlug(slug)`   | Get single category with metadata and relations |
| `getCategoryWithProducts()` | Get category with sample products (limit 8)     |

**Features:**

- ✅ Hierarchical category structure
- ✅ Active product counts
- ✅ Subcategory relationships
- ✅ Category metadata (description, images, SEO)

### Favorites Actions

**File:** `/src/actions/favorites.ts` (197 lines)

| Function                      | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `toggleFavorite(productId)`   | Add/remove product from favorites              |
| `checkIsFavorited(productId)` | Check if product is favorited                  |
| `getFavorites()`              | Get user's all favorited products with details |
| `getFavoritesCount()`         | Get count of user's favorites                  |

**Features:**

- ✅ Optimistic updates for instant UI feedback
- ✅ Authentication required
- ✅ Full product data with shop, category, certifications

### Order Actions

**File:** `/src/actions/orders.ts` (394 lines)

| Function                                  | Purpose                                   |
| ----------------------------------------- | ----------------------------------------- |
| `getUserOrders()`                         | Buyer's order history                     |
| `getOrderById(orderId)`                   | Order details for buyer                   |
| `updateOrderStatus(orderId, status)`      | Seller updates order status (sends email) |
| `bulkUpdateOrderStatus(orderIds, status)` | Bulk status update                        |

**Features:**

- ✅ Order history with filtering
- ✅ Order detail with tracking
- ✅ Email notifications on status updates

### Payment Actions

**File:** `/src/actions/payment.ts` (252 lines)

| Function                     | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `createPaymentIntent(input)` | Create Stripe payment intent          |
| `createOrder(input)`         | Create order after successful payment |

**Features:**

- ✅ Stripe payment integration
- ✅ Inventory checking and decrementing
- ✅ Order confirmation emails
- ✅ Transactional order creation
- ✅ Nonprofit donation calculation

### Review Actions

**File:** `/src/actions/reviews.ts` (520+ lines)

| Function                                | Purpose                              |
| --------------------------------------- | ------------------------------------ |
| `createReview(input)`                   | Submit new review                    |
| `getProductReviews(productId, filters)` | Fetch reviews with filtering/sorting |
| `getReviewStats(productId)`             | Calculate avg rating & distribution  |
| `updateReview(id, input)`               | Edit existing review                 |
| `deleteReview(id)`                      | Remove review                        |
| `markReviewHelpful(id)`                 | Helpful vote system                  |
| `getUserReviews()`                      | User review history                  |
| `canUserReview(productId)`              | Eligibility checking                 |

**Features:**

- ✅ 1-5 star ratings
- ✅ Verified purchase badges
- ✅ Review images (UploadThing)
- ✅ Helpful vote system
- ✅ Rating aggregation and statistics
- ✅ Filtering (all, verified only)
- ✅ Sorting (recent, highest rated, most helpful)

### Messaging Actions

**File:** `/src/actions/messages.ts` (465 lines)

| Function                       | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `getConversations()`           | User's conversations with unread counts        |
| `getConversation(otherUserId)` | Get or create thread with another user         |
| `sendMessage(input)`           | Send text and/or images (creates conversation) |
| `markConversationAsRead(id)`   | Mark all messages in conversation as read      |
| `getUnreadCount()`             | Total unread messages for header badge         |
| `getOrderMessages(orderId)`    | Get messages related to specific order         |

**Input Structure:**

```typescript
sendMessage({
  toUserId: string,
  body: string,              // Can be empty if attachments present
  orderId?: string,          // Optional order context
  subject?: string,
  attachments?: string[]     // Image URLs from UploadThing
})
```

**Features:**

- ✅ Conversation-based grouping (optimizes inbox queries)
- ✅ Unread count tracking per participant (stored in Conversation model)
- ✅ Image attachments (up to 3, 4MB each via UploadThing messageImage route)
- ✅ Image-only messages supported (body can be empty string)
- ✅ Order context linking for buyer-seller communication
- ✅ Smart previews ("📷 Sent 2 images" if no text)
- ✅ Client-side read marking (avoids SSR revalidation issues)

**Implementation Notes:**

- Uses two-model approach (Conversation + Message) for performance
- Unread counts increment on send, reset on markConversationAsRead
- MarkReadHandler client component handles read marking after page load
- Supports sending from multiple entry points (product pages, shop pages, orders)

---

## State Management

### Cart State (Zustand)

**File:** `/src/stores/cart-store.ts`

**State:**

- `items`: CartItem[] - Cart items with product, variant, quantity
- `addItem(item)` - Add product to cart
- `removeItem(itemId)` - Remove item from cart
- `updateQuantity(itemId, quantity)` - Update item quantity
- `clearCart()` - Empty cart
- `getItemCount()` - Total items in cart
- `getCartTotal()` - Total price

**Features:**

- ✅ LocalStorage persistence
- ✅ Optimistic updates
- ✅ Variant support (see [Product Variants](../features/product-variants.md))
- ✅ Multi-shop handling

---

## User Flows

### Product Discovery Flow

1. **Browse Products** (`/browse`)
   - Apply eco-filters (see [Eco Impact](../features/eco-impact-v2.md#browse-filters))
   - Sort by relevance, price, eco-score
   - Search products
   - View product grid

2. **View Product Detail** (`/products/[id]`)
   - See product images, description, price
   - View eco-profile and badges
   - Select variant (if applicable)
   - Read reviews
   - View seller information
   - Add to cart

3. **Alternative: Shop Storefront** (`/shop/[slug]`)
   - Browse seller's products
   - Filter by section (see [Shop Sections](../features/shop-sections.md))
   - View seller story and eco-credentials
   - See nonprofit partnership

### Purchase Flow

1. **Cart** (`/cart`)
   - Review items (grouped by shop)
   - Update quantities
   - See shipping estimate
   - See nonprofit donation
   - Proceed to checkout

2. **Checkout - Shipping** (`/checkout`)
   - Guest checkout or sign in
   - Enter shipping address (Google autocomplete)
   - Select saved address (logged-in)
   - Continue to payment

3. **Checkout - Payment** (`/checkout/payment`)
   - Enter payment method (Stripe Elements)
   - Use saved card (logged-in)
   - Apple Pay / Google Pay
   - Review order summary
   - Place order

4. **Confirmation** (`/checkout/confirmation`)
   - View order number
   - See order summary
   - Impact metrics (nonprofit donation, eco-score)
   - Email receipt sent

### Post-Purchase Flow

1. **Order Tracking** (`/orders/[id]`)
   - View order status
   - Track shipment (carrier integration)
   - Download invoice
   - Contact seller
   - Wait for delivery

2. **Leave Review** (`/account/reviews`)
   - Navigate to reviews page
   - Select product to review
   - Submit rating and review
   - Upload review images (optional)

---

## Database Models (Quick Reference)

**Primary models used by buyer experience:**

### Product

**Relations:** ProductImage, ProductVariant, Category, ProductEcoProfile, Review
**See:** [database_schema.md#products](../session-start/database_schema.md#products)

### ProductVariant

**Relations:** Product, ProductImage, OrderItem
**See:** [database_schema.md#productvariants](../session-start/database_schema.md#productvariants)
**See also:** [product-variants.md](../features/product-variants.md)

### Order

**Relations:** User (buyer), OrderItem, Payment
**See:** [database_schema.md#orders](../session-start/database_schema.md#orders)

### OrderItem

**Relations:** Order, Product, ProductVariant, Shop, Nonprofit
**See:** [database_schema.md#orderitems](../session-start/database_schema.md#orderitems)

### Review

**Relations:** Product, User
**See:** [database_schema.md#reviews](../session-start/database_schema.md#reviews)

### Favorite

**Relations:** User, Product
**See:** [database_schema.md#favorites](../session-start/database_schema.md#favorites)

### Conversation

**Relations:** User (participant1, participant2), Message
**See:** [database_schema.md#conversations](../session-start/database_schema.md#conversations)

### Message

**Relations:** Conversation, User (from, to)
**See:** [database_schema.md#messages](../session-start/database_schema.md#messages)

---

## Common Patterns & Gotchas

### Variant Selection in Cart

When adding variant products to cart, include both `productId` and `variantId`:

```typescript
// ✅ Correct
cartStore.addItem({
  productId: product.id,
  variantId: selectedVariant.id, // Include variant ID
  quantity: 1,
});
```

**See:** [product-variants.md#cart-integration](../features/product-variants.md#cart-integration)

### Eco-Filtering Products

Use specific eco-attribute fields, not generic `ecoScore`:

```typescript
// ✅ Correct - filter by specific attributes
const products = await db.product.findMany({
  where: {
    ecoProfile: {
      isOrganic: true,
      plasticFreePackaging: true,
      completenessPercent: { gte: 60 },
    },
  },
});
```

**See:** [eco-impact-v2.md#browse-filters](../features/eco-impact-v2.md#browse-filters)

### Order Item Grouping

Group order items by shop for multi-shop orders:

```typescript
// ✅ Correct - group by shop
const itemsByShop = order.items.reduce(
  (acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  },
  {} as Record<string, OrderItem[]>
);
```

---

## Implementation Status

### ✅ Fully Implemented

- Product discovery (browse, search, filters)
- Product detail pages with eco-profiles
- Shopping cart with Zustand persistence
- Checkout flow (shipping, payment, confirmation)
- Order tracking with Shippo integration
- Reviews and ratings system
- Favorites/wishlist
- Category browsing
- Shop storefronts with sections
- Buyer-seller messaging (text + images)

### 📋 Not Yet Implemented

- Gift registry
- Wishlists (multiple lists)
- Referral program
- Social sharing
- Product recommendations (AI-powered)
- Saved searches
- Price drop notifications

---

**Related Documentation:**

- [Product Variants](../features/product-variants.md)
- [Shop Sections](../features/shop-sections.md)
- [Eco Impact V2](../features/eco-impact-v2.md)
- [Database Schema](../session-start/database_schema.md)
- [Seller Dashboard](./seller-dashboard.md)
- [Admin Dashboard](./admin-dashboard.md)
