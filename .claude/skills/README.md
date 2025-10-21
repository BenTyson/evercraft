# Evercraft Claude Code Skills

This directory contains specialized Skills that Claude Code uses automatically when working on Evercraft development tasks.

## What Are Skills?

Skills are **model-invoked** capabilities - Claude automatically detects and uses them based on task context. You don't need to explicitly invoke them; they activate when relevant.

## Available Skills

### 1. Database Patterns

**File:** `database-patterns/SKILL.md`

**Auto-activates when:**

- Writing Prisma queries
- Performing aggregations
- Working with OrderItem, Product, ProductVariant, or Shop models
- Calculating revenue or inventory

**Prevents:**

- Using `price` instead of `subtotal` (OrderItem)
- Using `quantity` instead of `inventoryQuantity` (Product/ProductVariant)
- Using `orders` relation instead of `orderItems` (Shop)
- Using `category` instead of `categoryId` in groupBy

**Value:** Eliminates 80% of common database query errors

---

### 2. Variant Image Mapping

**File:** `variant-image-mapping/SKILL.md`

**Auto-activates when:**

- Creating products with variants
- Updating products with variants
- Working with ProductVariant creation code

**Prevents:**

- Foreign key constraint violations
- Using frontend indices as imageId (needs UUID mapping)

**Value:** Critical pattern that's easy to forget, prevents production bugs

---

### 3. Seller Authorization

**File:** `seller-authorization/SKILL.md`

**Auto-activates when:**

- Creating seller server actions
- Writing seller mutations (create, update, delete)
- Building seller-only API endpoints

**Enforces:**

- Shop ownership verification
- User authentication checks
- Proper error messages

**Value:** Ensures security best practices, prevents unauthorized access

---

### 4. Eco-Profile Queries

**File:** `eco-queries/SKILL.md`

**Auto-activates when:**

- Building product browse queries
- Implementing eco-filters
- Calculating eco-profile completeness
- Displaying eco-badges

**Provides:**

- Correct 13 eco-filter field names
- Completeness calculation formulas
- Tier classification logic (starter/verified/certified)
- Badge display priorities

**Value:** Consistent eco-profile handling across the platform

---

### 5. Revenue Calculations

**File:** `revenue-calculations/SKILL.md`

**Auto-activates when:**

- Calculating revenue or analytics
- Building seller analytics dashboards
- Working on admin financial reports
- Performing revenue aggregations

**Handles:**

- ORDER vs ORDERITEM subtotal ambiguity
- Shop-level revenue calculations
- Top products/sellers queries
- Month-over-month growth calculations

**Value:** Accurate financial calculations, avoids JOIN ambiguity

---

### 6. Admin Financial Queries

**File:** `admin-finance-queries/SKILL.md` (Session 18)

**Auto-activates when:**

- Building admin financial dashboards
- Monitoring platform-wide seller finances
- Managing payouts and balances
- Tracking Stripe Connect accounts
- Creating admin-only financial reports

**Provides:**

- Admin authorization pattern (`isAdmin()` checks)
- Platform-wide balance aggregation (SellerBalance)
- Payout management queries (SellerPayout)
- Seller financial drill-down patterns
- Stripe Connect status monitoring
- Enhanced transaction filtering
- Payment-to-payout linkage patterns

**Value:** Secure, consistent admin financial queries with proper authorization

---

## How Skills Work

### Model-Invoked (Automatic)

```
You: "Calculate shop revenue for last month"

Claude: [Detects revenue calculation task]
        [Activates revenue-calculations Skill]
        [Applies ORDER/ORDERITEM pattern automatically]
        [Uses correct fields: subtotal, not price]
        [Pre-fetches order IDs to avoid ambiguity]

Result: Correct query without you specifying the pattern
```

### Complementary to Documentation

**Skills provide:** Automatic expertise application
**Docs provide:** Comprehensive reference and understanding

**Together:**

- You read docs to understand architecture
- Claude uses Skills to apply patterns automatically
- You spend less time reminding Claude of critical details

## Testing Skills

To verify Skills are working:

**Test database-patterns:**

```
"Calculate total revenue for shop XYZ"
```

Expected: Uses `OrderItem.subtotal`, not `price`

**Test variant-image-mapping:**

```
"Create a product with 3 variants and custom images"
```

Expected: Applies image ID mapping pattern automatically

**Test seller-authorization:**

```
"Create a server action to delete a product"
```

Expected: Includes shop ownership verification

**Test eco-queries:**

```
"Show me products that are organic and vegan"
```

Expected: Uses correct filter field names

**Test revenue-calculations:**

```
"Get top 10 best-selling products for a shop"
```

Expected: Pre-fetches order IDs, avoids JOIN ambiguity

## Maintaining Skills

### When to Update

Update Skills when:

- Database schema changes (new fields, renamed fields)
- New critical patterns emerge (recurring bugs)
- Authorization requirements change
- New calculation formulas added

### Adding New Skills

1. Create directory: `.claude/skills/my-skill/`
2. Create `SKILL.md` with YAML frontmatter
3. Write clear `description` (triggers auto-detection)
4. Include examples and patterns
5. Test with relevant queries

### Best Practices

- **Keep focused:** One Skill, one purpose
- **Clear descriptions:** Help Claude detect when to use it
- **Include examples:** Show correct vs incorrect patterns
- **List auto-apply rules:** When should this activate?
- **Version control:** Track changes to patterns

## Skill Priority

If you can only maintain a few, prioritize:

1. **database-patterns** - Prevents most common errors
2. **variant-image-mapping** - Critical, causes production bugs
3. **seller-authorization** - Security critical
4. **revenue-calculations** - Financial accuracy critical
5. **admin-finance-queries** - Admin security & financial accuracy critical (Session 18)
6. **eco-queries** - Complex but lower priority

## Questions?

- **Skills not activating?** Check description clarity in SKILL.md
- **Skills conflicting?** Ensure descriptions are distinct
- **Need new Skill?** Look for patterns that cause recurring bugs

Skills make Claude smarter about Evercraft-specific patterns over time!
