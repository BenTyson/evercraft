# CATEGORY HIERARCHY SYSTEM

**Created:** October 12, 2025
**Purpose:** Documentation for Evercraft's 2-level category taxonomy and management system.

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Category Structure](#category-structure)
3. [Database Schema](#database-schema)
4. [Admin Management](#admin-management)
5. [Product Form Integration](#product-form-integration)
6. [Files Reference](#files-reference)

---

## OVERVIEW

**Architecture:** 2-level hierarchical taxonomy (Parent Categories → Subcategories)

**Total Categories:** 82

- **13 top-level** parent categories
- **69 subcategories** across all parents

**Design Philosophy:**

- Industry-standard taxonomy based on Etsy and Faire best practices
- Optimized for sustainable/eco-friendly product marketplace
- Clear, specific subcategories for better product discovery
- SEO-friendly with dedicated category landing pages

---

## CATEGORY STRUCTURE

### 1. Home & Living (6 subcategories)

- Decor & Accents
- Lighting
- Bedding & Linens
- Storage & Organization
- Candles & Home Fragrance
- Rugs & Flooring

### 2. Kitchen & Dining (6 subcategories)

- Cookware & Bakeware
- Dinnerware
- Drinkware & Glassware
- Kitchen Linens
- Food Storage & Containers
- Utensils & Gadgets

### 3. Personal Care & Beauty (6 subcategories)

- Skincare
- Haircare
- Bath & Shower
- Oral Care
- Makeup & Cosmetics
- Men's Grooming

### 4. Fashion & Accessories (6 subcategories)

- Women's Clothing
- Men's Clothing
- Bags & Purses
- Jewelry
- Scarves & Wraps
- Hats & Caps

### 5. Baby & Kids (5 subcategories)

- Baby Clothing
- Toys & Games
- Nursery Decor
- Baby Care Products
- Kids' Clothing

### 6. Food & Beverages (5 subcategories)

- Coffee & Tea
- Snacks & Treats
- Pantry Staples
- Condiments & Sauces
- Baking Ingredients

### 7. Bath & Body (5 subcategories)

- Bath Salts & Soaks
- Soaps & Cleansers
- Body Scrubs & Exfoliants
- Lotions & Moisturizers
- Essential Oils

### 8. Wellness & Self-Care (5 subcategories)

- Aromatherapy
- Yoga & Meditation
- Fitness & Exercise
- Supplements & Vitamins
- Sleep & Relaxation

### 9. Outdoor & Garden (5 subcategories)

- Planters & Pots
- Gardening Tools
- Seeds & Plants
- Outdoor Decor
- Composting Supplies

### 10. Office & Stationery (5 subcategories)

- Notebooks & Journals
- Pens & Pencils
- Desk Organization
- Greeting Cards
- Gift Wrap & Packaging

### 11. Pet Supplies (5 subcategories)

- Pet Toys
- Pet Accessories
- Pet Grooming
- Pet Bedding
- Pet Treats & Food

### 12. Craft Supplies (5 subcategories)

- Fabrics & Textiles
- Yarns & Threads
- Natural Dyes
- Crafting Tools
- Kits & Projects

### 13. Art & Collectibles (5 subcategories)

- Wall Art & Prints
- Sculptures & Figurines
- Handmade Ceramics
- Photography
- Mixed Media

---

## DATABASE SCHEMA

### Category Model

```prisma
model Category {
  id              String     @id @default(cuid())
  parentId        String?    // Null for top-level categories
  name            String     // Display name
  slug            String     @unique // URL-friendly identifier
  description     String?    // Category description for SEO
  image           String?    // Optional category image
  metaTitle       String?    // SEO meta title
  metaDescription String?    // SEO meta description
  position        Int        @default(0) // Ordering within level
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  // Self-referential relations
  parent          Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children        Category[] @relation("CategoryToCategory")

  // Products in this category
  products        Product[]

  @@index([parentId])
  @@index([position])
  @@index([slug])
}
```

### Key Characteristics:

1. **Self-Referential:** Categories reference themselves for parent/child relationships
2. **Position Field:** Allows manual ordering of categories
3. **Slug Field:** Unique, URL-friendly identifier for SEO
4. **Two Levels Max:** parentId is either null (top-level) or references another category (subcategory)

---

## ADMIN MANAGEMENT

### Location: `/admin/categories`

**Features:**

- ✅ View all categories in hierarchical tree
- ✅ Expand/collapse parent categories
- ✅ Create top-level categories
- ✅ Add subcategories to any parent
- ✅ Edit category details (name, slug, description)
- ✅ Delete categories (with safety checks)
- ✅ View product counts per category
- ✅ Statistics dashboard

### CRUD Operations

**Create Category:**

- Click "Create Category" button
- Fill in: Name, Slug (auto-generated), Description
- Optionally select parent for subcategory
- Validates slug uniqueness

**Edit Category:**

- Click edit icon on any category
- Modify name, slug, or description
- Cannot change parent (would require reassigning products)

**Delete Category:**

- Click delete icon
- ⚠️ **Safety Checks:**
  - Cannot delete if category has products
  - Cannot delete if category has subcategories
  - Shows clear error messages with counts

**View Statistics:**

- Top-level category count
- Subcategory count
- Total categories
- Total products across all categories

---

## PRODUCT FORM INTEGRATION

### Cascading Category Selector

**Component:** `CascadingCategorySelect`
**Location:** `/src/components/categories/cascading-category-select.tsx`

**UI Pattern:**

```
[Select Category ▼]      ← First dropdown (13 parent categories)
        ↓
[Select Subcategory ▼]   ← Second dropdown (filtered by parent)
        ↓
✅ Selected: Fashion & Accessories → Bags & Purses
```

**Features:**

- Two-level cascading dropdowns
- Auto-filtering: Subcategory dropdown updates based on parent selection
- Required field validation
- Clear/reset button
- Visual confirmation of selection
- Disabled state during form submission

**Implementation:**

```tsx
<CascadingCategorySelect
  categories={hierarchicalCategories}
  value={selectedCategoryId}
  onChange={(categoryId) => handleCategoryChange(categoryId)}
  disabled={isSubmitting}
  required
/>
```

**Data Shape:**

```typescript
interface HierarchicalCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number; // Active product count
  children: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    count: number;
  }>;
}
```

---

## FILES REFERENCE

### Admin Management UI (5 files)

**`/src/app/admin/categories/page.tsx` (120 lines)**

- Main admin page
- Statistics dashboard
- Integrates tree view and create button

**`/src/app/admin/categories/category-tree-view.tsx` (220 lines)**

- Hierarchical tree component
- Expand/collapse functionality
- Action buttons (edit, delete, add subcategory)
- Manages dialogs state

**`/src/app/admin/categories/category-form-dialog.tsx` (180 lines)**

- Create/edit modal
- Auto-generates slugs from names
- Supports both top-level and subcategories
- Form validation

**`/src/app/admin/categories/create-category-button.tsx` (30 lines)**

- Reusable button component
- Opens creation dialog

**`/src/app/admin/categories/delete-category-dialog.tsx` (120 lines)**

- Delete confirmation modal
- Safety checks with clear messaging
- Prevents destructive deletes

### Server Actions

**`/src/actions/admin-categories.ts` (450 lines)**

**Functions:**

```typescript
// Fetch operations
getAllCategoriesHierarchy() // Full tree for admin
getCategoryStats()           // Statistics dashboard
getCategoryById(id)          // Single category for editing

// CRUD operations
createCategory(data)         // Create new category/subcategory
updateCategory(id, data)     // Edit existing category
deleteCategory(id)           // Delete with safety checks
reorderCategories(updates)   // Update position field

// All functions include:
- Admin authorization check (isAdmin())
- Error handling
- Path revalidation for Next.js cache
- Detailed success/error responses
```

### Product Form Integration

**`/src/components/categories/cascading-category-select.tsx` (200 lines)**

- Two-level dropdown component
- State management for parent/child selection
- Auto-filtering logic
- Visual feedback and validation

**`/src/actions/products.ts` - New function:**

```typescript
getCategoriesHierarchical(); // Fetch categories for product form
```

### Seed Data

**`/prisma/seed-categories.ts` (450 lines)**

- Comprehensive category taxonomy
- Creates all 82 categories with descriptions
- Maintains position ordering
- Reusable seed function

### Public Pages

**`/src/app/categories/page.tsx`**

- Browse all top-level categories
- Grid layout with subcategory preview

**`/src/app/categories/[slug]/page.tsx`**

- Individual category landing page
- Breadcrumbs navigation
- Subcategory cards
- Featured products from category
- SEO optimized (JSON-LD, meta tags)

### Navigation Updates

**`/src/app/admin/layout.tsx`**

- Added "Categories" link to admin sidebar
- Uses FolderTree icon

---

## USAGE PATTERNS

### For Developers

**Fetching Categories for Dropdowns:**

```typescript
import { getCategoriesHierarchical } from '@/actions/products';

const categories = await getCategoriesHierarchical();
// Returns: Array<{ id, name, slug, children: [...] }>
```

**Admin Operations:**

```typescript
import { createCategory, updateCategory, deleteCategory } from '@/actions/admin-categories';

// Create top-level category
await createCategory({
  name: 'New Category',
  slug: 'new-category',
  description: 'Description here',
});

// Create subcategory
await createCategory({
  name: 'Subcategory',
  slug: 'subcategory',
  parentId: 'parent-category-id',
});

// Update category
await updateCategory(categoryId, {
  name: 'Updated Name',
  description: 'New description',
});

// Delete category
await deleteCategory(categoryId);
// Returns error if has products or children
```

### For Sellers

**Assigning Categories to Products:**

1. Navigate to `/seller/products/new`
2. In "Category Selection" section, see two dropdowns
3. Select parent category first (e.g., "Fashion & Accessories")
4. Subcategory dropdown auto-populates with relevant options
5. Select specific subcategory (e.g., "Bags & Purses")
6. Visual confirmation shows: "Selected: Fashion & Accessories → Bags & Purses"

### For Admins

**Managing Categories:**

1. Navigate to `/admin/categories`
2. View statistics dashboard at top
3. See hierarchical tree of all categories
4. Click arrow to expand/collapse parent categories
5. Use action buttons:
   - **Plus icon:** Add subcategory to parent
   - **Edit icon:** Modify category details
   - **Trash icon:** Delete (if no products/children)

---

## SEO BENEFITS

### Category Landing Pages

Each category has a dedicated SEO-optimized page at `/categories/[slug]`:

**Features:**

- ✅ JSON-LD structured data (CollectionPage schema)
- ✅ Breadcrumb navigation with schema markup
- ✅ Custom meta title and description
- ✅ Open Graph tags for social sharing
- ✅ Canonical URLs
- ✅ Product count displayed
- ✅ Subcategory grid for exploration
- ✅ Featured products from category

**Example URL Structure:**

```
/categories/home-living           (parent category)
/categories/candles-fragrance     (subcategory)
/categories/fashion-accessories   (parent)
/categories/bags-purses           (subcategory)
```

---

## SCALABILITY

### Adding New Categories

**Option 1: Via Admin UI** (Recommended for individual additions)

1. Navigate to `/admin/categories`
2. Click "Create Category" or "Add Subcategory"
3. Fill in details and save

**Option 2: Via Seed Script** (Recommended for bulk additions)

1. Edit `/prisma/seed-categories.ts`
2. Add new categories in appropriate section
3. Run `npx prisma db seed`

### Future Enhancements (Not Implemented)

**Potential Additions:**

- [ ] Reordering via drag-and-drop
- [ ] Bulk category operations
- [ ] Category images upload
- [ ] SEO metadata editor in admin UI
- [ ] Category merge/split tools
- [ ] Analytics per category
- [ ] 3rd level categories (if needed)

---

## TROUBLESHOOTING

### Common Issues

**Issue:** "Cannot delete category - has products"
**Solution:** Reassign all products to different category first, then delete

**Issue:** "Cannot delete category - has subcategories"
**Solution:** Delete all subcategories first, then delete parent

**Issue:** "Slug already exists"
**Solution:** Choose a different slug or edit the existing category with that slug

**Issue:** Categories not showing in product form
**Solution:** Ensure `getCategoriesHierarchical()` is being used instead of old `getCategories()`

**Issue:** Subcategory dropdown empty
**Solution:** Select a parent category first - dropdown auto-populates based on parent

---

## PERFORMANCE NOTES

**Database Queries:**

- Category tree: Single query with nested includes (efficient)
- Product counts: Aggregated via Prisma `_count`
- Indexes on: `parentId`, `slug`, `position` for fast lookups

**Caching:**

- Category pages use Next.js static generation
- `revalidatePath()` called after CRUD operations
- Admin page server-rendered for real-time data

**Best Practices:**

- Always fetch categories server-side
- Use `getCategoriesHierarchical()` for hierarchical needs
- Use `getTopLevelCategories()` for flat top-level lists only

---

**End of Categories System Documentation**
