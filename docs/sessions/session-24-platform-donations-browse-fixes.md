# Session 24: Platform Donation System (Flow 3) & Browse Page Improvements

**Date:** November 10, 2025
**Status:** ✅ Complete
**Focus:** Implemented automatic 1.5% platform donations and fixed browse page UX issues

---

## Major Features Implemented

### 1. Flow 3: Platform Revenue Donations (1.5% System)

**Overview:**

- Platform automatically donates **1.5% of every transaction** to nonprofits from the 6.5% platform fee
- Seller payout unchanged - donation comes from platform's revenue
- Platform net revenue: 5.0% (6.5% - 1.5%)

**Database Changes:**

- Added `PlatformSetting` model for platform-wide configuration
- Migration: `add_platform_setting_model`
- Stores key-value pairs (currently: `default_nonprofit_id`)

**Backend Implementation:**

- `/src/lib/platform-settings.ts` - Helper functions for getting/setting platform config
- `/src/actions/platform-settings.ts` - Admin-only server actions
- `/src/actions/payment.ts` - Updated order creation to calculate and create PLATFORM_REVENUE donations
- Automatic donation creation on every order with `donorType: 'PLATFORM_REVENUE'`

**Nonprofit Selection Logic:**

1. If seller has selected nonprofit → That nonprofit receives 1.5%
2. If seller has NO nonprofit → Platform default nonprofit receives 1.5%
3. If no default configured → Warning logged, donation skipped

**Admin UI:**

- `/admin/nonprofits` - New "Platform Default Nonprofit" selector at top of page
- Component: `PlatformDefaultSelector`
- Features:
  - Displays current default with logo and details
  - Dropdown of verified nonprofits
  - Real-time validation and feedback
  - Info box explaining 1.5% system

**Admin Financial Dashboard:**

- `/admin/financial` - Updated Platform Fees card
- Shows breakdown:
  - Total platform fees (6.5%): $X
  - Platform donations (1.5%): -$X
  - Net platform revenue (5.0%): $X
- Monthly tracking for both metrics
- Added to `PlatformMetrics` interface

**Checkout Display:**

- `/checkout` and `/checkout/payment` pages
- Subtle info box after order total
- Message: "Evercraft contributes 1.5% of every transaction to environmental nonprofits selected by sellers. Your purchase helps support their mission—at no extra cost to you."
- Green heart icon, NOT shown as line item

**Configuration:**

- Environment variable: `PLATFORM_DEFAULT_NONPROFIT_ID`
- Database setting overrides env variable
- Admin can change in UI at any time

**Bug Fix:**

- Fixed `getUserRole` import error in `platform-settings.ts`
- Changed from `@/lib/user-roles` to `@/lib/auth`
- Fixed role comparison from uppercase to lowercase

---

### 2. Browse Page UX Improvements

**Search Bar:**

- ✅ Added state management with debouncing (300ms)
- ✅ Wired up Input component with `value` and `onChange`
- ✅ Integrated with `getProducts()` server action
- ✅ Increased border-radius from `rounded-md` to `rounded-xl`
- Added to `clearFilters()` function

**Category Filter Buttons:**

- ✅ Fixed horizontal category buttons to actually filter products
- Buttons now call `toggleCategory()` when clicked (not just expand subcategories)
- Visual state (dark background) correctly reflects active filters

**Favorite Icon:**

- ✅ Removed white background that made icon invisible on hover
- New design:
  - Default: Outline with semi-transparent fill (`fill-white/40`)
  - Hover: Scale effect (`hover:scale-110`)
  - Favorited: Filled pink (`fill-current text-pink-600`)
- Added drop shadow for visibility over any background

**Layout:**

- ✅ Changed from `container mx-auto` to full-width layout
- New: `max-w-[2000px] mx-auto px-4 lg:px-6 xl:px-8`
- Updated product grid to 5 columns at xl breakpoint (was 4)
- Better utilization of screen space on wide displays

---

### 3. Shipping Threshold Removal

**Changes:**

- ❌ Removed hardcoded $50 free shipping threshold
- Updated `/src/lib/shipping.ts`:
  - Commented out `FREE_SHIPPING_THRESHOLD = 50`
  - Removed free shipping check from `calculateBaseRate()`
  - Set `freeShippingThreshold: 0` and `amountToFreeShipping: 0`
- Removed shipping message from checkout pages
- Added TODO comments for future per-seller implementation

**Future Implementation:**

- Sellers will set their own free shipping thresholds in `/seller/settings`
- Will be stored per-shop in database
- Shipping calculator will check shop-specific threshold

---

## Files Created

### New Files:

1. `/src/lib/platform-settings.ts` - Helper functions for platform config
2. `/src/actions/platform-settings.ts` - Admin server actions
3. `/src/app/admin/nonprofits/platform-default-selector.tsx` - UI component
4. `/prisma/migrations/xxx_add_platform_setting_model/` - Database migration

### Modified Files:

5. `/prisma/schema.prisma` - Added PlatformSetting model
6. `/src/actions/payment.ts` - Added platform donation logic
7. `/src/actions/admin-financial.ts` - Added platform donation metrics
8. `/src/app/admin/nonprofits/page.tsx` - Added default selector component
9. `/src/app/admin/financial/admin-overview-tab.tsx` - Updated fee breakdown UI
10. `/src/app/checkout/page.tsx` - Added platform donation info, removed shipping message
11. `/src/app/checkout/payment/page.tsx` - Added platform donation info
12. `/src/lib/shipping.ts` - Removed hardcoded free shipping threshold
13. `/.env.example` - Added PLATFORM_DEFAULT_NONPROFIT_ID

---

## Documentation Updates

### Updated:

1. `/docs/features/nonprofit-donations.md`:
   - Marked Flow 3 as ✅ Complete
   - Added detailed implementation section
   - Updated implementation status checklist
   - Added platform settings configuration details

2. `/docs/session-start/database_schema.md`:
   - Updated model count from 38 to 39
   - Added PlatformSetting model documentation
   - Added to Additional Entities list
   - Added Migration #10 to migration history

3. `/docs/setup/SHIPPING_CALCULATOR.md`:
   - Marked free shipping threshold as REMOVED
   - Updated configuration section
   - Added note about future per-seller implementation

### Created:

4. `/docs/sessions/session-24-platform-donations-browse-fixes.md` - This file

---

## Database Schema Changes

### New Model: PlatformSetting

```prisma
model PlatformSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@index([key])
}
```

**Current Usage:**

- `key: "default_nonprofit_id"` → Stores platform default nonprofit ID

**Future Potential:**

- Maintenance mode flags
- Platform-wide announcements
- Feature flags
- Global settings

---

## Testing Notes

### To Test Platform Donations:

1. **Setup:**
   - Go to `/admin/nonprofits`
   - Set platform default nonprofit
   - Verify it saves successfully

2. **Test Case 1 - Shop WITH Nonprofit:**
   - Add products from shop with `nonprofitId` set to cart
   - Complete purchase
   - Check database: Donation record with `donorType: 'PLATFORM_REVENUE'` should exist
   - Nonprofit should be the shop's selected nonprofit
   - Amount should be 1.5% of subtotal

3. **Test Case 2 - Shop WITHOUT Nonprofit:**
   - Add products from shop with `nonprofitId = NULL` to cart
   - Complete purchase
   - Check database: Donation record should exist
   - Nonprofit should be the platform default
   - Amount should be 1.5% of subtotal

4. **Verify Admin Dashboard:**
   - Go to `/admin/financial`
   - Check Platform Fees card shows:
     - Total fees (6.5%)
     - Platform donations (1.5%)
     - Net revenue (5.0%)
   - Go to `/admin/nonprofits/payouts`
   - Check pending donations include PLATFORM_REVENUE with purple badge

### To Test Browse Page:

1. **Search:**
   - Go to `/browse`
   - Type in search bar
   - Verify products filter in real-time (with 300ms debounce)

2. **Category Filters:**
   - Click category buttons
   - Verify products filter by category
   - Verify button shows active state (dark background)

3. **Favorite Icon:**
   - Hover over heart icons on product cards
   - Verify icon remains visible (no white background)
   - Click to favorite/unfavorite
   - Verify fill state changes

4. **Layout:**
   - View on wide screen (1280px+)
   - Verify 5 columns of products display
   - Verify proper spacing and padding

---

## Key Decisions

1. **Platform Donation Comes FROM 6.5% Fee:**
   - User chose Option A: 1.5% comes from existing platform fee
   - Seller payout unchanged
   - Platform net revenue reduced from 6.5% to 5.0%

2. **Subtle Checkout Display:**
   - NOT shown as line item (would confuse buyers)
   - Shown as informational text below total
   - Emphasizes "at no extra cost to you"

3. **Admin Configuration:**
   - Database setting preferred over env variable only
   - UI at `/admin/nonprofits` for easy changes
   - Verified nonprofits only

4. **Shipping Threshold Removal:**
   - Removed hardcoded $50 threshold completely
   - Will implement per-seller in future session
   - Seller settings UI is placeholder currently

---

## Technical Highlights

### Platform Donation Calculation:

```typescript
// In payment.ts createOrder()
const platformDonation = calculatePlatformDonation(shopSubtotal); // 1.5%
const platformNonprofitId = shop?.nonprofitId || (await getPlatformDefaultNonprofit());

if (platformNonprofitId && platformDonation > 0) {
  await tx.donation.create({
    data: {
      orderId: newOrder.id,
      nonprofitId: platformNonprofitId,
      shopId: shopId,
      amount: platformDonation,
      donorType: 'PLATFORM_REVENUE',
      status: 'PENDING',
    },
  });
}
```

### Debounced Search:

```typescript
// In browse page
const [searchQuery, setSearchQuery] = useState('');
const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);

// Use debouncedSearchQuery in getProducts() call
```

---

## Next Steps (Future Sessions)

1. **Seller Shipping Settings:**
   - Build out `/seller/settings` shipping tab
   - Add free shipping threshold per shop
   - Update shipping calculator to use shop-specific thresholds
   - Re-enable shipping message in checkout

2. **Platform Donation Analytics:**
   - Impact dashboard showing total platform contributions
   - Charts and graphs for donation trends
   - Per-nonprofit breakdown of platform donations

3. **Automated Nonprofit Payouts:**
   - Stripe Connect for nonprofits
   - Automated quarterly payouts
   - Email notifications

4. **Browse Page Enhancements:**
   - Save search filters/preferences
   - Advanced filtering (price range, certifications)
   - Sort options (price, newest, popular)

---

## Session Statistics

- **Duration:** ~3 hours
- **Files Created:** 4
- **Files Modified:** 13
- **Documentation Updated:** 4 files
- **Database Migrations:** 1
- **Models Added:** 1 (PlatformSetting)
- **Lines of Code:** ~800+
- **Issues Fixed:** 5 browse page bugs + 1 getUserRole bug

---

**Session Status:** ✅ All objectives completed successfully

**Key Achievement:** Implemented complete Flow 3 platform donation system (1.5%), providing sustainable funding mechanism for environmental nonprofits while maintaining seller payouts and improving platform sustainability.
